// ============================================
// 通用时段预约引擎
// ============================================

const axios = require('axios');
const config = require('./config');

const DRY_RUN = process.argv.includes('--dry');
const TZ_OFFSET = '+08:00';

// ---------- HTTP 客户端 ----------

function buildHeaders() {
  const { credential, entity } = config;
  return {
    authorization: credential.token,
    'x-version': credential.clientVersion,
    'x-device-id': credential.deviceId,
    'x-os': 'WindowsUnknownx64',
    'x-timezone': '8',
    'web_xhr': '1',
    'xweb_xhr': '1',
    'content-type': 'application/json',
    'user-agent': credential.userAgent,
    referer: `https://servicewechat.com/${entity.namespace}/197/page-frame.html`,
    accept: '*/*',
    'accept-language': 'zh-CN,zh;q=0.9',
  };
}

const client = axios.create({
  baseURL: config.api.base,
  headers: buildHeaders(),
  timeout: config.runtime.requestTimeoutMs,
  validateStatus: () => true,
});

// ---------- 时间工具 ----------

const dayStartTs = (date) =>
  Math.floor(new Date(`${date}T00:00:00${TZ_OFFSET}`).getTime() / 1000);

const slotTs = (date, time) =>
  Math.floor(new Date(`${date}T${time}:00${TZ_OFFSET}`).getTime() / 1000);

const stamp = () =>
  new Date().toLocaleTimeString('zh-CN', { hour12: false });

// ---------- 三个核心动作 ----------

async function fetchWindows(day) {
  const { entity, api } = config;
  const params = {
    timestamp: Date.now(),
    appid: entity.namespace,
    class_id: entity.item,
    student_id: entity.actor,
    teacher_id: entity.counterparty,
    start_ts: dayStartTs(day),
  };
  const res = await client.get(api.paths.list, { params });
  if (res.status !== 200) {
    throw new Error(`fetch failed ${res.status}: ${JSON.stringify(res.data)}`);
  }
  return res.data.ranges || [];
}

async function precheck(day, window) {
  const { entity, api } = config;
  const body = {
    timestamp: Date.now(),
    appid: entity.namespace,
    student_id: entity.actor,
    teacher_id: entity.counterparty,
    class_id: entity.item,
    ranges: [
      {
        start_ts: dayStartTs(day),
        start_time: window.start_time,
        end_time: window.end_time,
      },
    ],
  };
  const res = await client.post(api.paths.precheck, body);
  return res.data;
}

async function commit(day, window) {
  const { entity, api } = config;
  const body = {
    timestamp: Date.now(),
    appid: entity.namespace,
    student_id: entity.actor,
    teacher_id: entity.counterparty,
    class_id: entity.item,
    ranges: [
      {
        start_ts: slotTs(day, window.start_time),
        end_ts: slotTs(day, window.end_time),
      },
    ],
  };
  return client.post(api.paths.commit, body);
}

// ---------- 偏好匹配 ----------

function pickPreferred(windows) {
  for (const pref of config.preference.windows) {
    const [start, end] = pref.split('-');
    const hit = windows.find(
      (w) => w.can_use && w.start_time === start && w.end_time === end
    );
    if (hit) return hit;
  }
  return null;
}

// ---------- 单日处理 ----------

async function handleDay(day) {
  const windows = await fetchWindows(day);
  const target = pickPreferred(windows);
  if (!target) return { done: false };

  console.log(
    `[${stamp()}] [${day}] 🎯 命中 ${target.start_time}-${target.end_time}`
  );

  if (DRY_RUN) {
    console.log(`[${stamp()}] [${day}] 🔸 dry-run，跳过提交`);
    return { done: true, dry: true };
  }

  const res = await commit(day, target);
  if (res.status === 200 || res.status === 201) {
    console.log(
      `[${stamp()}] [${day}] ✅ 已锁定 ${target.start_time}-${target.end_time}`
    );
    return { done: true };
  }
  console.log(
    `[${stamp()}] [${day}] ❌ 提交失败 ${res.status}: ${JSON.stringify(res.data)}`
  );
  return { done: false, error: true };
}

// ---------- 主循环 ----------

async function run() {
  const banner = [
    '====================================',
    ' 时段预约引擎',
    '====================================',
    ` 目标日期: ${config.preference.days.join(', ')}`,
    ` 偏好时段: ${config.preference.windows.join(', ')}`,
    ` 轮询间隔: ${config.runtime.pollIntervalMs}ms`,
    DRY_RUN ? ' 模式: DRY RUN（不会真的提交）' : '',
    '====================================',
    '',
  ].filter(Boolean);
  console.log(banner.join('\n'));

  const done = new Set();
  let errs = 0;
  let round = 0;

  while (true) {
    round++;
    const todo = config.preference.days.filter((d) => !done.has(d));
    if (todo.length === 0) {
      console.log('🎉 所有目标日期已处理完毕');
      break;
    }

    for (const day of todo) {
      try {
        const r = await handleDay(day);
        if (r.done) done.add(day);
        errs = 0;
      } catch (e) {
        errs++;
        console.log(`[${stamp()}] [${day}] ⚠️  ${e.message}`);
        if (errs >= config.runtime.maxConsecutiveErrors) {
          console.log(
            `\n💥 连续 ${errs} 次失败，凭证可能失效，已停止。请重抓 token 后再启动。`
          );
          process.exit(1);
        }
      }
    }

    if (round % 30 === 0) {
      console.log(
        `[${stamp()}] 已轮询 ${round} 次，待处理: ${todo.join(', ')}`
      );
    }

    await new Promise((r) => setTimeout(r, config.runtime.pollIntervalMs));
  }
}

run().catch((e) => {
  console.error('致命错误:', e);
  process.exit(1);
});

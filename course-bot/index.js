// ============================================
// Manban 1v1 课程自动预约脚本
// ============================================

const axios = require('axios');
const config = require('./config');

const BASE_URL = 'https://a.manbanapp.cn';
const DRY_RUN = process.argv.includes('--dry');

const HEADERS = {
  authorization: config.authorization,
  'x-version': config.version,
  'x-device-id': config.deviceId,
  'x-os': 'WindowsUnknownx64',
  'x-timezone': '8',
  'web_xhr': '1',
  'xweb_xhr': '1',
  'content-type': 'application/json',
  'user-agent': config.userAgent,
  referer: `https://servicewechat.com/${config.appid}/197/page-frame.html`,
  accept: '*/*',
  'accept-language': 'zh-CN,zh;q=0.9',
};

const http = axios.create({
  baseURL: BASE_URL,
  headers: HEADERS,
  timeout: 8000,
  validateStatus: () => true,
});

// ---------- 时间工具（北京时间）----------

// "YYYY-MM-DD" -> 当天 00:00 北京时间的 unix 秒
function dateToDayTs(dateStr) {
  return Math.floor(new Date(`${dateStr}T00:00:00+08:00`).getTime() / 1000);
}

// "YYYY-MM-DD" + "HH:MM" -> 该时刻北京时间的 unix 秒
function dateTimeToTs(dateStr, timeStr) {
  return Math.floor(new Date(`${dateStr}T${timeStr}:00+08:00`).getTime() / 1000);
}

function now() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

// ---------- 三个核心 API ----------

async function querySlots(dateStr) {
  const params = {
    timestamp: Date.now(),
    appid: config.appid,
    class_id: config.classId,
    student_id: config.studentId,
    teacher_id: config.teacherId,
    start_ts: dateToDayTs(dateStr),
  };
  const res = await http.get(
    '/mini_student/appointment/1v1_time_list/by_day',
    { params }
  );
  if (res.status !== 200) {
    throw new Error(`查时段失败 ${res.status}: ${JSON.stringify(res.data)}`);
  }
  return res.data.ranges || [];
}

async function checkConflict(dateStr, slot) {
  const body = {
    timestamp: Date.now(),
    appid: config.appid,
    student_id: config.studentId,
    teacher_id: config.teacherId,
    class_id: config.classId,
    ranges: [
      {
        start_ts: dateToDayTs(dateStr),
        start_time: slot.start_time,
        end_time: slot.end_time,
      },
    ],
  };
  const res = await http.post(
    '/mini_student/appointment/v2/check_conflict.json',
    body
  );
  return res.data;
}

async function submitBooking(dateStr, slot) {
  const body = {
    timestamp: Date.now(),
    appid: config.appid,
    student_id: config.studentId,
    teacher_id: config.teacherId,
    class_id: config.classId,
    ranges: [
      {
        start_ts: dateTimeToTs(dateStr, slot.start_time),
        end_ts: dateTimeToTs(dateStr, slot.end_time),
      },
    ],
  };
  return http.post('/mini_student/appointment/v3/submit_1v1.json', body);
}

// ---------- 偏好匹配 ----------

function findPreferredAvailable(ranges) {
  for (const pref of config.preferredSlots) {
    const [start, end] = pref.split('-');
    const found = ranges.find(
      (r) => r.can_use && r.start_time === start && r.end_time === end
    );
    if (found) return found;
  }
  return null;
}

// ---------- 主流程 ----------

async function tryBookOneDate(dateStr) {
  const ranges = await querySlots(dateStr);
  const slot = findPreferredAvailable(ranges);
  if (!slot) return { booked: false };

  console.log(
    `[${now()}] [${dateStr}] 🎯 发现可约: ${slot.start_time}-${slot.end_time}`
  );

  if (DRY_RUN) {
    console.log(
      `[${now()}] [${dateStr}] 🔸 dry-run 模式，跳过实际提交`
    );
    return { booked: true, dry: true };
  }

  const res = await submitBooking(dateStr, slot);
  if (res.status === 200 || res.status === 201) {
    console.log(
      `[${now()}] [${dateStr}] ✅ 预约成功 ${slot.start_time}-${slot.end_time}`
    );
    return { booked: true };
  }
  console.log(
    `[${now()}] [${dateStr}] ❌ 提交失败 ${res.status}: ${JSON.stringify(res.data)}`
  );
  return { booked: false, error: true };
}

async function main() {
  console.log('====================================');
  console.log(' Manban 课程自动预约');
  console.log('====================================');
  console.log(' 目标日期:', config.targetDates.join(', '));
  console.log(' 偏好时段:', config.preferredSlots.join(', '));
  console.log(` 轮询间隔: ${config.pollInterval}ms`);
  if (DRY_RUN) console.log(' 模式: DRY RUN（不会真的下单）');
  console.log('====================================\n');

  const success = new Set();
  let consecutiveErrors = 0;
  let round = 0;

  while (true) {
    round++;
    let pendingDays = config.targetDates.filter((d) => !success.has(d));
    if (pendingDays.length === 0) {
      console.log('🎉 所有目标日期都已搞定，退出');
      break;
    }

    for (const dateStr of pendingDays) {
      try {
        const r = await tryBookOneDate(dateStr);
        if (r.booked) success.add(dateStr);
        consecutiveErrors = 0;
      } catch (e) {
        consecutiveErrors++;
        console.log(`[${now()}] [${dateStr}] ⚠️  ${e.message}`);
        if (consecutiveErrors >= config.maxConsecutiveErrors) {
          console.log(
            `\n💥 连续 ${consecutiveErrors} 次失败，可能 token 过期，停止。请重新抓包更新 config.js`
          );
          process.exit(1);
        }
      }
    }

    // 安静日志：每 30 轮打一次心跳，避免控制台太吵
    if (round % 30 === 0) {
      console.log(
        `[${now()}] 已轮询 ${round} 次，待约: ${pendingDays.join(', ')}`
      );
    }

    await new Promise((r) => setTimeout(r, config.pollInterval));
  }
}

main().catch((e) => {
  console.error('致命错误:', e);
  process.exit(1);
});

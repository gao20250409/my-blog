// 单日时段查询工具（不提交）
// 用法: node peek.js 2026-06-15

const axios = require('axios');
const config = require('./config');

const day = process.argv[2];
if (!day) {
  console.log('用法: node peek.js YYYY-MM-DD');
  process.exit(1);
}

const TZ_OFFSET = '+08:00';
const dayStartTs = Math.floor(
  new Date(`${day}T00:00:00${TZ_OFFSET}`).getTime() / 1000
);

const { credential, entity, api } = config;

axios
  .get(`${api.base}${api.paths.list}`, {
    params: {
      timestamp: Date.now(),
      appid: entity.namespace,
      class_id: entity.item,
      student_id: entity.actor,
      teacher_id: entity.counterparty,
      start_ts: dayStartTs,
    },
    headers: {
      authorization: credential.token,
      'x-version': credential.clientVersion,
      'x-device-id': credential.deviceId,
      'x-os': 'WindowsUnknownx64',
      'x-timezone': '8',
      'web_xhr': '1',
      'xweb_xhr': '1',
      'user-agent': credential.userAgent,
      referer: `https://servicewechat.com/${entity.namespace}/197/page-frame.html`,
    },
  })
  .then((res) => {
    console.log(`\n=== ${day} 时段 ===`);
    const windows = res.data.ranges || [];
    if (!windows.length) {
      console.log('（这天没数据）');
      return;
    }
    for (const w of windows) {
      const flag = w.can_use ? '✅可约' : '❌已约';
      const note = w.error_msg ? `  (${w.error_msg})` : '';
      console.log(`  ${w.start_time}-${w.end_time}  ${flag}${note}`);
    }
    const free = windows.filter((w) => w.can_use).length;
    console.log(`\n小计: ${free} / ${windows.length}`);
  })
  .catch((e) => {
    console.error('查询失败:', e.response?.status, e.response?.data || e.message);
  });

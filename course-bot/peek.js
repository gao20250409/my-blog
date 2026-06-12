// 查询某天的可约时段并打印（不下单）
// 用法: node peek.js 2026-06-13

const axios = require('axios');
const config = require('./config');

const date = process.argv[2];
if (!date) {
  console.log('用法: node peek.js YYYY-MM-DD');
  console.log('例如: node peek.js 2026-06-13');
  process.exit(1);
}

const dayTs = Math.floor(new Date(`${date}T00:00:00+08:00`).getTime() / 1000);

axios
  .get('https://a.manbanapp.cn/mini_student/appointment/1v1_time_list/by_day', {
    params: {
      timestamp: Date.now(),
      appid: config.appid,
      class_id: config.classId,
      student_id: config.studentId,
      teacher_id: config.teacherId,
      start_ts: dayTs,
    },
    headers: {
      authorization: config.authorization,
      'x-version': config.version,
      'x-device-id': config.deviceId,
      'x-os': 'WindowsUnknownx64',
      'x-timezone': '8',
      'web_xhr': '1',
      'xweb_xhr': '1',
      'user-agent': config.userAgent,
      referer: `https://servicewechat.com/${config.appid}/197/page-frame.html`,
    },
  })
  .then((res) => {
    console.log(`\n=== ${date} 时段 ===`);
    const ranges = res.data.ranges || [];
    if (!ranges.length) {
      console.log('（这天没数据，可能还没放出）');
      return;
    }
    for (const r of ranges) {
      const flag = r.can_use ? '✅可约' : '❌已约';
      const note = r.error_msg ? `  (${r.error_msg})` : '';
      console.log(`  ${r.start_time}-${r.end_time}  ${flag}${note}`);
    }
    const free = ranges.filter((r) => r.can_use).length;
    console.log(`\n小计: ${free} / ${ranges.length} 个时段可约`);
  })
  .catch((e) => {
    console.error('查询失败:', e.response?.status, e.response?.data || e.message);
  });

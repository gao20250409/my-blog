# Manban 课程抢课脚本

## 用法

```bash
# 1. 装依赖（第一次跑）
npm install

# 2. 改 config.js 里的偏好（targetDates、preferredSlots）

# 3. 试跑（不会真下单，只看能不能找到可约时段）
npm run dry

# 4. 正式跑
npm start
```

## 注意

- `config.js` 里的 `authorization` 是从抓包来的，**等于账号密码，不要泄露**
- token 过期了脚本会自动停。重新抓包更新 `config.js` 的 `authorization` 即可
- 抢到一天就把那天从待办移除，剩下的继续抢
- 日志里出现 `🎯 发现可约` 就是逮到了，紧接着会提交

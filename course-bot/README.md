# 时段预约引擎

通用的资源时段抢约脚本骨架。基于 HTTP API 轮询 + 偏好匹配 + 自动提交。

## 用法

```bash
# 1. 装依赖
npm install

# 2. 编辑 config.js（接入点、凭证、目标实体、偏好）

# 3. 试跑（命中偏好时段不真提交）
npm run dry

# 4. 正式跑
npm start

# 单日查询（不提交）
node peek.js 2026-06-15
```

## 配置说明

| 字段 | 含义 |
|------|------|
| `api.base` / `api.paths` | 目标系统的接口路径 |
| `credential.token` | 鉴权凭证（敏感） |
| `credential.deviceId` / `clientVersion` / `userAgent` | 客户端指纹 |
| `entity.namespace` / `actor` / `counterparty` / `item` | 目标实体 ID |
| `preference.days` / `windows` | 偏好日期与时段 |
| `runtime.pollIntervalMs` | 轮询间隔 |
| `runtime.maxConsecutiveErrors` | 连续失败上限 |

## 安全

- `config.js` 含敏感凭证，已加入 `.gitignore`
- 不要把它推到任何公开仓库或聊天
- 凭证失效时脚本自动停（连续失败超过阈值），更新 `credential.token` 后重启

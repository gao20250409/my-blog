# 抓包与配置更新指南

> 这份文档说明如何从抓包获取鉴权信息并填入 `config.js`。
> 适用场景：首次配置、凭证失效后重抓、切换账号后更新。

---

## 一、什么时候要重新抓

| 情况 | 是否需要 |
|------|---------|
| 第一次用脚本 | ✅ |
| 跑脚本时连续报 401 / 403 | ✅ token 过期 |
| 日志显示"💥 连续 N 次失败" | ✅ 大概率凭证失效 |
| 换了目标资源 | ✅ entity 信息变了 |
| 换账号登录 | ✅ actor、token 都变 |
| 只改约课偏好 | ❌ 直接改 config |

---

## 二、准备工作（一次性）

### 2.1 装抓包工具

推荐 [Reqable](https://reqable.com) 桌面版。装好后选 **API 抓包** 模式，开启 **系统代理** 和 **自动调试**。

### 2.2 装根证书

启动后会引导装证书，选 **自动 → 现在安装**，Windows 弹窗点 **是**。

### 2.3 关掉系统代理类工具

⚠️ Clash / V2Ray 等会跟抓包工具抢系统代理，**抓包前必须先退出**。

---

## 三、抓包流程

1. 抓包工具启动，按 `Ctrl + G` 开始调试
2. 清空旧请求列表
3. 打开 PC 微信，进入目标小程序
4. **完整走一遍预约流程**：进入页面 → 选时段 → 点确定
5. 回抓包工具看请求

在请求列表里找域名是目标系统的（不是 `*.qq.com` 那些腾讯自家的），过滤出来即可。

---

## 四、提取 5 类信息

点开任意一条目标域名的请求，看请求 URL 和请求头。

### 4.1 凭证（最重要）

请求头里 `authorization: ...` 整段值复制。常见形态：

```
authorization: Basic <base64编码>
authorization: Bearer <jwt>
```

填入：
```js
credential: {
  token: '整段复制',
  ...
}
```

### 4.2 客户端指纹

```
x-device-id: <一串字符>
x-version:   <版本号>
user-agent:  Mozilla/... MiniProgramEnv/Windows ...
```

填入：
```js
credential: {
  deviceId: '...',
  clientVersion: '...',
  userAgent: '...',
}
```

### 4.3 实体 ID（从 URL 参数里抠）

查询请求的 URL 通常带这些参数：

```
?appid=<小程序 appid>
&class_id=<资源条目 ID>     → entity.item
&student_id=<操作者 ID>      → entity.actor
&teacher_id=<关联方 ID>      → entity.counterparty
&start_ts=<目标时间戳>
```

字段名各系统不同，看响应数据语义对应到 `entity` 上。

### 4.4 接入点（API 路径）

抓到的三个关键接口：

| 接口类型 | 触发时机 |
|---------|---------|
| 列表查询（GET） | 进入页面或翻页 |
| 冲突预检（POST） | 点确定预约时（前置）|
| 提交（POST） | 点确定预约时（核心）|

把它们的路径填到 `config.api.paths.{list, precheck, commit}`，域名填 `config.api.base`。

---

## 五、最快做法

抓包工具里 **右键请求 → 复制为 cURL**，得到一行包含全部 header 和 URL 的命令。粘到文本编辑器里挑信息最方便。

---

## 六、改完后验证

```bash
node peek.js 2026-XX-XX
```

- 输出时段列表 = 配置正确
- 401 / 403 = 凭证错或失效，重抓 token
- 空 ranges 或报错 = 实体 ID 错，对照 URL 检查
- Network Error = 域名错或网络问题

---

## 七、常见坑

### 7.1 抓不到 PC 微信请求

- 系统代理类工具没关 → 先退出
- 微信进程在抓包前就开着 → 杀掉重开，让它继承新代理
- 证书没装到位 → 抓包工具菜单"证书"检查状态

### 7.2 看到 SSL 错误（红色失败请求）

目标系统做了证书校验。多数小程序不做这种校验，遇到的话只能换手机 + Frida hook 方案，难度上一档。

### 7.3 凭证有 `exp` 字段

把 token 中间那段（`Basic ` 或 `Bearer ` 后面）粘到 [jwt.io](https://jwt.io) 解码，如果 payload 里有 `exp`，那是过期 unix 秒。到期前重抓。

### 7.4 请求带签名

URL 或 body 里有 `sign` / `signature` / `_token` 等字段，且每次值都不同：说明做了请求签名。需要反编译小程序代码（用 `wxappUnpacker`）找加密算法，工作量翻几倍。本骨架默认不处理签名场景。

---

## 八、安全提醒

- 🔒 **`config.js` 中的 token 等于账号密码**，别泄露
- 🔒 已加入 `.gitignore`，自己手改时也警惕
- 🔒 不要发到群、论坛、博客
- 🔒 分享脚本骨架前清空 `credential` 和 `entity`
- ⚖️ 自用、低频、非营利前提下风险可控；商业代抢、规模化、对外销售工具会触法
- ⚖️ 频率默认 800ms 偏温柔，能用就别改更激进的

---

## 九、排错对照

| 现象 | 原因 | 解决 |
|------|------|------|
| 401 | token 过期或错 | 重抓 |
| 403 | 风控了 | 等几小时或换网络 |
| 404 | 路径或 ID 错 | 检查 api.paths 与 entity |
| Network Error | 网络 / 域名变更 | 重抓看域名 |
| 总是空 ranges | 实体 ID 错 | 对照 URL 检查 |
| 启动就报错退出 | 触发 maxConsecutiveErrors | 八成 token 过期，重抓 |

---

## 十、字段速查表

```js
{
  api: {
    base: 'https://...',                 // 目标域名
    paths: {
      list:     '/.../list',             // GET 查时段
      precheck: '/.../check_conflict',   // POST 冲突预检
      commit:   '/.../submit',           // POST 提交
    },
  },
  credential: {
    token:         'Basic ... | Bearer ...',  // 请求头 authorization
    deviceId:      '...',                     // 请求头 x-device-id
    clientVersion: '...',                     // 请求头 x-version
    userAgent:     '...',                     // 请求头 user-agent
  },
  entity: {
    namespace:    'wx_appid',  // URL 参数 appid
    actor:        0,            // URL 参数 student_id 等
    counterparty: 0,            // URL 参数 teacher_id 等
    item:         0,            // URL 参数 class_id 等
  },
  preference: {
    days:    ['2026-XX-XX'],
    windows: ['HH:MM-HH:MM'],
  },
  runtime: {
    pollIntervalMs:       800,
    maxConsecutiveErrors: 10,
    requestTimeoutMs:     8000,
  },
}
```

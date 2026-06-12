# 抓包与配置更新指南

> 这份文档教你怎么从零抓包拿到鉴权信息，并把它填进 `config.js`。
> 适用场景：第一次配置脚本、token 过期后重新抓、换账号后更新。

---

## 一、什么时候需要抓包

| 情况 | 是否需要重新抓 |
|------|---------------|
| 第一次用脚本 | ✅ 必须 |
| 跑脚本时连续报 401 / 403 | ✅ token 过期了 |
| 脚本日志显示"💥 连续 10 次失败" | ✅ 大概率 token 过期 |
| 换了一个新教练/新课程 | ✅ classId、teacherId 变了 |
| 换了微信号登录 | ✅ studentId、token 都变了 |
| 只是改约课偏好（时段、日期） | ❌ 直接改 config.js |

---

## 二、准备工作（只做一次）

### 2.1 装 Reqable（电脑版）

1. 去官网 [reqable.com](https://reqable.com) 下载 **Windows 桌面版**
2. 安装时别勾选乱七八糟的工具栏
3. 第一次启动选择 **"API 抓包"** 模式 → 下一步
4. **系统代理** 和 **自动调试** 两个开关都打开

### 2.2 装根证书

启动 Reqable 后会弹"安装证书"窗口：

- 选 **"自动" → 现在安装**
- 弹出 Windows 安全警告，点 **"是"**
- 红 ✗ 变绿 ✓ 就装好了

> 装证书是为了 Reqable 能解 HTTPS 流量，不装就只看到一坨乱码。

### 2.3 退出 Clash / V2Ray 等代理工具

⚠️ **重要**：电脑上有梯子（Clash Verge、V2Rayn、Proxifier 等）会跟 Reqable 抢系统代理，导致 PC 微信的请求绕过抓包。

**抓包前先把梯子退出**（系统托盘右键 → 退出），抓完包再开回来。

---

## 三、抓包流程（每次重新抓 token 都走这套）

### 3.1 启动抓包

1. 打开 Reqable
2. 按 **Ctrl + G** 启动调试（或点右上角 ▶ 按钮）
3. 顶部显示 `Proxying on 192.168.x.x:9000` 表示在工作了

### 3.2 清空旧请求（可选但推荐）

点请求列表左上角的 🗑️ **垃圾桶图标**，清掉之前的杂请求，让待会的请求一目了然。

### 3.3 在 PC 微信里操作小程序

1. 打开 PC 微信
2. 进入预约小程序（最近使用过的小程序里能找到）
3. **完整走一遍预约流程**：
   - 进入课程详情页
   - 选一个**可约**的时段（绿色圆点的那种）
   - 点 **"确定预约"**
   - 真的预约上也行，不预约（点取消）也行——只要请求发出去就够

### 3.4 在 Reqable 里找三个关键请求

在请求列表里搜域名 `manbanapp.cn`，会出来一堆请求。你要找这三个：

| 接口 | 方法 | 路径关键字 | 啥时候触发 |
|------|------|-----------|-----------|
| 查时段 | GET | `1v1_time_list/by_day` | 进课程页 / 翻日期时 |
| 冲突检查 | POST | `v2/check_conflict.json` | 点确定预约时（先发这个）|
| 提交预约 | POST | `v3/submit_1v1.json` | 点确定预约时（紧跟着）|

只要拿到 **查时段（GET）** 那个请求里的 headers 就够了，因为三个接口共用同一套鉴权。

---

## 四、从请求里提取 5 样东西填进 config.js

点开任意一个 `manbanapp.cn` 的请求，看右侧 **请求头** 和 **请求 URL**。

### 4.1 `authorization`（最重要）

请求头里找 `authorization` 这一行，**整个值复制**，包括开头的 `Basic ` 三个字符。

```
authorization: Basic ZXlKaGJHY2lPaUpJVXpJMU5pSjk...一长串...PXg==
                ↑                                          ↑
              从这里                                     一直到这里
```

填到 config.js：

```js
authorization: 'Basic ZXlKaGJHY2lPaUpJVXpJMU5pSjk...PXg==',
```

### 4.2 `x-device-id`

请求头里 `x-device-id: xxxxxxxxxxxx`，复制 `:` 后面的值。

```js
deviceId: 'osini5ES0PAml-8sitePFByk3enMxw',
```

### 4.3 `x-version`

请求头里 `x-version: 2.5.2`，复制版本号。

```js
version: '2.5.2',
```

### 4.4 三个 ID（从 URL 里拿）

查时段那个 GET 请求的 URL 像这样：

```
https://a.manbanapp.cn/mini_student/appointment/1v1_time_list/by_day
?timestamp=1781234064000
&appid=wx1d6da30a241e568d
&class_id=1103990          ← classId
&student_id=4376903        ← studentId
&teacher_id=143991         ← teacherId
&start_ts=1781366400
```

从 URL 参数里抠出 `class_id`、`student_id`、`teacher_id`，填进 config.js：

```js
appid:     'wx1d6da30a241e568d',
studentId: 4376903,
teacherId: 143991,
classId:   1103990,
```

### 4.5 `user-agent`（一般不变，但建议同步更新）

请求头里 `user-agent: Mozilla/5.0 (Windows NT...XWEB/xxxxx`，整段复制。微信版本升级后这里会变。

```js
userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... XWEB/25046',
```

---

## 五、最快的做法：复制 cURL

懒得一项项抠？**右键请求 → 复制为 cURL**，会得到一行长命令，所有 headers 和 URL 都在里面：

```bash
curl 'https://a.manbanapp.cn/mini_student/appointment/1v1_time_list/by_day?...' \
  -H 'authorization: Basic ZXlKa...' \
  -H 'x-device-id: osini5...' \
  -H 'x-version: 2.5.2' \
  ...
```

把这段贴到任何文本编辑器里，一眼就能挑出要填的值。

---

## 六、改完 config.js 后验证

```bash
# 1. 测一下能不能拉到时段（不下单）
node peek.js 2026-06-15

# 输出有时段列表 = 成功
# 输出 401 / 403 = token 没复制对，重新抓
# 输出空 ranges 或报错 = ID 错了，对照 URL 检查 classId/studentId/teacherId
```

---

## 七、常见坑

### 7.1 抓不到 PC 微信的请求

- **梯子没关**：先关 Clash / V2Ray 等，让 Reqable 独占系统代理
- **微信进程在抓包前就开着**：杀掉微信再重开，否则它沿用旧的代理设置
- **证书没装到位**：Reqable → 顶部菜单"证书" → 检查状态是否绿勾

### 7.2 看到一堆 SSL 错误（红色失败请求）

小程序做了证书校验，Reqable 的伪造证书被拒。这种情况：

- 大多数小程序不做这种校验，包括满班这套，**正常情况下不会遇到**
- 真遇到了，PC 微信抓不了，要换手机 + Frida hook 方案，那就比较麻烦了

### 7.3 token 解析后看到 `exp` 字段

把 authorization 里 `Basic ` 后面那串 base64 解开，能看到 JSON。如果里面有 `"exp": 1234567890` 这种字段，那就是过期时间戳：

```bash
# 在线解码网站：https://jwt.io  (粘贴 base64 中间那段，不要 Basic 和末尾的 :)
```

把 exp 值丢进 https://www.epochconverter.com 看是几号。到期了就重抓。

如果没有 `exp` 字段（满班这套就没有），token 理论上不过期，但服务端可能有自己的失效逻辑，所以遇到 401 就重抓。

### 7.4 抢到课但小程序里看不到

- 看脚本日志，如果是 `✅ 预约成功 HTTP 201`，那就是真成了
- 在小程序里下拉刷新或退出重进
- 还看不到的话，登录小程序网页版（如果有）确认

---

## 八、安全提醒

- 🔒 **`config.js` 里的 authorization 等于账号密码**，泄露了别人能用你的身份操作
- 🔒 **不要把 config.js 上传 GitHub** ── 已经加了 `.gitignore`，但你自己手动改的时候要警惕
- 🔒 **不要发到任何聊天群、论坛、博客**
- 🔒 想分享脚本给别人用，把 `config.js` 里的敏感字段清空再分享
- ⚖️ 这种自动化属于灰色地带，自用问题不大，**别商业化、别给别人代抢**，会出事
- ⚖️ 频率别太疯。默认 800ms 一次，能用就别改更激进的。被人家发现 IP 异常，最坏会封号

---

## 九、快速排错对照表

| 现象 | 原因 | 解决 |
|------|------|------|
| `node peek.js` 报 401 | token 过期或复制错 | 重抓 → 更新 authorization |
| 报 403 | 风控了 | 等几小时，或换网络 |
| 报 404 | 路径或 ID 错 | 对照 URL 检查 classId 等 |
| `Network Error` | 网络问题 / 域名变更 | 重抓看 URL 域名是不是还是 `a.manbanapp.cn` |
| 总是 `(空 ranges)` | start_ts 那天没数据，或 ID 错 | 换个日期试，或检查 ID |
| 脚本一启动就疯狂报错退出 | maxConsecutiveErrors 触发 | 八成 token 过期，重抓 |

---

## 十、附录：完整的 config.js 字段对照

```js
{
  // === 鉴权（每次重抓都更新）===
  authorization: 'Basic ...',  // 来自请求头 authorization 整段

  // === 课程信息（换课程才需要更新）===
  appid: 'wx1d6da30a241e568d', // URL 参数 appid
  studentId: 4376903,           // URL 参数 student_id
  teacherId: 143991,            // URL 参数 teacher_id
  classId: 1103990,             // URL 参数 class_id

  // === 设备指纹（一般不变）===
  deviceId: '...',              // 请求头 x-device-id
  version: '2.5.2',             // 请求头 x-version
  userAgent: '...',             // 请求头 user-agent

  // === 抢课偏好（随时改）===
  targetDates: ['2026-06-15'],  // 想约的日期
  preferredSlots: ['09:00-10:00'], // 偏好时段，前面的优先级高

  // === 行为参数（想改再改）===
  pollInterval: 800,            // 多少毫秒查一次
  maxConsecutiveErrors: 10,     // 连续失败几次自动停
}
```

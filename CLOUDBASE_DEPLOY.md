# CloudBase 部署指南

这是将 `tennisport` 部署到腾讯 CloudBase（云开发 / 应用托管）的详细步骤。

## 1. 准备工作

- 代码已经推送到远程仓库：`https://gitee.com/wills-wu/tennisport.git`
- 已安装或可以访问腾讯云账户，并能进入 CloudBase 控制台
- 确认项目根目录下已有 `.gitignore`，已忽略 `.env` 和 `.vscode/*`

## 2. CloudBase 上新建应用

1. 打开 CloudBase 控制台：https://console.cloud.tencent.com/tcb
2. 进入“应用托管”或“Web 服务”页面
3. 点击“新建应用”或“新建 Web 服务”
4. 选择“从代码仓库部署”
5. 选择仓库类型：**Gitee**
6. 连接你的 Gitee 账号并授权 CloudBase 访问仓库
7. 选择仓库：`wills-wu/tennisport`
8. 选择分支：`main`

## 3. 填写构建与启动命令

在 CloudBase 创建应用时，填写以下字段：

- **构建命令**:
  ```bash
  npm ci && npm run build
  ```
- **启动命令**:
  ```bash
  node dist/boot.js
  ```
- **工作目录**: `.`
- **运行环境**: Node.js 18 或更高

> 注意：CloudBase 会自动注入 `PORT` 环境变量到运行时，无需手动设置。

## 4. 配置环境变量

### 4.1 构建时环境变量
这些变量需要在 `npm run build` 时可见，特别是前端 `VITE_` 变量：

- `VITE_APP_ID` = `19e1fc9c-81e2-870d-8000-0000f572a8a6`
- `VITE_KIMI_AUTH_URL` = `https://auth.kimi.com`

### 4.2 运行时环境变量
以下变量用于后端运行时：

- `APP_ID` = `19e1fc9c-81e2-870d-8000-0000f572a8a6`
- `APP_SECRET` = `DuR8qQ2XwUbWKGeueuwY3pbrGqL2jyiR`
- `DATABASE_URL` = `mysql://user:password@host:3306/database`
- `KIMI_AUTH_URL` = `https://auth.kimi.com`
- `KIMI_OPEN_URL` = `https://open.kimi.com`
- `OWNER_UNION_ID` = `cvvlju05jtdqt226olv0`

> 如果 `DATABASE_URL` 中的密码含特殊字符，例如 `@`、`:`、`/`，请先进行 URL 编码。

## 5. 部署并验证

1. 完成 CloudBase 应用创建后，点击“部署”或“重新部署”
2. 观察构建日志，确认以下步骤成功：
   - `npm ci && npm run build`
   - `esbuild api/boot.ts` 生成 `dist/boot.js`
   - `node dist/boot.js` 启动成功
3. 部署成功后，CloudBase 会给你一个访问域名
4. 访问该域名，确认页面正常加载

## 6. 自定义域名与 HTTPS

1. 在 CloudBase 应用的“域名管理”或“自定义域名”中添加你的域名
2. 按提示配置 DNS 记录（CNAME 或 A 记录）
3. 等待 DNS 生效，CloudBase 会自动申请 HTTPS 证书

## 7. 额外提醒

- `preview.yml` 仅用于 Cloud Studio 预览，不是生产部署配置
- 上线时不要提交含敏感信息的配置文件
- CloudBase 控制台里的“构建环境变量”与“运行时环境变量”都要分别设置

## 8. 若部署失败怎么办

如果部署失败，请把 CloudBase 部署日志的最后 20 行完整复制给我，我会继续帮你定位。

### 修改内容
1.精简了前端改为静态css，原来的docker部署时web占据内存太多。

2.优化了下载核心，支持列表下载时自动创建子文件夹。

3.前端网页访问需要密码验证。
### 快速部署 (Docker)
#### 1. 准备环境
确保你的服务器已安装 `Docker` 和 `Docker Compose`。
#### 2. 下载配置
新建一个目录，将 `docker-compose.deploy.yml` 复制进去。
#### 3. 编辑配置 (可选)
修改配置文件中的环境变量：
- `VIDBEE_AUTH_USER`: 登录用户名（留空则不开启验证）
- `VIDBEE_AUTH_PASSWORD`: 登录密码
- `VIDBEE_MAX_CONCURRENT`: 最大并行下载数（低配置建议设为 1）
#### 4. 一键启动
在目录下运行以下命令：
```bash
docker compose -f docker-compose.deploy.yml up -d
# Turbo Remote Cache 配置指南

## 方案对比

| 方案            | 优点             | 缺点                 | 推荐场景 |
| --------------- | ---------------- | -------------------- | -------- |
| **Vercel 官方** | 零配置，全球 CDN | 需要外网，数据第三方 | 快速测试 |
| **自建服务**    | 私有化，数据安全 | 需要运维，自己搭建   | 生产环境 |

---

## 方案 A：使用 Vercel Remote Cache（最简单）

### 1. 注册并获取 Token

访问 [Vercel](https://vercel.com/signup) 注册账号（免费），然后：

1. 登录后访问 [Account Tokens](https://vercel.com/account/tokens)
2. 点击 **Create Token**
3. 命名为 `jenkins-turbo-cache`
4. **复制 Token**（只显示一次，保存好）

### 2. 在 Jenkins 中配置环境变量

修改 `Jenkinsfile`，添加 Turbo Token：

```groovy
environment {
    // ... 其他环境变量

    // Turbo Remote Cache（使用 Jenkins Credentials）
    TURBO_TOKEN = credentials('turbo-remote-cache-token')
    TURBO_TELEMETRY_DISABLED = '1'  // 可选：禁用遥测
}
```

### 3. 在 Jenkins 中添加 Credential

1. Jenkins → Manage Jenkins → Credentials
2. 点击 `(global)` → Add Credentials
3. Kind: `Secret text`
4. Secret: `<粘贴你的 Vercel Token>`
5. ID: `turbo-remote-cache-token`
6. Description: `Turbo Remote Cache Token`

### 4. 验证

推送代码触发构建，查看日志：

```
>>> TURBO
>>> Remote caching enabled
>>> Full Turbo
```

---

## 方案 B：自建 Remote Cache 服务（推荐生产环境）

### 使用 `ducktors/turborepo-remote-cache`

这是一个开源的、兼容 Vercel 协议的自建缓存服务。

### 1. 在服务器上部署缓存服务

创建 `docker-compose.cache.yml`：

```yaml
version: '3.8'

services:
  turborepo-cache:
    image: ducktors/turborepo-remote-cache:latest
    container_name: turborepo-remote-cache
    restart: unless-stopped
    ports:
      - '3002:3000' # 避免与其他服务冲突
    environment:
      # 存储模式（local/s3/redis）
      STORAGE_PROVIDER: local
      STORAGE_PATH: /cache

      # 认证 Token（自定义一个强密码）
      TURBO_TOKEN: 'your-secret-token-here-change-this'

      # 日志级别
      LOG_LEVEL: info
    volumes:
      - ./turbo-cache:/cache
    networks:
      - puff-network

networks:
  puff-network:
    external: true
```

### 2. 启动缓存服务

```bash
# 在服务器上执行
docker-compose -f docker-compose.cache.yml up -d

# 验证服务运行
curl http://localhost:3002/health
# 应返回 {"status":"ok"}
```

### 3. 修改项目配置

在 `turbo.json` 中添加：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": {
    "enabled": true
  },
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    // ... 现有配置
  }
}
```

### 4. 修改 Jenkinsfile

```groovy
environment {
    // ... 其他环境变量

    // 自建 Turbo Remote Cache
    TURBO_API = 'http://107.173.87.162:3002'
    TURBO_TOKEN = credentials('turbo-remote-cache-token')
    TURBO_TEAM = 'puff-team'  // 自定义团队名
}
```

### 5. 在 Jenkins 中添加 Credential

1. Jenkins → Manage Jenkins → Credentials
2. 添加 Secret text
3. Secret: `<docker-compose.cache.yml 中的 TURBO_TOKEN>`
4. ID: `turbo-remote-cache-token`

---

## 验证缓存是否生效

### 首次构建（无缓存）

```bash
# 日志输出
packages/shared/ui build$ tsup
packages/shared/ui build: ✓ built in 2.5s
packages/shared/ui build: >>> TURBO
packages/shared/ui build: >>> Remote caching enabled
```

### 第二次构建（命中缓存）

```bash
# 日志输出
packages/shared/ui build: cache hit, replaying logs [REMOTE]
packages/shared/ui build: ✓ built in 2.5s (from cache)
```

注意 `[REMOTE]` 标记，表示从远程缓存读取。

---

## 缓存效果对比

| 场景                   | 无 Remote Cache    | 有 Remote Cache            |
| ---------------------- | ------------------ | -------------------------- |
| **首次构建**           | ~4 分钟            | ~4 分钟（写入缓存）        |
| **重复构建（无改动）** | ~4 分钟            | ~30 秒（全缓存命中） ✅    |
| **部分改动**           | ~3 分钟            | ~1 分钟（部分缓存命中） ✅ |
| **跨机器构建**         | 每台机器都重新构建 | 共享缓存 ✅                |

---

## 常见问题

### Q1: 缓存服务器磁盘占用太大怎么办？

A: 设置缓存过期策略：

```yaml
# docker-compose.cache.yml
environment:
  STORAGE_PROVIDER: local
  STORAGE_PATH: /cache
  MAX_CACHE_SIZE: 10GB # 最大缓存大小
  CACHE_TTL: 7d # 缓存保留 7 天
```

### Q2: 如何清空缓存？

```bash
# 方法 1: 删除缓存目录
docker exec turborepo-remote-cache rm -rf /cache/*

# 方法 2: 重启容器并删除 volume
docker-compose -f docker-compose.cache.yml down -v
docker-compose -f docker-compose.cache.yml up -d
```

### Q3: 缓存服务器挂了怎么办？

Turbo 会自动降级为本地缓存，不影响构建：

```
>>> TURBO
>>> Remote caching unavailable, falling back to local cache
```

---

## 性能优化建议

### 1. 使用 Redis 存储（高并发场景）

```yaml
services:
  redis:
    image: redis:alpine
    restart: unless-stopped

  turborepo-cache:
    environment:
      STORAGE_PROVIDER: redis
      REDIS_URL: redis://redis:6379
```

### 2. 使用对象存储（云端场景）

```yaml
environment:
  STORAGE_PROVIDER: s3
  S3_ENDPOINT: https://s3.amazonaws.com
  S3_ACCESS_KEY: your-access-key
  S3_SECRET_KEY: your-secret-key
  S3_BUCKET: turborepo-cache
```

---

## 安全建议

1. **使用强 Token** - 至少 32 位随机字符串
2. **限制访问** - 在防火墙中只允许 Jenkins IP 访问缓存服务
3. **HTTPS** - 生产环境建议配置 Nginx + SSL
4. **定期备份** - 备份 `/cache` 目录（可选）

---

## 推荐配置（生产环境）

```yaml
# docker-compose.cache.yml（完整版）
version: '3.8'

services:
  turborepo-cache:
    image: ducktors/turborepo-remote-cache:latest
    container_name: turborepo-remote-cache
    restart: unless-stopped
    ports:
      - '127.0.0.1:3002:3000' # 只监听本地（Nginx 反向代理）
    environment:
      STORAGE_PROVIDER: local
      STORAGE_PATH: /cache
      TURBO_TOKEN: '${TURBO_CACHE_TOKEN}' # 从环境变量读取
      LOG_LEVEL: info
      MAX_CACHE_SIZE: 20GB
      CACHE_TTL: 14d
    volumes:
      - ./turbo-cache:/cache
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - puff-network

networks:
  puff-network:
    external: true
```

启动：

```bash
# 创建 .env 文件
echo "TURBO_CACHE_TOKEN=$(openssl rand -hex 32)" > .env.cache

# 启动服务
docker-compose -f docker-compose.cache.yml --env-file .env.cache up -d
```

---

## 总结

- **快速测试**：用 Vercel 官方服务（5 分钟配置完成）
- **生产环境**：自建服务器（完全私有化，数据安全）
- **预期效果**：构建时间从 4 分钟降到 30 秒（重复构建）

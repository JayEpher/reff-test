# Nginx 配置管理策略

## 配置分层架构

本项目采用**分层配置**策略，将配置分为两个层次：

```
┌─────────────────────────────────────┐
│   服务器层 (基础设施配置)           │
│   - SSL/TLS 证书                    │
│   - 负载均衡                        │
│   - 反向代理                        │
│   - 域名路由                        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   应用层 (容器内配置) ✅ 当前方式    │
│   - SPA 路由规则                    │
│   - 静态资源缓存                    │
│   - Gzip 压缩                       │
│   - 安全头设置                      │
│   - 健康检查端点                    │
└─────────────────────────────────────┘
```

## 为什么选择当前方式（配置在仓库）？

### 1. **配置即代码（Infrastructure as Code）**

✅ **优势：**
- 配置跟随代码版本管理
- 每次代码变更都有对应的配置版本
- 易于审查、回滚和追溯

**示例：**
```bash
# 查看配置变更历史
git log docker/nginx/activities.conf

# 回滚到特定版本
git checkout abc123 docker/nginx/activities.conf
```

### 2. **环境一致性**

✅ **保证：**
- 开发、测试、生产环境使用**完全相同的配置**
- 避免"在我机器上能跑"的问题
- 镜像包含完整的运行时环境

**示例：**
```bash
# 同一个镜像可以在任何环境运行
docker run 107.173.87.162:8001/puff/activities:v1.0.0
```

### 3. **自动化部署**

✅ **实现：**
- Jenkins 构建时自动打包配置
- 无需手动同步配置到服务器
- 部署即生效，零手动操作

**流程：**
```
代码提交 → Jenkins 构建 → 镜像包含配置 → 部署 → 配置生效
```

### 4. **原子性回滚**

✅ **能力：**
- 回滚镜像版本 = 回滚代码 + 配置
- 一条命令完成回滚
- 不会出现代码和配置不匹配

**示例：**
```bash
# 回滚到上一个版本（代码 + 配置）
docker-compose up -d activities:v1.0.0
```

## 配置文件说明

### 当前配置结构

```
docker/nginx/
├── spa-base.conf           # 通用配置模板（参考）
├── activities.conf         # activities 应用配置
├── admin-system-1.conf     # admin-system-1 应用配置
└── admin-system-3.conf     # admin-system-3 应用配置
```

### 配置内容

每个应用的配置包含：

1. **SPA 路由支持**
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

2. **静态资源缓存**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Gzip 压缩**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/javascript;
   ```

4. **健康检查端点**
   ```nginx
   location /health {
       return 200 "healthy\n";
   }
   ```

## 服务器层配置（可选）

如果需要在服务器上添加反向代理层，可以使用以下配置：

### 场景 1: 单域名多应用

```nginx
# /etc/nginx/sites-available/puff-apps.conf

server {
    listen 80;
    server_name your-domain.com;

    # activities 应用
    location /activities/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # admin-system-1 应用
    location /admin-1/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # admin-system-3 应用
    location /admin-3/ {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # dapp 应用
    location /dapp/ {
        proxy_pass http://localhost:3004/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 场景 2: 多子域名

```nginx
# activities.your-domain.com
server {
    listen 80;
    server_name activities.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}

# admin.your-domain.com
server {
    listen 80;
    server_name admin.your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
    }
}
```

### 场景 3: HTTPS + SSL

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 反向代理到容器
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 修改配置的流程

### 1. 修改应用配置（推荐）

```bash
# 1. 修改配置文件
vim docker/nginx/activities.conf

# 2. 提交变更
git add docker/nginx/activities.conf
git commit -m "feat: update nginx config for activities"

# 3. 推送到 GitHub
git push origin main

# 4. Jenkins 自动触发构建
# 5. 新镜像包含更新后的配置
# 6. 部署新镜像，配置生效
```

**优势：** 有记录、可回滚、自动化

### 2. 热更新服务器配置（不推荐应用层配置）

```bash
# 1. 在服务器上修改配置
sudo vim /etc/nginx/sites-available/puff-apps.conf

# 2. 测试配置
sudo nginx -t

# 3. 重载 nginx
sudo nginx -s reload
```

**劣势：** 无记录、难回滚、手动操作

## 最佳实践

### ✅ 推荐做法

1. **应用特定配置放在仓库**
   - SPA 路由规则
   - API 代理配置
   - 缓存策略
   - 安全头

2. **基础设施配置放在服务器**
   - SSL 证书
   - 负载均衡
   - 多域名路由
   - WAF 规则

3. **使用环境变量动态配置**
   ```nginx
   # 使用 envsubst 替换变量
   location /api {
       proxy_pass ${API_ENDPOINT};
   }
   ```

4. **配置变更走 PR 流程**
   - 团队成员可以审查配置变更
   - 避免直接修改生产配置
   - 保留变更历史

### ❌ 避免做法

1. **不要在服务器手动修改应用配置**
   - 会导致配置漂移
   - 难以追踪变更
   - 回滚时可能遗漏

2. **不要在配置中硬编码敏感信息**
   - 使用环境变量
   - 或使用 secrets 管理

3. **不要为每个环境维护不同的配置**
   - 使用环境变量区分
   - 保持配置一致性

## 故障排查

### 如何查看容器内的 nginx 配置？

```bash
# 查看运行中的配置
docker exec puff-activities-development cat /etc/nginx/conf.d/default.conf

# 进入容器调试
docker exec -it puff-activities-development sh

# 测试 nginx 配置
docker exec puff-activities-development nginx -t

# 重载配置（如果修改了配置）
docker exec puff-activities-development nginx -s reload
```

### 如何临时修改配置测试？

```bash
# 1. 进入容器
docker exec -it puff-activities-development sh

# 2. 修改配置
vi /etc/nginx/conf.d/default.conf

# 3. 测试配置
nginx -t

# 4. 重载配置
nginx -s reload

# 注意：容器重启后修改会丢失
```

### 如何永久修改配置？

```bash
# 1. 修改仓库中的配置文件
vim docker/nginx/activities.conf

# 2. 提交并推送
git commit -am "fix: update nginx config"
git push

# 3. Jenkins 重新构建镜像
# 4. 部署新镜像
```

## 总结

### 当前方式的优势

✅ **配置即代码** - 版本管理、易于追溯  
✅ **环境一致** - 避免配置漂移  
✅ **自动化部署** - 无需手动同步  
✅ **原子性回滚** - 代码+配置一起回滚  
✅ **团队协作** - 配置变更走 PR 流程  

### 何时需要服务器层配置

- 🔒 **SSL/TLS 证书管理**
- 🌐 **多域名/子域名路由**
- ⚖️ **负载均衡配置**
- 🛡️ **WAF/安全规则**
- 📊 **全局日志和监控**

### 推荐架构

```
┌─────────────────────────┐
│   域名/SSL (服务器层)    │  ← 基础设施配置
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   反向代理 (可选)        │  ← 路由和负载均衡
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   应用层 (容器内) ✅     │  ← 应用特定配置（当前方式）
└─────────────────────────┘
```

**结论：当前方式（配置在仓库）是正确的选择，保持不变即可。**

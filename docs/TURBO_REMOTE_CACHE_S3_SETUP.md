# Turbo Remote Cache + S3 部署指南

## 概述

此方案适用于：

- 磁盘空间紧张，需要使用对象存储
- 多服务器共享缓存
- 需要私有化部署，不想依赖 Vercel

---

## 架构

```
Jenkins 构建 → Turbo Remote Cache 服务 → S3 存储 (阿里云 OSS / 腾讯云 COS)
                  (仅占用内存)            (无限空间)
```

---

## 方案对比

| 方案                  | 成本   | 磁盘占用 | 速度       | 运维 |
| --------------------- | ------ | -------- | ---------- | ---- |
| **Vercel 免费版**     | 免费   | 0        | ⭐⭐⭐⭐⭐ | 无   |
| **自建 + 阿里云 OSS** | ¥25/月 | 0        | ⭐⭐⭐⭐   | 低   |
| **自建 + 腾讯云 COS** | ¥20/月 | 0        | ⭐⭐⭐⭐   | 低   |

---

## 部署步骤

### 步骤 1: 创建对象存储（以阿里云 OSS 为例）

#### 1.1 创建 Bucket

1. 登录 [阿里云 OSS 控制台](https://oss.console.aliyun.com/)
2. 点击「创建 Bucket」
3. 配置：
   - **Bucket 名称**: `puff-turbo-cache`
   - **地域**: 华北2（北京）或离你服务器最近的
   - **读写权限**: 私有（Private）
   - **存储类型**: 标准存储
4. 创建完成

#### 1.2 创建 AccessKey

1. 进入 [RAM 访问控制](https://ram.console.aliyun.com/users)
2. 创建用户：
   - 用户名: `turbo-cache`
   - 访问方式: **编程访问**（勾选）
3. 添加权限: `AliyunOSSFullAccess`
4. 保存 AccessKey:
   - **AccessKeyId**: `LTAI5...`
   - **AccessKeySecret**: `xxx...`（只显示一次，务必保存）

---

### 步骤 2: 配置环境变量

#### 2.1 在服务器上创建 `.env.turbo-cache` 文件

```bash
# 复制模板
cp .env.turbo-cache.example .env.turbo-cache

# 编辑配置
nano .env.turbo-cache
```

#### 2.2 填写以下内容

```bash
# S3 凭证（阿里云 OSS）
S3_ACCESS_KEY=LTAI5txxxxxxxxxxxxxxxxxx
S3_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_REGION=cn-beijing
S3_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
S3_BUCKET=puff-turbo-cache

# 路径前缀（可选）
S3_PREFIX=

# Turbo 认证 Token（生成一个随机字符串）
TURBO_TOKEN=<生成的 Token>
```

#### 2.3 生成 TURBO_TOKEN

```bash
# 生成随机 Token
openssl rand -hex 32

# 复制输出，填入 .env.turbo-cache 的 TURBO_TOKEN
```

---

### 步骤 3: 启动 Turbo Remote Cache 服务

```bash
# 1. 确保 Docker 网络存在
docker network create puff-network || true

# 2. 启动服务
cd /path/to/your/project
docker-compose -f docker-compose.turbo-cache.yml --env-file .env.turbo-cache up -d

# 3. 查看日志
docker logs -f turborepo-remote-cache

# 应该看到：
# Server listening on port 3000

# 4. 验证服务
curl http://localhost:3002/health
# 应返回: {"status":"ok"}

# 5. 测试 S3 连接
docker logs turborepo-remote-cache | grep -i error
# 应该没有错误
```

---

### 步骤 4: 在 Jenkins 中配置

#### 4.1 添加 Credential

1. Jenkins → Manage Jenkins → Credentials
2. 点击 `(global)` → Add Credentials
3. 配置：
   - **Kind**: Secret text
   - **Secret**: `<粘贴 .env.turbo-cache 中的 TURBO_TOKEN>`
   - **ID**: `turbo-remote-cache-token`
   - **Description**: Turbo Remote Cache Token (Self-hosted)
4. 保存

#### 4.2 替换 Jenkinsfile

```bash
# 备份现有 Jenkinsfile
mv Jenkinsfile Jenkinsfile.vercel.bak

# 使用 S3 版本
mv Jenkinsfile.s3 Jenkinsfile

# 提交并推送
git add Jenkinsfile
git commit -m "feat: switch to self-hosted Turbo Remote Cache with S3"
git push origin main
```

---

### 步骤 5: 验证缓存效果

#### 5.1 触发构建

在 Jenkins 中手动触发一次构建（构建 #40）

#### 5.2 查看日志

**预期日志：**

```bash
#23 2.891 • Remote caching enabled  ← 不再是 disabled
#23 2.934 @puff/ui:build: cache miss, executing 3661b6e68f40eec6
```

第一次构建会上传缓存到 S3。

#### 5.3 第二次构建

再触发一次构建（构建 #41），应该看到：

```bash
#23 2.891 • Remote caching enabled
#23 2.934 @puff/ui:build: cache hit, replaying logs [REMOTE]  ← 命中！
#23 2.937 @puff/types:build: cache hit, replaying logs [REMOTE]
#23 2.954 @puff/utils:build: cache hit, replaying logs [REMOTE]
```

**构建时间从 45 秒降到 ~5 秒！** ✅

---

## 成本估算

### 阿里云 OSS

| 项目     | 用量（月） | 单价       | 月成本       |
| -------- | ---------- | ---------- | ------------ |
| 存储     | 5GB        | ¥0.12/GB   | ¥0.6         |
| 下载流量 | 50GB       | ¥0.50/GB   | ¥25          |
| API 请求 | 10 万次    | ¥0.01/万次 | ¥0.1         |
| **总计** | -          | -          | **¥25.7/月** |

### 腾讯云 COS（更便宜）

| 项目 | 月成本     |
| ---- | ---------- |
| 总计 | **¥20/月** |

---

## 腾讯云 COS 配置

如果使用腾讯云 COS（更便宜），修改 `.env.turbo-cache`：

```bash
# 腾讯云 COS 配置
S3_ACCESS_KEY=AKIDxxxx-replace-with-your-real-key-xxxx
S3_SECRET_KEY=xxxx-replace-with-your-secret-key-xxxx
S3_REGION=ap-beijing
S3_ENDPOINT=https://cos.ap-beijing.myqcloud.com
S3_BUCKET=puff-turbo-cache-1234567890  # 需要全局唯一
S3_PREFIX=

TURBO_TOKEN=<生成的 Token>
```

---

## 常见问题

### Q1: 如何验证 S3 连接？

```bash
# 查看服务日志
docker logs turborepo-remote-cache | grep -i s3

# 应该没有错误，或看到类似：
# Connected to S3 bucket: puff-turbo-cache
```

### Q2: 缓存存储在哪里？

在 S3 Bucket 的根目录（或 S3_PREFIX 指定的路径）：

```
puff-turbo-cache/
  └── <hash1>
  └── <hash2>
  └── ...
```

### Q3: 如何清空缓存？

**方法 1：通过 OSS 控制台**

- 登录阿里云 OSS 控制台
- 进入 Bucket → 文件管理
- 删除所有文件

**方法 2：通过命令行**

```bash
# 需要安装 ossutil
# https://help.aliyun.com/document_detail/120075.html

ossutil rm oss://puff-turbo-cache/ -r -f
```

### Q4: 如何监控缓存大小和费用？

- 登录阿里云 OSS 控制台
- 进入 Bucket → 数据统计
- 查看存储量、流量、请求次数

---

## 切换回 Vercel

如果想切换回 Vercel：

```bash
# 恢复 Vercel 版本
mv Jenkinsfile Jenkinsfile.s3.bak
mv Jenkinsfile.vercel.bak Jenkinsfile

# 提交并推送
git add Jenkinsfile
git commit -m "feat: switch back to Vercel Remote Cache"
git push origin main

# 停止自建服务
docker-compose -f docker-compose.turbo-cache.yml down
```

---

## 总结

### 优点

- ✅ 不占用本地磁盘
- ✅ 完全私有化
- ✅ 可扩展到多服务器
- ✅ 成本可控（¥20-25/月）

### 缺点

- ❌ 需要额外运维（维护服务）
- ❌ 需要付费（S3 存储 + 流量）
- ❌ 比 Vercel 慢一点点（国内网络）

### 推荐

- **小团队/个人项目**：用 Vercel 免费版
- **公司项目/需要私有化**：用自建 + S3

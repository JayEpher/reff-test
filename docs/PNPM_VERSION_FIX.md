# pnpm 版本不兼容问题修复

## 问题描述

Jenkins 构建失败，错误信息：

```
ERR_PNPM_LOCKFILE_BREAKING_CHANGE  Lockfile /app/pnpm-lock.yaml not compatible with current pnpm

Run with the --force parameter to recreate the lockfile.
```

## 根本原因

**版本不匹配：**
- 本地开发环境使用：`pnpm@9.15.9`（lockfileVersion: 9.0）
- Dockerfile 中使用：`pnpm@8.15.1`（支持 lockfileVersion: 6.x）
- pnpm 9.x 的 lockfile 格式与 8.x **完全不兼容**

## 解决方案

### 已应用的修复

**1. 更新 Dockerfile.universal**

```diff
- RUN corepack enable && corepack prepare pnpm@8.15.1 --activate
+ RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
```

**2. 更新 package.json**

```diff
- "packageManager": "pnpm@8.15.1+sha256.245fe901f8e7fa8782d7f17d32b6a83995e2ae03984cb5b62b8949bfdc27c7b5",
+ "packageManager": "pnpm@9.15.9",
```

### 为什么选择升级而不是降级？

✅ **推荐升级到 pnpm 9.x 的原因：**

1. **性能提升**
   - pnpm 9.x 安装速度更快
   - 更好的磁盘空间利用率
   - 改进的依赖解析算法

2. **更好的 Monorepo 支持**
   - 改进的 workspace 协议
   - 更好的 peer dependencies 处理
   - 更快的 workspace 间依赖链接

3. **向后兼容性**
   - pnpm 9.x 可以处理大多数 8.x 的配置
   - lockfile 格式更稳定，不会频繁变化

4. **已有 9.x lockfile**
   - 本地已经生成了 9.x 格式的 pnpm-lock.yaml
   - 回退需要删除并重新生成 lockfile
   - 所有团队成员需要同步降级

❌ **不推荐降级到 pnpm 8.x：**

1. 需要删除现有 lockfile 并重新生成
2. 所有开发人员需要统一降级版本
3. 失去 pnpm 9.x 的性能和功能改进
4. 未来还是需要升级

## 版本兼容性说明

### pnpm lockfile 版本历史

| pnpm 版本 | lockfileVersion | 兼容性 |
|-----------|----------------|--------|
| 8.x | 6.x | ❌ 不兼容 9.x |
| 9.x | 9.0 | ❌ 不兼容 8.x |

**重要：** pnpm 主版本之间的 lockfile 格式**不向后兼容**。

### 如何避免此类问题

**1. 使用 package.json 的 packageManager 字段**

```json
{
  "packageManager": "pnpm@9.15.9"
}
```

当团队成员运行 `corepack enable` 后，会自动使用指定版本的 pnpm。

**2. 在 Dockerfile 中读取 package.json 版本**

```dockerfile
# 读取 package.json 中的 pnpm 版本
RUN PNPM_VERSION=$(node -p "require('./package.json').packageManager.split('@')[1]") && \
    corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate
```

但这需要先复制 package.json 到镜像中。

**3. 使用 .npmrc 或 .pnpmfile.cjs 锁定版本**

在项目根目录创建 `.npmrc`：

```ini
package-manager-strict=true
```

这会强制使用 package.json 中指定的包管理器版本。

**4. CI/CD 中显式检查版本**

在 Jenkinsfile 中添加版本检查：

```groovy
stage('Validate pnpm Version') {
    steps {
        script {
            def expectedVersion = sh(
                script: "node -p \"require('./package.json').packageManager.split('@')[1]\"",
                returnStdout: true
            ).trim()
            
            echo "期望的 pnpm 版本: ${expectedVersion}"
            echo "请确保 Dockerfile 使用相同版本"
        }
    }
}
```

## 验证修复

### 1. 本地验证

```bash
# 检查 pnpm 版本
pnpm --version
# 应该输出: 9.15.9

# 检查 lockfile 版本
head -1 pnpm-lock.yaml
# 应该输出: lockfileVersion: '9.0'

# 测试构建 Docker 镜像
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=activities \
  --build-arg BUILD_ENV=production \
  --target production-static \
  -t test/activities:v1 \
  -f Dockerfile.universal \
  .
```

### 2. Jenkins 验证

提交代码后，Jenkins 应该能成功完成以下步骤：

1. ✅ 拉取代码
2. ✅ 构建 Docker 镜像
3. ✅ pnpm install --frozen-lockfile（不再报错）
4. ✅ 构建应用
5. ✅ 推送到 Harbor

## 团队协作建议

### 通知团队

发送通知给所有开发人员：

```
⚠️ pnpm 版本更新通知

项目已升级到 pnpm 9.15.9，请所有团队成员更新：

1. 启用 corepack（如果未启用）：
   corepack enable

2. 激活项目指定的 pnpm 版本：
   corepack prepare pnpm@9.15.9 --activate

3. 清理并重新安装依赖：
   rm -rf node_modules
   pnpm install

4. 验证版本：
   pnpm --version
   # 应该输出: 9.15.9
```

### 添加到文档

更新项目的 README.md 或 GETTING_STARTED.md：

```markdown
## 环境要求

- Node.js: 20.x
- pnpm: 9.15.9（通过 corepack 管理）

## 安装步骤

1. 启用 corepack：
   ```bash
   corepack enable
   ```

2. 安装依赖（会自动使用正确的 pnpm 版本）：
   ```bash
   pnpm install
   ```
```

## 相关文件

- `Dockerfile.universal` - Docker 构建配置
- `package.json` - 项目配置（包含 packageManager 字段）
- `pnpm-lock.yaml` - 依赖锁定文件（lockfileVersion: 9.0）
- `.npmrc` - npm/pnpm 配置

## 参考资料

- [pnpm 版本历史](https://github.com/pnpm/pnpm/releases)
- [pnpm 9.x 迁移指南](https://pnpm.io/9.x/migration)
- [corepack 文档](https://nodejs.org/api/corepack.html)

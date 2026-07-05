# Jenkins 配置指南 - reff-test 项目

## 项目信息

- **Git 仓库**: `git@github.com:JayEpher/reff-test.git`
- **仓库类型**: GitHub SSH
- **项目类型**: Monorepo (pnpm workspace)

---

## 快速配置步骤

### 步骤 1: 配置 SSH 凭证（必需）

由于使用 SSH 地址（`git@github.com`），需要在 Jenkins 中配置 SSH 凭证。

1. **生成 SSH 密钥**（如果还没有）
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   # 默认保存在 ~/.ssh/id_rsa
   ```

2. **添加公钥到 GitHub**
   - 复制公钥内容：
     ```bash
     cat ~/.ssh/id_rsa.pub
     ```
   - 登录 GitHub → Settings → SSH and GPG keys
   - 点击 "New SSH key"
   - 粘贴公钥内容并保存

3. **在 Jenkins 中添加 SSH 凭证**
   - 进入 Jenkins 首页
   - 点击 "Manage Jenkins" → "Manage Credentials"
   - 点击 "(global)" → "Add Credentials"
   - 配置如下：
     ```
     Kind: SSH Username with private key
     ID: github-ssh-key
     Username: git
     Private Key: Enter directly
     (粘贴私钥内容，即 ~/.ssh/id_rsa 的内容)
     Passphrase: (如果设置了密码则填写)
     ```
   - 点击 "OK" 保存

### 步骤 2: 创建 Pipeline 项目

1. **新建项目**
   - Jenkins 首页 → "新建任务"
   - 输入名称：`reff-test-checkout`（或任意名称）
   - 选择 "Pipeline"
   - 点击 "确定"

2. **配置 Pipeline**

   #### 方式 A: 使用仓库中的 Jenkinsfile（推荐）
   
   在 "Pipeline" 部分配置：
   ```
   Definition: Pipeline script from SCM
   SCM: Git
   
   Repository URL: git@github.com:JayEpher/reff-test.git
   
   Credentials: 选择刚才创建的 "github-ssh-key"
   
   Branches to build: */main
   (如果您的默认分支是 master，则填写 */master)
   
   Script Path: Jenkinsfile
   ```

   #### 方式 B: 直接粘贴脚本
   
   在 "Pipeline" 部分配置：
   ```
   Definition: Pipeline script
   ```
   然后将 Jenkinsfile 的内容粘贴到脚本框中。

3. **保存配置**
   - 点击 "保存"

### 步骤 3: 运行构建

1. 点击 "立即构建"
2. 点击构建编号（如 #1）
3. 点击 "Console Output" 查看日志

---

## Jenkinsfile 说明

### 简单版 (Jenkinsfile)

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm  // 自动使用 Jenkins 配置的 Git 信息
                sh 'git log -1'
            }
        }

        stage('Show Info') {
            steps {
                sh 'pwd'
                sh 'ls -la'
            }
        }
    }
}
```

**特点**：
- ✅ 使用 `checkout scm`，无需硬编码仓库地址
- ✅ 自动使用 Jenkins 项目配置中的凭证
- ✅ 简单明了，适合快速测试

### 详细版 (Jenkinsfile.detailed)

**特点**：
- ✅ 支持参数化构建（选择分支）
- ✅ 显示详细的 Git 信息
- ✅ 检查项目结构
- ✅ 检查环境（Node.js、pnpm 等）
- ✅ 更详细的日志输出

**使用**：将 Script Path 改为 `Jenkinsfile.detailed`

---

## 验证 SSH 连接

在配置前，可以先在 Jenkins 服务器上测试 SSH 连接：

```bash
# 在 Jenkins 服务器上执行
ssh -T git@github.com

# 成功的响应：
# Hi JayEpher! You've successfully authenticated, but GitHub does not provide shell access.
```

如果连接失败：
1. 检查 SSH 密钥是否正确
2. 检查 GitHub 是否添加了公钥
3. 检查服务器防火墙设置

---

## 常见问题

### 1. Permission denied (publickey)

**原因**：Jenkins 无法访问 SSH 私钥或密钥未添加到 GitHub

**解决方案**：
1. 确认 Jenkins 中配置的 SSH 凭证正确
2. 确认 GitHub 已添加对应的公钥
3. 在 Jenkins 服务器上测试 SSH 连接

### 2. Host key verification failed

**原因**：首次连接 GitHub，SSH 需要验证 host key

**解决方案**：
在 Jenkins 服务器上手动连接一次：
```bash
ssh -T git@github.com
# 输入 yes 确认
```

或者在 Jenkins 全局配置中禁用 host key 验证：
- Manage Jenkins → Configure Global Security
- Git Host Key Verification Configuration
- 选择 "Accept first connection"

### 3. Couldn't find any revision to build

**原因**：分支名称不匹配

**解决方案**：
检查仓库的默认分支：
- 如果是 `main`，填写 `*/main`
- 如果是 `master`，填写 `*/master`
- 如果是其他，填写 `*/分支名`

---

## 下一步建议

当前 Jenkinsfile 只负责拉取代码，接下来可以添加：

### 1. 安装依赖
```groovy
stage('Install Dependencies') {
    steps {
        sh 'pnpm install'
    }
}
```

### 2. 构建项目
```groovy
stage('Build') {
    steps {
        // 构建所有应用
        sh 'pnpm build'
        
        // 或构建特定应用
        // sh 'pnpm --filter @puff/activities build'
        // sh 'pnpm --filter @puff/admin-system-1 build'
    }
}
```

### 3. 运行测试
```groovy
stage('Test') {
    steps {
        sh 'pnpm test'
    }
}
```

---

## 测试清单

构建成功后，检查以下内容：

- [ ] Console Output 中显示 "✅ 代码拉取完成"
- [ ] 能看到 Git commit 信息
- [ ] 能看到项目文件列表
- [ ] 没有 Permission denied 错误
- [ ] 没有 Host key verification 错误

---

## 联系信息

如果遇到问题：
1. 查看 Console Output 的完整日志
2. 检查 Jenkins 系统日志
3. 验证 SSH 连接是否正常

**GitHub 仓库**: https://github.com/JayEpher/reff-test

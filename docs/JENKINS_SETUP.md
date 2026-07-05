# Jenkins Pipeline 使用说明

## 文件说明

### 1. Jenkinsfile（简单版）
- **路径**：`Jenkinsfile`
- **用途**：最简单的版本，只拉取代码并显示基本信息
- **适用场景**：快速测试 Jenkins 配置

### 2. Jenkinsfile.detailed（详细版）
- **路径**：`Jenkinsfile.detailed`
- **用途**：详细版本，包含分支选择、环境检查等功能
- **适用场景**：生产环境使用

---

## 在 Jenkins 中配置

### 方式 1：使用项目中的 Jenkinsfile（推荐）

1. **创建 Pipeline 项目**
   - 登录 Jenkins
   - 点击 "新建任务"
   - 输入任务名称（如 `puff-monorepo-checkout`）
   - 选择 "Pipeline"
   - 点击 "确定"

2. **配置 Pipeline**
   - 在 "Pipeline" 部分
   - Definition 选择 "Pipeline script from SCM"
   - SCM 选择 "Git"
   - Repository URL 填写仓库地址：
     ```
     https://github.com/your-org/puff-monorepo.git
     ```
   - Credentials 选择 Git 凭证（如果是私有仓库）
   - Branch Specifier 填写：`*/main`（或其他分支）
   - Script Path 填写：
     - 简单版：`Jenkinsfile`
     - 详细版：`Jenkinsfile.detailed`

3. **保存并运行**
   - 点击 "保存"
   - 点击 "立即构建"

### 方式 2：直接使用 Pipeline Script

1. **创建 Pipeline 项目**（同上）

2. **配置 Pipeline**
   - Definition 选择 "Pipeline script"
   - 将 Jenkinsfile 的内容复制粘贴到脚本框中

3. **保存并运行**

---

## Jenkinsfile 结构说明

### 1. 基本结构

\`\`\`groovy
pipeline {
    agent any              // 在任何可用的 agent 上运行

    stages {               // 构建阶段
        stage('名称') {
            steps {        // 具体步骤
                // 命令
            }
        }
    }

    post {                 // 构建后操作
        success { }        // 成功时执行
        failure { }        // 失败时执行
        always { }         // 总是执行
    }
}
\`\`\`

### 2. Checkout 阶段

\`\`\`groovy
stage('Checkout') {
    steps {
        checkout scm    // 拉取代码（使用 Jenkins 配置的 SCM）
    }
}
\`\`\`

**checkout scm** 说明：
- \`scm\` 代表 Source Code Management
- 会自动使用 Jenkins 项目配置中的 Git 仓库信息
- 自动处理分支、凭证等配置

### 3. 手动指定 Git 仓库

如果不使用 SCM 配置，可以手动指定：

\`\`\`groovy
checkout([
    $class: 'GitSCM',
    branches: [[name: '*/main']],
    userRemoteConfigs: [[
        url: 'https://github.com/your-org/puff-monorepo.git',
        credentialsId: 'git-credentials'  // Jenkins 中配置的凭证 ID
    ]]
])
\`\`\`

---

## 参数化构建

详细版 Jenkinsfile 支持选择分支：

\`\`\`groovy
parameters {
    choice(
        name: 'GIT_BRANCH',
        choices: ['main', 'develop', 'test'],
        description: '选择要拉取的分支'
    )
}
\`\`\`

**使用方式**：
1. 第一次构建后，Jenkins 会识别参数
2. 之后点击 "Build with Parameters"
3. 选择要拉取的分支

---

## 常见问题

### 1. 认证失败

**问题**：拉取私有仓库时认证失败

**解决方案**：
1. 在 Jenkins 中添加凭证：
   - 进入 "Manage Jenkins" → "Manage Credentials"
   - 添加 "Username with password" 或 "SSH Username with private key"
   - 记住 Credentials ID（如 \`git-credentials\`）
2. 在 Jenkinsfile 中使用：
   \`\`\`groovy
   checkout([
       $class: 'GitSCM',
       userRemoteConfigs: [[
           url: 'https://github.com/your-org/puff-monorepo.git',
           credentialsId: 'git-credentials'  // 使用配置的凭证
       ]]
   ])
   \`\`\`

### 2. Node.js 未安装

**问题**：执行 \`node -v\` 时提示未找到命令

**解决方案**：
1. 安装 Node.js 插件：
   - "Manage Jenkins" → "Manage Plugins"
   - 搜索并安装 "NodeJS Plugin"
2. 配置 Node.js：
   - "Manage Jenkins" → "Global Tool Configuration"
   - 找到 "NodeJS" 部分
   - 点击 "Add NodeJS"
   - 配置名称和版本
3. 在 Jenkinsfile 中使用：
   \`\`\`groovy
   pipeline {
       agent any

       tools {
           nodejs 'NodeJS-18'  // 使用配置的 Node.js 名称
       }

       stages {
           // ...
       }
   }
   \`\`\`

### 3. pnpm 未安装

**解决方案**：
\`\`\`groovy
stage('Install pnpm') {
    steps {
        sh 'npm install -g pnpm'
    }
}
\`\`\`

---

## 下一步扩展

在验证代码拉取成功后，可以添加以下阶段：

### 1. 安装依赖
\`\`\`groovy
stage('Install Dependencies') {
    steps {
        sh 'pnpm install'
    }
}
\`\`\`

### 2. 代码检查
\`\`\`groovy
stage('Lint') {
    steps {
        sh 'pnpm lint'
    }
}
\`\`\`

### 3. 运行测试
\`\`\`groovy
stage('Test') {
    steps {
        sh 'pnpm test'
    }
}
\`\`\`

### 4. 构建项目
\`\`\`groovy
stage('Build') {
    steps {
        sh 'pnpm build'
    }
}
\`\`\`

### 5. 部署
\`\`\`groovy
stage('Deploy') {
    steps {
        // 部署逻辑
    }
}
\`\`\`

---

## 触发器配置

### 1. 定时触发
\`\`\`groovy
triggers {
    cron('H 2 * * *')  // 每天凌晨 2 点执行
}
\`\`\`

### 2. 轮询 SCM
\`\`\`groovy
triggers {
    pollSCM('H/5 * * * *')  // 每 5 分钟检查一次代码变化
}
\`\`\`

### 3. Webhook 触发（推荐）
在 Git 仓库中配置 Webhook：
- URL: \`http://jenkins-url/github-webhook/\`（GitHub）
- URL: \`http://jenkins-url/gitee-webhook/\`（Gitee）
- 事件：Push events

---

## 最佳实践

1. **使用 \`checkout scm\`**：让 Jenkins 自动管理 Git 配置
2. **参数化构建**：支持选择分支、环境等
3. **错误处理**：使用 \`try-catch\` 处理可能失败的步骤
4. **清晰的日志**：添加 \`echo\` 语句显示执行进度
5. **使用 \`post\`**：在构建后清理或通知

---

## 查看构建结果

1. **控制台输出**
   - 点击构建编号
   - 点击 "Console Output"
   - 查看详细日志

2. **构建历史**
   - 在项目页面查看所有构建记录
   - 绿色表示成功，红色表示失败

3. **Git 信息**
   - 在构建页面可以看到触发构建的 commit 信息

---

## 后续步骤

当前 Jenkinsfile 只负责拉取代码，接下来您可以：

1. 告诉我需要构建哪些应用
2. 告诉我部署方式和目标
3. 我会帮您扩展 Jenkinsfile 添加构建和部署阶段

或者您可以直接运行当前的 Jenkinsfile 验证代码拉取是否正常。

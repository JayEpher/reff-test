pipeline {
    agent any

    environment {
        // Harbor 镜像仓库配置
        HARBOR_URL = '107.173.87.162:8001'
        HARBOR_PROJECT = 'puff'

        // 根据分支名确定环境
        DEPLOY_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : (env.BRANCH_NAME == 'test' ? 'test' : 'development')}"

        // 根据环境确定端口段基数（production: 3000, test: 4000, development: 5000）
        PORT_BASE = "${env.BRANCH_NAME == 'main' ? '3000' : (env.BRANCH_NAME == 'test' ? '4000' : '5000')}"

        // Turbo Remote Cache 配置
        TURBO_TOKEN = credentials('turbo-remote-cache-token')
        TURBO_TEAM = 'puff-team'
        TURBO_TELEMETRY_DISABLED = '1'

        // Docker 镜像标签：分支名-构建号-时间戳
        IMAGE_TAG = "${env.BRANCH_NAME}-${BUILD_NUMBER}-${new Date().format('yyyyMMdd-HHmmss')}"

        // Harbor 凭证
        HARBOR_CREDENTIALS = credentials('harbor-credentials')

        // 版本记录文件路径
        VERSION_FILE = "/var/jenkins_home/deploy-versions/${DEPLOY_ENV}.json"

        // 保留的历史版本数量
        KEEP_VERSIONS = 5
    }

    parameters {
        choice(
            name: 'APP_TO_BUILD',
            choices: ['all', 'activities', 'admin-system-1', 'admin-system-3', 'dapp'],
            description: '选择要构建的应用'
        )
        booleanParam(
            name: 'SKIP_DEPLOY',
            defaultValue: false,
            description: '仅构建镜像，跳过部署'
        )
        booleanParam(
            name: 'PARALLEL_BUILD',
            defaultValue: false,
            description: '并行构建（需要服务器资源充足）'
        )
        booleanParam(
            name: 'IS_ROLLBACK',
            defaultValue: false,
            description: '🔄 回滚模式：回滚到指定版本'
        )
        string(
            name: 'ROLLBACK_VERSION',
            defaultValue: '',
            description: '回滚的版本号（格式：main-123-20260712-123456），留空则回滚到上一个版本'
        )
        booleanParam(
            name: 'BLUE_GREEN_DEPLOY',
            defaultValue: false,
            description: '🔵🟢 蓝绿部署：保留旧版本容器，健康检查通过后再切换'
        )
    }

    stages {
        stage('Rollback Mode Check') {
            when {
                expression { params.IS_ROLLBACK == true }
            }
            steps {
                script {
                    echo '=========================================='
                    echo '🔄 回滚模式'
                    echo '=========================================='

                    // 确定回滚版本
                    def rollbackVersion = params.ROLLBACK_VERSION?.trim()
                    if (!rollbackVersion) {
                        // 获取上一个版本
                        rollbackVersion = getPreviousVersion()
                        if (!rollbackVersion) {
                            error '❌ 未找到可回滚的版本'
                        }
                        echo "自动选择上一个版本: ${rollbackVersion}"
                    } else {
                        echo "手动指定版本: ${rollbackVersion}"
                    }

                    env.ROLLBACK_TO_VERSION = rollbackVersion
                    echo "将回滚到版本: ${env.ROLLBACK_TO_VERSION}"
                    echo '=========================================='
                }
            }
        }

        stage('Environment Info') {
            steps {
                script {
                    echo '=========================================='
                    echo '🚀 开始 CI/CD 流水线'
                    echo '=========================================='
                    echo "分支: ${env.BRANCH_NAME}"
                    echo "环境: ${DEPLOY_ENV}"
                    echo "端口段: ${PORT_BASE}xxx"
                    echo "构建应用: ${params.APP_TO_BUILD}"
                    echo "镜像标签: ${IMAGE_TAG}"
                    echo "Harbor: ${HARBOR_URL}/${HARBOR_PROJECT}"
                    echo "并行构建: ${params.PARALLEL_BUILD}"
                    echo '=========================================='

                    // 显示端口映射
                    def portBase = PORT_BASE.toInteger()
                    echo "\n📋 端口映射:"
                    echo "activities      → ${portBase + 1}"
                    echo "admin-system-1  → ${portBase + 2}"
                    echo "admin-system-3  → ${portBase + 3}"
                    echo "dapp            → ${portBase + 4}"
                    echo '=========================================='
                }
            }
        }

        stage('Show System Info') {
            steps {
                echo '📋 系统信息'
                sh 'docker --version'
                sh 'pwd'
                sh 'ls -la'

                // 显示 .nvmrc 文件
                sh 'echo "\n.nvmrc 配置:"'
                sh 'find apps -name ".nvmrc" -exec sh -c \'echo "{}:" && cat {}\' \\;'
            }
        }

        stage('Build Docker Images') {
            when {
                expression { params.IS_ROLLBACK == false }
            }
            steps {
                script {
                    echo '=========================================='
                    echo '🔨 开始构建 Docker 镜像...'
                    echo '=========================================='

                    // 登录 Harbor
                    sh """
                        echo \${HARBOR_CREDENTIALS_PSW} | docker login ${HARBOR_URL} -u \${HARBOR_CREDENTIALS_USR} --password-stdin
                    """

                    // 定义要构建的应用列表
                    def apps = params.APP_TO_BUILD == 'all'
                        ? ['activities', 'admin-system-1', 'admin-system-3', 'dapp']
                        : [params.APP_TO_BUILD]

                    // 根据参数选择串行或并行构建
                    if (params.PARALLEL_BUILD && apps.size() > 1) {
                        echo '🔄 使用并行构建模式'
                        def parallelBuilds = [:]

                        apps.each { appName ->
                            parallelBuilds[appName] = {
                                buildApp(appName)
                            }
                        }

                        parallel parallelBuilds
                    } else {
                        echo '🔄 使用串行构建模式'
                        apps.each { appName ->
                            buildApp(appName)
                        }
                    }

                    echo '=========================================='
                    echo '✅ 所有镜像构建完成'
                    echo '=========================================='
                }
            }
        }

        stage('Push to Harbor') {
            when {
                expression { params.IS_ROLLBACK == false }
            }
            steps {
                script {
                    echo '=========================================='
                    echo '📤 推送镜像到 Harbor...'
                    echo '=========================================='

                    // 登录 Harbor
                    sh """
                        echo \${HARBOR_CREDENTIALS_PSW} | docker login ${HARBOR_URL} -u \${HARBOR_CREDENTIALS_USR} --password-stdin
                    """

                    // 定义要推送的应用列表
                    def apps = params.APP_TO_BUILD == 'all'
                        ? ['activities', 'admin-system-1', 'admin-system-3', 'dapp']
                        : [params.APP_TO_BUILD]

                    // 推送镜像
                    apps.each { appName ->
                        def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"
                        def imageLatest = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${env.BRANCH_NAME}-latest"

                        echo "推送: ${appName}"
                        sh """
                            docker push ${imageName}
                            docker push ${imageLatest}
                        """
                        echo "✅ ${appName} 推送完成"
                    }

                    echo '=========================================='
                    echo '✅ 所有镜像推送完成'
                    echo '=========================================='
                }
            }
        }

        stage('Deploy') {
            when {
                expression { params.SKIP_DEPLOY == false }
            }
            steps {
                script {
                    echo '=========================================='
                    if (params.IS_ROLLBACK) {
                        echo "🔄 回滚到版本: ${env.ROLLBACK_TO_VERSION}"
                    } else {
                        echo "🚀 部署到 ${DEPLOY_ENV} 环境..."
                    }
                    echo '=========================================='

                    // 生产环境需要人工确认
                    if (env.BRANCH_NAME == 'main' && !params.IS_ROLLBACK) {
                        input message: '⚠️ 确认部署到生产环境？', ok: '确认部署'
                    }

                    // 定义要部署的应用列表
                    def apps = params.APP_TO_BUILD == 'all'
                        ? ['activities', 'admin-system-1', 'admin-system-3', 'dapp']
                        : [params.APP_TO_BUILD]

                    // 端口映射
                    def portBase = PORT_BASE.toInteger()
                    def portMap = [
                        'activities': portBase + 1,
                        'admin-system-1': portBase + 2,
                        'admin-system-3': portBase + 3,
                        'dapp': portBase + 4
                    ]

                    // 确定使用的镜像标签
                    def deployTag = params.IS_ROLLBACK ? env.ROLLBACK_TO_VERSION : IMAGE_TAG

                    // 蓝绿部署：先备份当前版本信息
                    if (params.BLUE_GREEN_DEPLOY && !params.IS_ROLLBACK) {
                        echo '🔵🟢 蓝绿部署模式：保存当前版本...'
                        saveCurrentVersion(apps)
                    }

                    // 生成 docker compose 覆盖文件
                    def composeOverride = "version: '3.8'\nservices:\n"

                    apps.each { appName ->
                        def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${deployTag}"
                        def hostPort = portMap[appName]
                        def containerPort = (appName == 'dapp') ? 3000 : 80

                        // 蓝绿部署：使用临时容器名和端口
                        def containerSuffix = params.BLUE_GREEN_DEPLOY && !params.IS_ROLLBACK ? '-new' : ''
                        def tempPort = params.BLUE_GREEN_DEPLOY && !params.IS_ROLLBACK ? hostPort + 100 : hostPort

                        composeOverride += """
  ${appName}:
    image: ${imageName}
    container_name: puff-${appName}-${DEPLOY_ENV}${containerSuffix}
    ports:
      - "${tempPort}:${containerPort}"
    environment:
      - NODE_ENV=${DEPLOY_ENV}
"""
                        if (appName == 'dapp') {
                            composeOverride += "      - PORT=3000\n"
                        }
                    }

                    // 写入临时覆盖文件
                    writeFile file: 'docker-compose.override.yml', text: composeOverride

                    echo '生成的 docker-compose.override.yml:'
                    sh 'cat docker-compose.override.yml'

                    // 登录 Harbor
                    sh """
                        echo \${HARBOR_CREDENTIALS_PSW} | docker login ${HARBOR_URL} -u \${HARBOR_CREDENTIALS_USR} --password-stdin
                    """

                    // 使用 docker compose 部署
                    if (params.APP_TO_BUILD == 'all') {
                        sh 'docker compose -f docker-compose.yml -f docker-compose.override.yml up -d'
                    } else {
                        sh "docker compose -f docker-compose.yml -f docker-compose.override.yml up -d ${params.APP_TO_BUILD}"
                    }

                    echo '=========================================='
                    echo '✅ 部署完成'
                    echo '=========================================='

                    // 显示运行状态
                    sh 'docker ps | grep puff'

                    // 保存部署版本信息（非回滚模式）
                    if (!params.IS_ROLLBACK && !params.BLUE_GREEN_DEPLOY) {
                        saveDeploymentVersion(apps, deployTag)
                    }
                }
            }
        }

        stage('Health Check') {
            when {
                expression { params.SKIP_DEPLOY == false }
            }
            steps {
                script {
                    echo '=========================================='
                    echo '🔍 健康检查...'
                    echo '=========================================='

                    // 等待容器启动
                    sleep(time: 10, unit: 'SECONDS')

                    // 检查容器状态
                    def apps = params.APP_TO_BUILD == 'all'
                        ? ['activities', 'admin-system-1', 'admin-system-3', 'dapp']
                        : [params.APP_TO_BUILD]

                    def portBase = PORT_BASE.toInteger()
                    def portMap = [
                        'activities': portBase + 1,
                        'admin-system-1': portBase + 2,
                        'admin-system-3': portBase + 3,
                        'dapp': portBase + 4
                    ]

                    def healthCheckFailed = false
                    def failedApps = []

                    apps.each { appName ->
                        def containerSuffix = params.BLUE_GREEN_DEPLOY && !params.IS_ROLLBACK ? '-new' : ''
                        def containerName = "puff-${appName}-${DEPLOY_ENV}${containerSuffix}"
                        def checkPort = params.BLUE_GREEN_DEPLOY && !params.IS_ROLLBACK ? portMap[appName] + 100 : portMap[appName]

                        // 1. 检查容器状态
                        def status = sh(
                            script: "docker inspect -f '{{.State.Status}}' ${containerName} 2>/dev/null || echo 'not found'",
                            returnStdout: true
                        ).trim()

                        if (status == 'running') {
                            echo "✅ ${appName}: 容器运行中"

                            // 2. HTTP 健康检查
                            def httpHealthOk = sh(
                                script: """
                                    for i in {1..30}; do
                                        if curl -f -s -o /dev/null -w '%{http_code}' http://localhost:${checkPort}/ | grep -q '200\\|301\\|302\\|304'; then
                                            echo 'ok'
                                            exit 0
                                        fi
                                        sleep 2
                                    done
                                    echo 'failed'
                                    exit 1
                                """,
                                returnStatus: true
                            ) == 0

                            if (httpHealthOk) {
                                echo "✅ ${appName}: HTTP 健康检查通过 (端口 ${checkPort})"
                            } else {
                                echo "❌ ${appName}: HTTP 健康检查失败 (端口 ${checkPort})"
                                sh "docker logs --tail 50 ${containerName} || true"
                                healthCheckFailed = true
                                failedApps << appName
                            }
                        } else {
                            echo "❌ ${appName}: 容器状态异常 (${status})"
                            sh "docker logs --tail 50 ${containerName} || true"
                            healthCheckFailed = true
                            failedApps << appName
                        }
                    }

                    // 健康检查失败处理
                    if (healthCheckFailed) {
                        echo "=========================================="
                        echo "❌ 健康检查失败的应用: ${failedApps.join(', ')}"
                        echo "=========================================="

                        if (!params.IS_ROLLBACK && params.BLUE_GREEN_DEPLOY) {
                            echo "🔄 蓝绿部署失败，保留旧版本容器"
                            // 清理新版本容器
                            failedApps.each { appName ->
                                sh "docker rm -f puff-${appName}-${DEPLOY_ENV}-new || true"
                            }
                        } else if (!params.IS_ROLLBACK) {
                            echo "⚠️ 尝试自动回滚到上一个版本..."
                            def previousVersion = getPreviousVersion()
                            if (previousVersion) {
                                echo "找到上一个版本: ${previousVersion}"
                                echo "触发自动回滚..."
                                // 标记需要回滚
                                env.AUTO_ROLLBACK_NEEDED = 'true'
                                env.AUTO_ROLLBACK_VERSION = previousVersion
                            } else {
                                echo "❌ 未找到可回滚的版本"
                            }
                        }

                        error "健康检查失败"
                    }

                    // 蓝绿部署：切换流量
                    if (params.BLUE_GREEN_DEPLOY && !params.IS_ROLLBACK && !healthCheckFailed) {
                        echo '=========================================='
                        echo '🔵🟢 健康检查通过，切换流量到新版本...'
                        echo '=========================================='

                        apps.each { appName ->
                            def oldContainer = "puff-${appName}-${DEPLOY_ENV}"
                            def newContainer = "puff-${appName}-${DEPLOY_ENV}-new"

                            // 停止旧容器
                            sh "docker stop ${oldContainer} || true"
                            sh "docker rm ${oldContainer} || true"

                            // 重命名新容器并重新映射端口
                            sh "docker stop ${newContainer}"
                            sh "docker rename ${newContainer} ${oldContainer}"

                            // 使用正确的端口重启容器
                            def hostPort = portMap[appName]
                            def containerPort = (appName == 'dapp') ? 3000 : 80
                            def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"

                            sh """
                                docker run -d \\
                                    --name ${oldContainer} \\
                                    -p ${hostPort}:${containerPort} \\
                                    -e NODE_ENV=${DEPLOY_ENV} \\
                                    ${imageName}
                            """

                            echo "✅ ${appName}: 已切换到新版本"
                        }

                        // 保存版本信息
                        saveDeploymentVersion(apps, IMAGE_TAG)
                    }

                    echo '=========================================='
                    echo '✅ 健康检查完成'
                    echo '=========================================='
                }
            }
        }
    }

    post {
        success {
            script {
                echo '=========================================='
                echo '✅ Pipeline 执行成功！'
                echo '=========================================='
                echo "分支: ${env.BRANCH_NAME}"
                echo "环境: ${DEPLOY_ENV}"
                echo "镜像标签: ${IMAGE_TAG}"
                echo "Harbor: ${HARBOR_URL}/${HARBOR_PROJECT}"
                echo '=========================================='

                // 输出访问地址
                if (params.SKIP_DEPLOY == false) {
                    def portBase = PORT_BASE.toInteger()
                    echo '\n📋 应用访问地址:'
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'activities') {
                        echo "activities: http://107.173.87.162:${portBase + 1}"
                    }
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'admin-system-1') {
                        echo "admin-system-1: http://107.173.87.162:${portBase + 2}"
                    }
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'admin-system-3') {
                        echo "admin-system-3: http://107.173.87.162:${portBase + 3}"
                    }
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'dapp') {
                        echo "dapp: http://107.173.87.162:${portBase + 4}"
                    }
                }
            }
        }

        failure {
            script {
                echo '=========================================='
                echo '❌ Pipeline 执行失败！'
                echo '=========================================='
                echo "分支: ${env.BRANCH_NAME}"
                echo "环境: ${DEPLOY_ENV}"
                echo "失败阶段: ${env.STAGE_NAME}"

                sh 'docker ps -a | grep puff | tail -5 || true'
            }
        }

        always {
            script {
                echo '=========================================='
                echo '🧹 清理工作...'
                echo '=========================================='

                sh 'df -h / || true'

                def apps = params.APP_TO_BUILD == 'all'
                    ? ['activities', 'admin-system-1', 'admin-system-3', 'dapp']
                    : [params.APP_TO_BUILD]

                // 只清理当前构建的镜像，保留历史版本用于回滚
                if (!params.IS_ROLLBACK) {
                    apps.each { appName ->
                        def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"
                        sh """
                            echo "清理本地构建镜像: ${imageName}"
                            docker rmi ${imageName} || true
                        """
                    }
                }

                // 清理旧版本镜像（保留最近 KEEP_VERSIONS 个版本）
                cleanupOldImages(apps)

                sh 'docker image prune -f || true'
                sh 'docker container prune -f || true'

                def dockerDiskInfo = sh(
                    script: "docker system df --format '{{.Type}},{{.TotalCount}},{{.Size}}' | grep Images || echo ''",
                    returnStdout: true
                ).trim()

                if (dockerDiskInfo) {
                    echo "Docker 镜像占用: ${dockerDiskInfo}"
                }

                try {
                    def diskCheckResult = sh(
                        script: "df / 2>/dev/null | tail -1 | awk '{print \$5}' | sed 's/%//' || echo '0'",
                        returnStdout: true
                    ).trim()

                    if (diskCheckResult && diskCheckResult.isInteger()) {
                        def diskUsage = diskCheckResult.toInteger()
                        echo "磁盘使用率: ${diskUsage}%"

                        if (diskUsage > 85) {
                            echo "⚠️  磁盘使用率过高 (${diskUsage}%)，执行深度清理..."
                            sh 'docker image prune -a -f || true'
                        }
                    }
                } catch (Exception e) {
                    echo "⚠️  磁盘检查失败，跳过深度清理: ${e.message}"
                }

                sh "docker logout ${HARBOR_URL} || true"
                sh 'rm -f docker-compose.override.yml || true'
                sh 'df -h / || true'
                sh 'docker system df || true'

                echo '🔚 Pipeline 执行结束'
            }
        }
    }
}

// 构建单个应用的辅助函数
def buildApp(String appName) {
    echo "构建应用: ${appName}"

    // 读取 Node 版本
    def nodeVersion = sh(
        script: "cat apps/${appName}/.nvmrc 2>/dev/null || echo '20'",
        returnStdout: true
    ).trim()

    echo "Node 版本: ${nodeVersion}"

    // 确定应用类型和 Dockerfile
    def dockerfile = appName == 'dapp' ? 'Dockerfile.nextjs' : 'Dockerfile.static'

    // 定义镜像名称
    def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"
    def imageLatest = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${env.BRANCH_NAME}-latest"

    echo "使用 Dockerfile: ${dockerfile}"
    echo "镜像名称: ${imageName}"
    echo "最新标签: ${imageLatest}"

    // 尝试拉取之前的镜像作为缓存源
    def cacheExists = sh(
        script: "docker pull ${imageLatest}",
        returnStatus: true
    ) == 0

    if (cacheExists) {
        echo "✅ 找到缓存镜像，将使用 --cache-from 加速构建"
        sh """
            DOCKER_BUILDKIT=1 docker build \\
                --build-arg NODE_VERSION=${nodeVersion} \\
                --build-arg APP_NAME=${appName} \\
                --build-arg BUILD_ENV=${DEPLOY_ENV} \\
                --build-arg TURBO_TOKEN=${TURBO_TOKEN} \\
                --build-arg TURBO_TEAM=${TURBO_TEAM} \\
                --cache-from ${imageLatest} \\
                -t ${imageName} \\
                -t ${imageLatest} \\
                -f ${dockerfile} \\
                .
        """
    } else {
        echo "ℹ️  未找到缓存镜像，执行全新构建"
        sh """
            DOCKER_BUILDKIT=1 docker build \\
                --build-arg NODE_VERSION=${nodeVersion} \\
                --build-arg APP_NAME=${appName} \\
                --build-arg BUILD_ENV=${DEPLOY_ENV} \\
                --build-arg TURBO_TOKEN=${TURBO_TOKEN} \\
                --build-arg TURBO_TEAM=${TURBO_TEAM} \\
                -t ${imageName} \\
                -t ${imageLatest} \\
                -f ${dockerfile} \\
                .
        """
    }

    echo "✅ ${appName} 镜像构建完成"
}

// ============================================
// 版本管理函数
// ============================================

// 保存部署版本信息
def saveDeploymentVersion(List apps, String version) {
    echo "💾 保存部署版本信息: ${version}"

    // 确保目录存在
    sh "mkdir -p /var/jenkins_home/deploy-versions"

    // 读取现有版本历史
    def versionData = [:]
    def versionFile = "/var/jenkins_home/deploy-versions/${DEPLOY_ENV}.json"

    if (fileExists(versionFile)) {
        def existingData = readFile(versionFile).trim()
        if (existingData) {
            try {
                versionData = readJSON(text: existingData)
            } catch (Exception e) {
                echo "⚠️ 无法解析现有版本文件，创建新文件"
                versionData = [:]
            }
        }
    }

    // 初始化结构
    if (!versionData.versions) {
        versionData.versions = []
    }

    // 添加新版本记录
    def newVersion = [
        version: version,
        timestamp: new Date().format('yyyy-MM-dd HH:mm:ss'),
        buildNumber: BUILD_NUMBER,
        apps: apps,
        deployer: env.BUILD_USER ?: 'jenkins'
    ]

    versionData.versions.add(0, newVersion)  // 添加到开头

    // 只保留最近的 KEEP_VERSIONS 个版本
    if (versionData.versions.size() > KEEP_VERSIONS.toInteger()) {
        versionData.versions = versionData.versions.take(KEEP_VERSIONS.toInteger())
    }

    // 更新当前版本
    versionData.current = version

    // 写入文件
    writeJSON file: versionFile, json: versionData, pretty: 4

    echo "✅ 版本信息已保存"
    echo "当前版本: ${version}"
    echo "历史版本数: ${versionData.versions.size()}"
}

// 获取上一个部署版本
def getPreviousVersion() {
    def versionFile = "/var/jenkins_home/deploy-versions/${DEPLOY_ENV}.json"

    if (!fileExists(versionFile)) {
        echo "⚠️ 版本文件不存在"
        return null
    }

    def versionData
    try {
        versionData = readJSON file: versionFile
    } catch (Exception e) {
        echo "⚠️ 无法读取版本文件: ${e.message}"
        return null
    }

    if (!versionData.versions || versionData.versions.size() < 2) {
        echo "⚠️ 没有历史版本"
        return null
    }

    // 返回第二个版本（第一个是当前版本）
    def previousVersion = versionData.versions[1].version
    echo "找到上一个版本: ${previousVersion}"
    return previousVersion
}

// 保存当前版本（蓝绿部署用）
def saveCurrentVersion(List apps) {
    echo "💾 保存当前版本信息..."

    apps.each { appName ->
        def containerName = "puff-${appName}-${DEPLOY_ENV}"

        // 获取当前运行的镜像
        def currentImage = sh(
            script: "docker inspect -f '{{.Config.Image}}' ${containerName} 2>/dev/null || echo ''",
            returnStdout: true
        ).trim()

        if (currentImage) {
            echo "当前 ${appName} 镜像: ${currentImage}"
        } else {
            echo "⚠️ ${appName} 容器不存在或未运行"
        }
    }
}

// 清理旧版本镜像
def cleanupOldImages(List apps) {
    echo "🧹 清理旧版本镜像（保留最近 ${KEEP_VERSIONS} 个）"

    def versionFile = "/var/jenkins_home/deploy-versions/${DEPLOY_ENV}.json"

    if (!fileExists(versionFile)) {
        echo "⚠️ 版本文件不存在，跳过清理"
        return
    }

    def versionData
    try {
        versionData = readJSON file: versionFile
    } catch (Exception e) {
        echo "⚠️ 无法读取版本文件: ${e.message}"
        return
    }

    if (!versionData.versions || versionData.versions.size() <= KEEP_VERSIONS.toInteger()) {
        echo "✅ 无需清理，版本数: ${versionData.versions?.size() ?: 0}"
        return
    }

    // 获取要保留的版本列表
    def keepVersions = versionData.versions.take(KEEP_VERSIONS.toInteger()).collect { it.version }
    echo "保留版本: ${keepVersions.join(', ')}"

    // 获取 Harbor 上的镜像列表并清理
    apps.each { appName ->
        try {
            // 这里可以添加调用 Harbor API 清理镜像的逻辑
            // 暂时只清理本地镜像
            sh """
                # 获取本地该应用的所有镜像
                docker images ${HARBOR_URL}/${HARBOR_PROJECT}/${appName} --format '{{.Tag}}' | while read tag; do
                    # 跳过 latest 标签
                    if [ "\$tag" = "${env.BRANCH_NAME}-latest" ]; then
                        continue
                    fi

                    # 检查是否在保留列表中
                    keep=false
                    for version in ${keepVersions.join(' ')}; do
                        if [ "\$tag" = "\$version" ]; then
                            keep=true
                            break
                        fi
                    done

                    # 不在保留列表中则删除
                    if [ "\$keep" = false ]; then
                        echo "删除旧镜像: ${appName}:\$tag"
                        docker rmi ${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:\$tag || true
                    fi
                done
            """
        } catch (Exception e) {
            echo "⚠️ 清理 ${appName} 旧镜像失败: ${e.message}"
        }
    }

    echo "✅ 旧版本镜像清理完成"
}

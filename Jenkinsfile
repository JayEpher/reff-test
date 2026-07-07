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
    }

    stages {
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
                    echo "🚀 部署到 ${DEPLOY_ENV} 环境..."
                    echo '=========================================='

                    // 生产环境需要人工确认
                    if (env.BRANCH_NAME == 'main') {
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

                    // 生成 docker compose 覆盖文件
                    def composeOverride = "version: '3.8'\nservices:\n"

                    apps.each { appName ->
                        def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"
                        def hostPort = portMap[appName]
                        def containerPort = (appName == 'dapp') ? 3000 : 80

                        composeOverride += """
  ${appName}:
    image: ${imageName}
    container_name: puff-${appName}-${DEPLOY_ENV}
    ports:
      - "${hostPort}:${containerPort}"
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

                    apps.each { appName ->
                        def containerName = "puff-${appName}-${DEPLOY_ENV}"
                        def status = sh(
                            script: "docker inspect -f '{{.State.Status}}' ${containerName} 2>/dev/null || echo 'not found'",
                            returnStdout: true
                        ).trim()

                        if (status == 'running') {
                            echo "✅ ${appName}: 运行中"
                        } else {
                            echo "❌ ${appName}: 状态异常 (${status})"
                            sh "docker logs --tail 50 ${containerName} || true"
                        }
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

                apps.each { appName ->
                    def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"
                    sh """
                        echo "清理本地镜像: ${imageName}"
                        docker rmi ${imageName} || true
                    """
                }

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

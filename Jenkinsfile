pipeline {
    agent any

    environment {
        // Harbor 镜像仓库配置
        HARBOR_URL = '107.173.87.162:8001'
        HARBOR_PROJECT = 'puff'

        // 根据分支名确定环境
        DEPLOY_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : (env.BRANCH_NAME == 'test' ? 'test' : 'development')}"

        // Turbo Remote Cache 配置（自建服务 + S3）
        TURBO_API = 'http://107.173.87.162:3002'  // 自建服务地址
        TURBO_TOKEN = credentials('turbo-remote-cache-token')
        TURBO_TEAM = 'puff-team'
        TURBO_TELEMETRY_DISABLED = '1'

        // Docker 镜像标签：分支名-构建号-时间戳
        IMAGE_TAG = "${env.BRANCH_NAME}-${BUILD_NUMBER}-${new Date().format('yyyyMMdd-HHmmss')}"

        // Harbor 凭证 (需要在 Jenkins 中配置 harbor-credentials)
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
                    echo "构建应用: ${params.APP_TO_BUILD}"
                    echo "镜像标签: ${IMAGE_TAG}"
                    echo "Harbor: ${HARBOR_URL}/${HARBOR_PROJECT}"
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

                    // 登录 Harbor（用于拉取缓存镜像）
                    sh """
                        echo \${HARBOR_CREDENTIALS_PSW} | docker login ${HARBOR_URL} -u \${HARBOR_CREDENTIALS_USR} --password-stdin
                    """

                    // 定义要构建的应用列表
                    def apps = params.APP_TO_BUILD == 'all'
                        ? ['activities', 'admin-system-1', 'admin-system-3', 'dapp']
                        : [params.APP_TO_BUILD]

                    apps.each { appName ->
                        echo "构建应用: ${appName}"

                        // 读取 Node 版本
                        def nodeVersion = sh(
                            script: "cat apps/${appName}/.nvmrc 2>/dev/null || echo '20'",
                            returnStdout: true
                        ).trim()

                        echo "Node 版本: ${nodeVersion}"

                        // 确定应用类型和 Dockerfile
                        def dockerfile = appName == 'dapp' ? 'Dockerfile.nextjs' : 'Dockerfile.static'

                        // 定义镜像名称（包含完整 Harbor 路径）
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
                            // 使用缓存构建（启用 BuildKit + Turbo Remote Cache）
                            sh """
                                DOCKER_BUILDKIT=1 docker build \
                                    --build-arg NODE_VERSION=${nodeVersion} \
                                    --build-arg APP_NAME=${appName} \
                                    --build-arg BUILD_ENV=${DEPLOY_ENV} \
                                    --build-arg TURBO_TOKEN=${TURBO_TOKEN} \
                                    --build-arg TURBO_TEAM=${TURBO_TEAM} \
                                    --cache-from ${imageLatest} \
                                    -t ${imageName} \
                                    -t ${imageLatest} \
                                    -f ${dockerfile} \
                                    .
                            """
                        } else {
                            echo "ℹ️  未找到缓存镜像，执行全新构建（首次构建正常）"
                            // 不使用缓存构建（启用 BuildKit + Turbo Remote Cache）
                            sh """
                                DOCKER_BUILDKIT=1 docker build \
                                    --build-arg NODE_VERSION=${nodeVersion} \
                                    --build-arg APP_NAME=${appName} \
                                    --build-arg BUILD_ENV=${DEPLOY_ENV} \
                                    --build-arg TURBO_TOKEN=${TURBO_TOKEN} \
                                    --build-arg TURBO_TEAM=${TURBO_TEAM} \
                                    -t ${imageName} \
                                    -t ${imageLatest} \
                                    -f ${dockerfile} \
                                    .
                            """
                        }

                        echo "✅ ${appName} 镜像构建完成"
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

                    // 为每个应用生成 docker compose 覆盖文件
                    def composeOverride = "version: '3.8'\nservices:\n"

                    apps.each { appName ->
                        def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"

                        composeOverride += """
  ${appName}:
    image: ${imageName}
    container_name: puff-${appName}-${DEPLOY_ENV}
    environment:
      - NODE_ENV=${DEPLOY_ENV}
"""
                    }

                    // 写入临时覆盖文件
                    writeFile file: 'docker-compose.override.yml', text: composeOverride

                    echo '生成的 docker-compose.override.yml:'
                    sh 'cat docker-compose.override.yml'

                    // 登录 Harbor（部署服务器也需要登录）
                    sh """
                        echo \${HARBOR_CREDENTIALS_PSW} | docker login ${HARBOR_URL} -u \${HARBOR_CREDENTIALS_USR} --password-stdin
                    """

                    // 使用 docker compose 部署（v2）
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
                            // 显示日志
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
                    echo '\n📋 应用访问地址:'
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'activities') {
                        echo "activities: http://107.173.87.162:3001"
                    }
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'admin-system-1') {
                        echo "admin-system-1: http://107.173.87.162:3002"
                    }
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'admin-system-3') {
                        echo "admin-system-3: http://107.173.87.162:3003"
                    }
                    if (params.APP_TO_BUILD == 'all' || params.APP_TO_BUILD == 'dapp') {
                        echo "dapp: http://107.173.87.162:3004"
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

                // 显示最近的容器日志
                sh 'docker ps -a | grep puff | tail -5 || true'
            }
        }

        always {
            script {
                echo '=========================================='
                echo '🧹 清理工作...'
                echo '=========================================='

                // 检查磁盘空间（容器内的根分区）
                sh 'df -h / || true'

                // 删除本次构建的带版本号的镜像（保留 latest）
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

                // 清理悬空镜像（立即清理，释放空间）
                sh 'docker image prune -f || true'

                // 清理未使用的容器
                sh 'docker container prune -f || true'

                // 获取 Docker 系统信息（更可靠的方式）
                def dockerDiskInfo = sh(
                    script: "docker system df --format '{{.Type}},{{.TotalCount}},{{.Size}}' | grep Images || echo ''",
                    returnStdout: true
                ).trim()

                if (dockerDiskInfo) {
                    echo "Docker 镜像占用: ${dockerDiskInfo}"
                }

                // 如果宿主机磁盘使用率 > 85%，执行深度清理
                // 注意：这里通过 docker info 间接判断（不完美，但可用）
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
                            // 删除所有未使用的镜像（不包括正在运行的）
                            sh 'docker image prune -a -f || true'
                        }
                    }
                } catch (Exception e) {
                    echo "⚠️  磁盘检查失败，跳过深度清理: ${e.message}"
                }

                // 登出 Harbor
                sh "docker logout ${HARBOR_URL} || true"

                // 删除临时覆盖文件
                sh 'rm -f docker-compose.override.yml || true'

                // 显示清理后的磁盘空间和 Docker 统计
                sh 'df -h / || true'
                sh 'docker system df || true'

                echo '🔚 Pipeline 执行结束'
            }
        }
    }
}

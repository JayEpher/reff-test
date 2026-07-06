pipeline {
    agent any

    environment {
        // Harbor 镜像仓库配置
        HARBOR_URL = '107.173.87.162:8001'
        HARBOR_PROJECT = 'puff'

        // 根据分支名确定环境
        DEPLOY_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : (env.BRANCH_NAME == 'test' ? 'test' : 'development')}"

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

        stage('Checkout') {
            steps {
                echo '📥 拉取代码...'
                checkout scm
                echo '✅ 代码拉取完成'
            }
        }

        stage('Show System Info') {
            steps {
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

                        // 确定应用类型和目标阶段
                        def appType = appName == 'dapp' ? 'nextjs' : 'static'
                        def targetStage = appType == 'static' ? 'production-static' : 'production-nextjs'

                        // 定义镜像名称（包含完整 Harbor 路径）
                        def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"
                        def imageLatest = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${env.BRANCH_NAME}-latest"

                        echo "镜像名称: ${imageName}"
                        echo "最新标签: ${imageLatest}"

                        // 构建镜像
                        sh """
                            docker build \
                                --build-arg NODE_VERSION=${nodeVersion} \
                                --build-arg APP_NAME=${appName} \
                                --build-arg BUILD_ENV=${DEPLOY_ENV} \
                                --target ${targetStage} \
                                -t ${imageName} \
                                -t ${imageLatest} \
                                -f Dockerfile.universal \
                                .
                        """

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
                    writeFile file: 'docker compose.override.yml', text: composeOverride

                    echo '生成的 docker compose.override.yml:'
                    sh 'cat docker compose.override.yml'

                    // 登录 Harbor（部署服务器也需要登录）
                    sh """
                        echo \${HARBOR_CREDENTIALS_PSW} | docker login ${HARBOR_URL} -u \${HARBOR_CREDENTIALS_USR} --password-stdin
                    """

                    // 使用 docker compose 部署
                    if (params.APP_TO_BUILD == 'all') {
                        sh 'docker compose -f docker compose.yml -f docker compose.override.yml up -d'
                    } else {
                        sh "docker compose -f docker compose.yml -f docker compose.override.yml up -d ${params.APP_TO_BUILD}"
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

                // 清理悬空镜像（保留最近的镜像）
                sh 'docker image prune -f || true'

                // 登出 Harbor
                sh "docker logout ${HARBOR_URL} || true"

                // 删除临时覆盖文件
                sh 'rm -f docker compose.override.yml || true'

                echo '🔚 Pipeline 执行结束'
            }
        }
    }
}

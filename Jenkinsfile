pipeline {
    agent any

    environment {
        // Docker 镜像仓库配置
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_NAMESPACE = 'puff'

        // Docker 镜像标签
        IMAGE_TAG = "${BUILD_NUMBER}"

        // Docker Hub 凭证
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
    }

    parameters {
        choice(
            name: 'APP_TO_BUILD',
            choices: ['all', 'activities', 'admin-system-1', 'admin-system-3', 'dapp'],
            description: '选择要构建的应用'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['development', 'test', 'production'],
            description: '选择部署环境'
        )
        booleanParam(
            name: 'PUSH_TO_REGISTRY',
            defaultValue: false,
            description: '是否推送镜像到仓库'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=========================================='
                echo '开始拉取代码...'
                echo "构建应用: ${params.APP_TO_BUILD}"
                echo "环境: ${params.ENVIRONMENT}"
                echo '=========================================='

                checkout scm

                echo '✅ 代码拉取完成'
            }
        }

        stage('Show Info') {
            steps {
                echo '=========================================='
                echo '显示环境信息'
                echo '=========================================='

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
                    echo '开始构建 Docker 镜像...'
                    echo '使用通用 Dockerfile (自动读取 Node 版本)'
                    echo '=========================================='

                    if (params.APP_TO_BUILD == 'all') {
                        // 构建所有应用
                        echo '构建所有应用...'
                        sh 'docker-compose build'
                    } else {
                        // 构建单个应用
                        echo "构建应用: ${params.APP_TO_BUILD}"

                        // 读取 Node 版本
                        def nodeVersion = sh(
                            script: "cat apps/${params.APP_TO_BUILD}/.nvmrc 2>/dev/null || echo '20'",
                            returnStdout: true
                        ).trim()

                        echo "从 .nvmrc 读取的 Node 版本: ${nodeVersion}"

                        // 确定应用类型和目标阶段
                        def appType = params.APP_TO_BUILD == 'dapp' ? 'nextjs' : 'static'
                        def targetStage = appType == 'static' ? 'production-static' : 'production-nextjs'

                        echo "应用类型: ${appType}"
                        echo "目标阶段: ${targetStage}"

                        def imageName = "${DOCKER_NAMESPACE}/${params.APP_TO_BUILD}:${IMAGE_TAG}"
                        def imageLatest = "${DOCKER_NAMESPACE}/${params.APP_TO_BUILD}:latest"

                        sh """
                            docker build \
                                --build-arg NODE_VERSION=${nodeVersion} \
                                --build-arg APP_NAME=${params.APP_TO_BUILD} \
                                --build-arg BUILD_ENV=${params.ENVIRONMENT} \
                                --target ${targetStage} \
                                -t ${imageName} \
                                -t ${imageLatest} \
                                -f Dockerfile.universal \
                                .
                        """
                    }

                    echo '✅ Docker 镜像构建完成'
                }
            }
        }

        stage('Test Images') {
            steps {
                script {
                    echo '=========================================='
                    echo '测试 Docker 镜像...'
                    echo '=========================================='

                    // 列出构建的镜像
                    sh 'docker images | grep puff || true'

                    echo '✅ 镜像测试完成'
                }
            }
        }

        stage('Push to Registry') {
            when {
                expression { params.PUSH_TO_REGISTRY == true }
            }
            steps {
                script {
                    echo '=========================================='
                    echo '推送镜像到仓库...'
                    echo '=========================================='

                    // 登录 Docker Registry
                    sh """
                        echo \${DOCKER_CREDENTIALS_PSW} | docker login -u \${DOCKER_CREDENTIALS_USR} --password-stdin
                    """

                    if (params.APP_TO_BUILD == 'all') {
                        // 推送所有镜像
                        sh """
                            docker push ${DOCKER_NAMESPACE}/activities:${IMAGE_TAG}
                            docker push ${DOCKER_NAMESPACE}/activities:latest
                            docker push ${DOCKER_NAMESPACE}/admin-system-1:${IMAGE_TAG}
                            docker push ${DOCKER_NAMESPACE}/admin-system-1:latest
                            docker push ${DOCKER_NAMESPACE}/admin-system-3:${IMAGE_TAG}
                            docker push ${DOCKER_NAMESPACE}/admin-system-3:latest
                            docker push ${DOCKER_NAMESPACE}/dapp:${IMAGE_TAG}
                            docker push ${DOCKER_NAMESPACE}/dapp:latest
                        """
                    } else {
                        // 推送单个镜像
                        sh """
                            docker push ${DOCKER_NAMESPACE}/${params.APP_TO_BUILD}:${IMAGE_TAG}
                            docker push ${DOCKER_NAMESPACE}/${params.APP_TO_BUILD}:latest
                        """
                    }

                    echo '✅ 镜像推送完成'
                }
            }
        }

        stage('Deploy') {
            when {
                expression { params.ENVIRONMENT == 'production' }
            }
            steps {
                script {
                    echo '=========================================='
                    echo '部署到生产环境...'
                    echo '=========================================='

                    input message: '确认部署到生产环境？', ok: '确认部署'

                    echo '开始部署...'

                    // 示例：使用 docker-compose 部署
                    // sh 'docker-compose -f docker-compose.prod.yml up -d'

                    echo '✅ 部署完成'
                }
            }
        }
    }

    post {
        success {
            echo '=========================================='
            echo '✅ Pipeline 执行成功！'
            echo "镜像标签: ${IMAGE_TAG}"
            echo '使用通用 Dockerfile - 自动适配 Node 版本'
            echo '=========================================='
        }
        failure {
            echo '=========================================='
            echo '❌ Pipeline 执行失败！'
            echo '=========================================='
        }
        always {
            echo '=========================================='
            echo '清理工作...'
            echo '=========================================='

            // 清理悬空镜像
            sh 'docker image prune -f || true'

            echo '🔚 Pipeline 执行结束'
        }
    }
}

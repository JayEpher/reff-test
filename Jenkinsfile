pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo '=========================================='
                echo '开始拉取代码...'
                echo 'Git 仓库: git@github.com:JayEpher/reff-test.git'
                echo '=========================================='

                // 拉取 Git 仓库代码
                // 方式 1: 使用 Jenkins 配置的 SCM（推荐）
                checkout scm

                // 方式 2: 手动指定 Git 仓库（如果需要）
                // checkout([
                //     $class: 'GitSCM',
                //     branches: [[name: '*/main']],
                //     userRemoteConfigs: [[
                //         url: 'git@github.com:JayEpher/reff-test.git',
                //         credentialsId: 'github-ssh-key'  // Jenkins 中配置的 SSH 凭证 ID
                //     ]]
                // ])

                echo '✅ 代码拉取完成！'

                // 显示当前分支信息
                sh 'echo "\n当前分支:"'
                sh 'git branch'

                // 显示最新的 commit 信息
                sh 'echo "\n最新提交信息:"'
                sh 'git log -1 --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nMessage: %s%n"'
            }
        }

        stage('Show Info') {
            steps {
                echo '显示项目信息...'

                // 显示当前工作目录
                sh 'pwd'

                // 列出项目文件
                sh 'ls -la'

                // 显示 Node.js 和 pnpm 版本（如果已安装）
                script {
                    try {
                        sh 'node -v'
                        sh 'pnpm -v'
                    } catch (Exception e) {
                        echo 'Node.js 或 pnpm 未安装，跳过版本检查'
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline 执行成功！'
        }
        failure {
            echo '❌ Pipeline 执行失败！'
        }
        always {
            echo '🔚 Pipeline 执行结束'
        }
    }
}

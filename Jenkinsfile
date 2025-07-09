pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    ls -ls
                    node --version
                    npm --version
                    npm ci
                    npm run build
                    ls -la
                '''
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo 'Test stage'
                sh '''
                    if test -f build/index.html; then
                        echo "index.html exists"
                    else 
                        echo "index.html not found"
                        exit 1
                    fi
                '''
                sh 'npm test'
            }
        }
    }

    post {
        always {
            junit 'test-results/junit.xml'
        }
    }
}

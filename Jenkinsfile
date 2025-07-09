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
            steps {
                echo 'Test stage'
                sh '''
                if test  -f build/index.html; then
                    echo "index.html exists"
                else 
                    echo "not exists"
                    exit 1
                fi                

                '''
            } 
        }
    }
    post {
        always {
            junit 'test-results/junit.xml'
        }
    }
}

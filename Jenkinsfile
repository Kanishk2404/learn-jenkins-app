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
                if test  -f index.html/build; then
                    echo "index.html/build exists"
                else 
                    echo "not exists"
                    exit 1
                fi                

                '''
            } 
        }
    }
}

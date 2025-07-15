pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = '9fd3d771-4f1c-4cb6-bb4a-24baed856e06'
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Installing dependencies..."
                    npm ci
                    echo "Running build..."
                    npm run build
                '''
            }
        }

        stage('Tests') {
            parallel {
                stage('Unit Tests') {
                    agent {
                        docker {
                            image 'node:18-alpine'
                            reuseNode true
                        }
                    }
                    steps {
                        sh '''
                            echo "Running unit tests..."
                            npm test
                        '''
                    }
                    post {
                        always {
                            junit 'jest-results/junit.xml' // Optional: depends if using jest-junit reporter
                        }
                    }
                }

                stage('E2E Tests (Local)') {
                    agent {
                        docker {
                            image 'mcr.microsoft.com/playwright:v1.39.0-jammy'
                            reuseNode true
                        }
                    }
                    steps {
                        sh '''
                            echo "Installing HTTP server..."
                            npm install serve
                            echo "Starting local server..."
                            node_modules/.bin/serve -s build &

                            echo "Waiting for server..."
                            sleep 10

                            echo "Running Playwright tests..."
                            npx playwright test --reporter=html
                        '''
                    }
                    post {
                        always {
                            publishHTML([
                                reportDir: 'playwright-report',
                                reportFiles: 'index.html',
                                reportName: 'Playwright Local',
                                allowMissing: false,
                                keepAll: true
                            ])
                        }
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    echo "Installing Netlify CLI..."
                    npm install netlify-cli

                    echo "Deploying to Staging..."
                    node_modules/.bin/netlify deploy --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID --dir=build
                '''
            }
        }

        stage('Deploy to Production') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    echo "Installing Netlify CLI..."
                    npm install netlify-cli

                    echo "Deploying to Production..."
                    node_modules/.bin/netlify deploy --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID --dir=build --prod
                '''
            }
        }

        stage('E2E Tests (Prod URL)') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.39.0-jammy'
                    reuseNode true
                }
            }

            environment {
                CI_ENVIRONMENT_URL = 'https://gregarious-dango-f714f1.netlify.app'
            }

            steps {
                sh '''
                    echo "Running Playwright E2E tests on deployed site..."
                    npx playwright test --reporter=html
                '''
            }

            post {
                always {
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright E2E',
                        allowMissing: false,
                        keepAll: true
                    ])
                }
            }
        }
    }
}

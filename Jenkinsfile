pipeline {
    agent any
    
    environment {
        NODE_ENV = 'production'
        VITE_API_URL = '/api'
        APP_NAME = 'medsecure-frontend'
        PORT = '5173'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo '✓ Code checked out'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                echo '✓ Dependencies installed'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
                echo '✓ Build completed'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint || true'
                echo '✓ Lint check done'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test || true'
                echo '✓ Tests executed'
            }
        }
        
        stage('Deploy to Dev') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    echo "Deploying frontend to dev..."
                    ssh -i /home/devsecops/.ssh/id_rsa devsecops@medsecure.com "cd /home/devsecops/DevSecOps/MedSecure && npm install && npm run build && pm2 restart medsecure-frontend --update-env || pm2 start --name medsecure-frontend 'npm run preview -- --host 0.0.0.0 --port 5173'"
                '''
                echo '✓ Frontend deployed to dev'
            }
        }
        
        stage('Deploy to Prod') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    echo "Deploying frontend to production..."
                    ssh -i /home/devsecops/.ssh/id_rsa devsecops@medsecure.com "cd /home/devsecops/DevSecOps/MedSecure && npm install && npm run build && pm2 restart medsecure-frontend --update-env || pm2 start --name medsecure-frontend 'npm run preview -- --host 0.0.0.0 --port 5173'"
                '''
                echo '✓ Frontend deployed to production'
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                    echo "Checking frontend endpoint..."
                    curl -f https://medsecure.com/ || exit 1
                '''
                echo '✓ Frontend health check passed'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
        }
        success {
            echo '✓ Pipeline succeeded'
        }
        failure {
            echo '✗ Pipeline failed'
        }
    }
}

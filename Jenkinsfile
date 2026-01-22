pipeline {
    agent any

    environment {
        // EC2 details
        EC2_USER = "ubuntu"
        EC2_HOST = "15.134.60.252"
        APP_DIR  = "/home/ubuntu/AMPORA"

        // Google Maps API key (Jenkins Credentials)
        VITE_GOOGLE_MAPS_API_KEY = credentials('VITE_GOOGLE_MAPS_API_KEY')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ampora1/ampora.git'
            }
        }

        stage('Deploy Frontend to EC2') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'
                      set -e
                      cd $APP_DIR

                      git pull origin numidu

                      # build & run frontend with Google Maps key
                      export VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

                      docker compose up -d --build
                    EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Frontend successfully deployed to EC2"
        }
        failure {
            echo "❌ Frontend deployment failed"
        }
    }
}

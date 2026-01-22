pipeline {
    agent any

    environment {
        EC2_USER = "ubuntu"
        EC2_HOST = "15.134.60.252"
        APP_DIR  = "/home/ubuntu/AMPORA"

        VITE_GOOGLE_MAPS_API_KEY = credentials('VITE_GOOGLE_MAPS_API_KEY')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ampora1/ampora.git'
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << EOF
                      set -e
                      cd ${APP_DIR}

                      git pull origin numidu

                      export VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

                      docker compose up -d --build
                    EOF
                    """
                }
            }
        }
    }
}

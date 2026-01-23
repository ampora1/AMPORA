pipeline {
    agent any

    environment {
        EC2_USER = "ubuntu"
        EC2_HOST = "15.134.60.252"
        APP_DIR  = "/home/ubuntu/AMPORA"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/ampora1/AMPORA.git'
            }
        }

  stage('Deploy to EC2') {
    steps {
        sshagent(['ec2-key']) {
            withCredentials([
                string(credentialsId: 'VITE_GOOGLE_MAPS_API_KEY',
                       variable: 'VITE_GOOGLE_MAPS_API_KEY')
            ]) {
                sh '''
                ssh -o StrictHostKeyChecking=no ubuntu@15.134.60.252 "
                  set -e

                  if [ ! -d /home/ubuntu/AMPORA ]; then
                    git clone https://github.com/ampora1/AMPORA.git /home/ubuntu/AMPORA
                  fi

                  cd /home/ubuntu/AMPORA
                  git fetch origin
                  git checkout main
                  git reset --hard origin/main

                  export VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
                  docker compose up -d --build
                "
                '''
            }
        }
    }
}


    }
}

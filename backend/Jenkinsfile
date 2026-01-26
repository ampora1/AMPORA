pipeline {
    agent any

    environment {
        IMAGE_NAME = "numidu/ampora_backend:${BUILD_NUMBER}"
        VM_USER    = "ec2-user"
        VM_IP      = "13.211.243.202"
    }

    stages {

        stage('Checkout Source') {
            steps {
                git branch: 'main', url: 'https://github.com/ampora1/ampora_backend.git'
            }
        }

        stage('Build JAR') {
            steps {
                sh '''
                    rm -rf target
                    mvn clean package -DskipTests -U
                '''
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        docker build --build-arg CACHE_BUST=$BUILD_NUMBER -t $IMAGE_NAME .
                        docker push $IMAGE_NAME
                        docker tag $IMAGE_NAME numidu/ampora_backend:latest
                        docker push numidu/ampora_backend:latest
                    """
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2_key', keyFileVariable: 'SSH_KEY_PATH')]) {
                    sh """
                        echo "Deploying to AWS EC2..."
                        scp -i \$SSH_KEY_PATH -o StrictHostKeyChecking=no docker-compose.yml ${VM_USER}@${VM_IP}:~/docker-compose.yml
                        ssh -i \$SSH_KEY_PATH -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} '
                            docker pull numidu/ampora_backend:latest
                            docker compose down
                            docker compose pull
                            docker compose up -d --force-recreate
                        '
                        echo "Deployment complete"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ AWS Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed. Check Jenkins logs."
        }
    }
}

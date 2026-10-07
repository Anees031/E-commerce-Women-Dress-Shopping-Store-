pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "anes5301/women-shopping-cart"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'

                bat '''
                    set "PATH=C:\\Program Files\\nodejs;%PATH%"

                    if not exist "Women Shopping Cart\\index.html" exit /b 1
                    if not exist "Women Shopping Cart\\script.js" exit /b 1
                    if not exist "Women Shopping Cart\\styles.css" exit /b 1

                    node --check "Women Shopping Cart\\script.js"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'

                bat '''
                    set "PATH=C:\\Users\\Arcana\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;%PATH%"

                    docker --version

                    docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% .

                    docker tag %DOCKER_IMAGE%:%BUILD_NUMBER% %DOCKER_IMAGE%:latest
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat '''
                        set "PATH=C:\\Users\\Arcana\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;%PATH%"

                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

                        if errorlevel 1 (
                            echo Docker Hub login failed.
                            exit /b 1
                        )

                        docker push %DOCKER_IMAGE%:%BUILD_NUMBER%

                        if errorlevel 1 (
                            echo Docker image push failed.
                            docker logout
                            exit /b 1
                        )

                        docker push %DOCKER_IMAGE%:latest

                        if errorlevel 1 (
                            echo Docker latest tag push failed.
                            docker logout
                            exit /b 1
                        )

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '===================================='
            echo 'PIPELINE SUCCESS'
            echo 'Docker image pushed successfully!'
            echo '===================================='
        }

        failure {
            echo '===================================='
            echo 'PIPELINE FAILED'
            echo 'Check the stage that failed.'
            echo '===================================='
        }
    }
}


#!/usr/bin/env groovy
import java.util.Date
import groovy.json.*
def repoName = 'vas-aggregator-subscription-billing'
def projectName = 'vas-aggregator-subscription-billing'
def deploymentName = 'vas-aggregator-subscription-billing'
def isMaster = env.BRANCH_NAME == 'iykejordan-master'
def isStaging = env.BRANCH_NAME == 'iykejordan-staging'
def isMaster2 = env.BRANCH_NAME == 'Terragon-deploy'
def isStaging2 = env.BRANCH_NAME == 'terragon-staging'
def start = new Date()
def acr_host = 'aggregator2.azurecr.io'
def err = null
def jobInfo = "${env.JOB_NAME} ${env.BUILD_DISPLAY_NAME} \n${env.BUILD_URL}"
def imageTag = "${env.BUILD_NUMBER}"
String jobInfoShort = "${env.JOB_NAME} ${env.BUILD_DISPLAY_NAME}"
String buildStatus
String timeSpent
currentBuild.result = "SUCCESS"
try {
    node {
        deleteDir()
        stage('initializing'){
            slackSend (color: 'good', message: "Initializing build process for `${repoName}` ...")
        }
        stage ('Checkout') {
            checkout scm
        }
        stage ('Install Dependencies') {
            sh 'eval \$(ssh-agent); ssh-add /var/lib/jenkins/.ssh/terra-bot; npm install --production'
        }
        stage("test deployment") {
            try {
                if(isMaster || isStaging){
                    sh 'kubectl apply --validate=true --dry-run=true -f kubernetes/ --context azurek8s2'
                }
                if(isMaster2 || isStaging2 ){
                    sh 'kubectl apply --validate=true --dry-run=true -f kubernetes/ --context i-040acc9d4cf316c92@k8scluster.us-west-2.eksctl.io'
                }
            }
            catch (error) {
                    slackSend (color: 'danger', message: ":disappointed: Build failed: ${jobInfo} ${timeSpent}")
                    throw error
                }
            }
        
        if(isStaging || isMaster){
            stage ('Push Docker to ACR') {
                withCredentials([usernamePassword(credentialsId: 'azure-acr2', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASSWD')]) {
                    sh 'docker login -u ${ACR_USER} -p ${ACR_PASSWD} ${acr_host}'
                    sh "docker build -t ${acr_host}/${projectName}/${repoName}:${imageTag} ."   
                    sh "docker push ${acr_host}/${projectName}/${repoName}:${imageTag}"
                }
            }
        }
        
        if(isStaging2 || isMaster2){
            stage ('Push Docker to AWS ECR') {
                    sh "\$(aws ecr get-login --no-include-email --region ${AWS_ECR_REGION})"
                    sh "docker build -t ${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:${imageTag} ."
                    pushImage(repoName, projectName, imageTag)
                    slackSend (color: 'good', message: "docker image on `${env.BRANCH_NAME}` branch in `${repoName}` pushed to *_AWS ECR_*")
                }
        }
        
        slackSend (color: 'good', message: "docker image on `${env.BRANCH_NAME}` branch in `${repoName}` pushed to ACR")
        
        if(isMaster || isStaging){
            stage ('Deploy to Kubernetes') {
                azureDeploy(deploymentName, imageTag, projectName,repoName, isMaster)
                slackSend (color: 'good', message: ":fire: Nice work! `${repoName}` deployed to Kubernetes")
            }
            stage('Clean up'){
                sh "docker rmi ${acr_host}/${projectName}/${repoName}:${imageTag}"
            }
        }

        if(isMaster2 || isStaging2 ){
            stage ('Deploy to Kubernetes') {
                awsDeploy(deploymentName, imageTag, projectName,repoName, isMaster2)
                slackSend (color: 'good', message: ":fire: Nice work! `${repoName}` deployed to *_Kubernetes_*")
            }
            stage('Clean up'){
                sh "docker rmi ${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:${imageTag}"
            }
        }

    }
} catch (caughtError) {
    err = caughtError
    currentBuild.result = "FAILURE"
} finally {
    timeSpent = "\nTime spent: ${timeDiff(start)}"
    if (err) {
        slackSend (color: 'danger', message: ":disappointed: Build failed: ${jobInfo} ${timeSpent} ${err}")
    } else {
        if (currentBuild.previousBuild == null) {
            buildStatus = 'First time build'
        } else if (currentBuild.previousBuild.result == 'SUCCESS') {
            buildStatus = 'Build complete'
        } else {
            buildStatus = 'Back to normal'
        }
        slackSend (color: 'good', message: "${jobInfo}: ${timeSpent}")
    }
}
def timeDiff(st) {
    def delta = (new Date()).getTime() - st.getTime()
    def seconds = delta.intdiv(1000) % 60
    def minutes = delta.intdiv(60 * 1000) % 60
    return "${minutes} min ${seconds} sec"
}
def azureDeploy(deploymentName, imageTag, projectName,repoName, isMaster){
    def namespace = isMaster ? "production" : "staging"
    sh("sed -i.bak 's|${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:latest|${ACR_NEW_HOST}/${projectName}/${repoName}:${env.BUILD_NUMBER}|' ./kubernetes/vas-aggregator-subscription-billing-deployment.yaml")
    try{
        sh "kubectl apply --namespace=${namespace}  -f kubernetes/ --context azurek8s2"
    }
    catch (err) {
        slackSend (color: 'danger', message: ":disappointed: Build failed: ${jobInfo} ${err}")
    }
}
def awsDeploy(deploymentName, imageTag, projectName,repoName, isMaster2){
    def namespace = isMaster2 ? "aggregator" : "aggregator-staging"
    sh("sed -i.bak 's|${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:latest|${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:${env.BUILD_NUMBER}|' ./kubernetes/vas-aggregator-subscription-billing-deployment.yaml")
    try{
        sh "kubectl apply --namespace=${namespace}  -f kubernetes/ --context i-040acc9d4cf316c92@k8scluster.us-west-2.eksctl.io"
    }
    catch (err) {
        slackSend (color: 'danger', message: ":disappointed: Build failed: ${jobInfo} ${err}")
    }
}
def pushImage(repoName, projectName, imageTag){
    try{
        sh "docker push ${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:${imageTag}"
    }catch(e){
        sh "aws ecr create-repository --repository-name ${projectName}/${repoName} --region ${AWS_ECR_REGION}"
         //sh "aws ecr set-repository-policy --repository-name ${projectName}/${repoName} --policy-text file://policy.json --region ${AWS_ECR_REGION}"
        sh "docker push ${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:${imageTag}"
    }
}

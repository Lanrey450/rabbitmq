#!/usr/bin/env groovy
import java.util.Date
import groovy.json.*
def repoName = 'vas-aggregator-subscription-billing-service'
def projectName = 'vas-aggregator-subscription-billing-service'
def deploymentName = 'vas-aggregator-subscription-billing-service'
def isMaster = env.BRANCH_NAME == 'master'
def isStaging = env.BRANCH_NAME == 'develop'
def start = new Date()
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
            sh 'npm install --production'
        }

       stage("test deployment") {
         try {
             sh 'kubectl apply --validate=true --dry-run=true -f kubernetes/ --context azurek8s'
           }
           catch (error) {
             slackSend (color: 'danger', message: ":disappointed: _Build failed_: ${jobInfo} ${timeSpent}")
             throw error
          }
       }
      stage ('Push Docker to ACR') {
            sh "docker login -u ${ACR_USER} -p ${ACR_PASSWD} ${ACR_HOST}"
            sh "docker build -t ${ACR_HOST}/${projectName}/${repoName}:${imageTag} ."   
            pushImage(repoName, projectName, imageTag)
            slackSend (color: 'good', message: "docker image on `${env.BRANCH_NAME}` branch in `${repoName}` pushed to *_ACR_*")
        }
      if(isMaster || isStaging){
            stage ('Deploy to Kubernetes') {
                deploy(deploymentName, imageTag, projectName,repoName, isMaster)
                slackSend (color: 'good', message: ":fire: Nice work! `${repoName}` deployed to *_Kubernetes_*")
            }
      }
     stage('Clean up'){
          sh "docker rmi ${ACR_HOST}/${projectName}/${repoName}:${imageTag}"
         }
    }
} catch (caughtError) {
    err = caughtError
    currentBuild.result = "FAILURE"
} finally {
     timeSpent = "\nTime spent: ${timeDiff(start)}"
    if (err) {
        slackSend (color: 'danger', message: ":disappointed: _Build failed_: ${jobInfo} ${timeSpent} ${err}")
    } else {
        if (currentBuild.previousBuild == null) {
            buildStatus = '_First time build_'
        } else if (currentBuild.previousBuild.result == 'SUCCESS') {
            buildStatus = '_Build complete_'
        } else {
            buildStatus = '_Back to normal_'
        }
        slackSend (color: 'good', message: "${jobInfo}: ${timeSpent}")
    }
}
def deploy(deploymentName, imageTag, projectName,repoName, isMaster){
    def namespace = "aggregator"
    sh("sed -i.bak 's|${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:latest|${ACR_HOST}/${projectName}/${repoName}:${env.BUILD_NUMBER}|' ./kubernetes/vas-aggregator-subscription-billing-deployment.yaml")
    try{
        sh "kubectl apply --namespace=${namespace}  -f kubernetes/ --context azurek8s"
    }
    catch (err) {
        slackSend (color: 'danger', message: ":disappointed: _Build failed_: ${jobInfo} ${err}")
    }
}
def pushImage(repoName, projectName, imageTag){
    try{
        sh "docker push ${ACR_HOST}/${projectName}/${repoName}:${imageTag}"
    }catch(e){
    }
}
def timeDiff(st) {
    def delta = (new Date()).getTime() - st.getTime()
    def seconds = delta.intdiv(1000) % 60
    def minutes = delta.intdiv(60 * 1000) % 60
    return "${minutes} min ${seconds} sec"
}

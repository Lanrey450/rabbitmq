#!/usr/bin/env groovy
import java.util.Date
import groovy.json.*
def repoName = 'vas-aggregator-subscription-billing'
def projectName = 'vas-aggregator-subscription-billing'
def deploymentName = 'vas-aggregator-subscription-billing'

def isMaster = env.BRANCH_NAME == 'iykejordan-master'
def isStaging = env.BRANCH_NAME == 'develop'

def start = new Date()
def acr_host = 'aggregator.azurecr.io'

def acr_host2 = 'aggregator2.azurecr.io'

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

        if(isMaster){
    stage ('Push Docker to ACR') {
             withCredentials([usernamePassword(credentialsId: 'azure-acr2', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASSWD')]) {
               sh "docker login -u ${ACR_USER} -p ${ACR_PASSWD} ${acr_host2}"
               sh "docker build -t ${acr_host2}/${projectName}/${repoName}:${imageTag} ."   
               sh "docker push ${acr_host2}/${projectName}/${repoName}:${imageTag}"
    }

      slackSend (color: 'good', message: "docker image on `${env.BRANCH_NAME}` branch in `${repoName}` pushed to *_ACR_*")
        }
        }

        if(isStaging){
      stage ('Push Docker to ACR') {
             withCredentials([usernamePassword(credentialsId: 'azure-acr1', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASSWD')]) {
               sh "docker login -u ${ACR_USER} -p ${ACR_PASSWD} ${acr_host}"
               sh "docker build -t ${acr_host}/${projectName}/${repoName}:${imageTag} ."   
               sh "docker push ${acr_host}/${projectName}/${repoName}:${imageTag}"
    }
       slackSend (color: 'good', message: "docker image on `${env.BRANCH_NAME}` branch in `${repoName}` pushed to *_ACR_*")
        }

    }

    
      if(isMaster){
            stage ('Deploy to Kubernetes') {
                deployMaster(deploymentName, imageTag, projectName,repoName, isMaster)
                slackSend (color: 'good', message: ":fire: Nice work! `${repoName}` deployed to *_Kubernetes_*")
            }
      
     stage('Clean up'){
           sh "docker rmi ${acr_host2}/${projectName}/${repoName}:${imageTag}"
         }
      }

    if(isStaging){
            stage ('Deploy to Kubernetes') {
                deploy(deploymentName, imageTag, projectName,repoName, isMaster)
                slackSend (color: 'good', message: ":fire: Nice work! `${repoName}` deployed to *_Kubernetes_*")
            }
      
     stage('Clean up'){
          sh "docker rmi ${ACR_HOST}/${projectName}/${repoName}:${imageTag}"
         }
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


def deployMaster(deploymentName, imageTag, projectName,repoName, isMaster){
    def namespace = isMaster ? "production" : "staging"
    sh("sed -i.bak 's|${AWS_ECR_ACCOUNT}/${projectName}/${repoName}:latest|${ACR_NEW_HOST}/${projectName}/${repoName}:${env.BUILD_NUMBER}|' ./kubernetes/vas-aggregator-subscription-billing-deployment.yaml")
    try{
        sh "kubectl apply --namespace=${namespace}  -f kubernetes/ --context azurek8s2"
    }
    catch (err) {
        slackSend (color: 'danger', message: ":disappointed: Build failed: ${jobInfo} ${err}")
    }
}

def timeDiff(st) {
    def delta = (new Date()).getTime() - st.getTime()
    def seconds = delta.intdiv(1000) % 60
    def minutes = delta.intdiv(60 * 1000) % 60
    return "${minutes} min ${seconds} sec"
}
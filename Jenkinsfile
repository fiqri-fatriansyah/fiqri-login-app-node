import org.jenkinsci.plugins.pipeline.modeldefinition.Utils 

//GIT CHECKOUT
def git_credentials_id = scm.userRemoteConfigs[0].credentialsId
def git_repo = scm.userRemoteConfigs[0].url
def git_branch = scm.branches[0].name
def gitCommitId
def resultlog


//PREPARE
def env_file = 'pt-pos'
def nexus_credentials_id = 'nexus_pos'
def nexus_base_url = 'https://nexus.posindonesia.co.id'
def appFullVersion
def nexus_docker_url_ip = "10.24.7.10:8087"
def nexus_docker_url = "docker.posindonesia.co.id"
def nexus_docker_repo = "mt-2024"
def nexus_docker_group = "docker-group-pos"
def pomappName = "fiqri-ci-cd"
def minioUrl = "http://10.60.64.47:9000"
def minioUser = "mt2024-minio-devkurlog"
def namespace = "kelompok2"

// AZ BUILD
def az_credentials_id = 'azure_id_azam'

def remote = [:]

def skipSonarqube = true
def skipBuildDocker = false
def skipKubernetDev = false

node {
    stage('Checkout') {
        cleanWs()
        git url: "${git_repo}", branch: "${git_branch}", credentialsId: "${git_credentials_id}"
        resultlog = sh(returnStdout: true, script: 'git log  -1 --pretty=%B')
        env.M2_HOME = "/opt/maven"
        env.PATH="/opt/oc:${env.M2_HOME}/bin:${env.PATH}"
    }
 
    stage('Environment'){
        echo resultlog
        if(resultlog.contains("sonar")) {
            skipSonarqube = false
        }
        if(resultlog.contains("skipBuild")){
            skipBuildDocker = true
        } 
        if(resultlog.contains("kubernetDev")){
            skipKubernetDev = true
        } 
         
        sh "echo skipSonarqube: ${skipSonarqube},  skipBuilDockerDev: ${skipBuildDocker}"
    }   

    stage('Prepare') {
        // sh """
        //    echo 'Downloading env file'
        //    """
        // minioDownload bucket: 'env-mt2024', credentialsId: minioUser, file: "/${pomappName}/config-map-dev.yml", host: minioUrl, targetFolder: ''
        // sh """
        //    echo 'Downloading sonar file '
        //    """
        // minioDownload bucket: 'env-mt2024', credentialsId: minioUser, file: "/${pomappName}/sonar-project.properties", host: minioUrl, targetFolder: ''  
        gitCommitId = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
        echo "pomappName: '${pomappName}', gitCommitId:'${gitCommitId}'"
    
    }

    stage('Scan Sonarqube'){ 
        def scannerHome = tool 'SonarScanner';
        withSonarQubeEnv() {
        sh "${scannerHome}/bin/sonar-scanner"
        }    
    }
 
    stage('Build Docker'){
        sh """
            docker build -t ${nexus_docker_repo}/${pomappName}-dev .
            """
        sh """
            docker tag "${nexus_docker_repo}/${pomappName}-dev" "${nexus_docker_url_ip}/${nexus_docker_repo}/${pomappName}-dev:latest"
           """
    }
    
    stage('Push image'){
        if(skipBuildDocker)
        {
            echo 'SKIP Push image Dev'
            Utils.markStageSkippedForConditional('Push image')
        }
        else 
        {
        withEnv(["CREDENTIALID=${nexus_credentials_id}"]) {
           withCredentials([[$class: 'UsernamePasswordMultiBinding',
                credentialsId: "${CREDENTIALID}",
                usernameVariable: 'nexus_username', passwordVariable: 'nexus_password']]) { 
                sh """
                    docker login --username=${nexus_username} --password='${nexus_password}' ${nexus_docker_url_ip}
                    docker push ${nexus_docker_url_ip}/${nexus_docker_repo}/${pomappName}-dev:latest
                    docker logout
                """

                sh """
                     set -e
                     set -x
                     docker rmi ${nexus_docker_repo}/${pomappName}-dev
                     docker rmi ${nexus_docker_url_ip}/${nexus_docker_repo}/${pomappName}-dev:latest
                     
                """
                }
        }
        }
    }

    stage ('Deploy to kubernetes Dev'){     
        renameInFile('\\$configName', "${pomappName}-dev-config", './manifests/deployment.yml')
        renameInFile('\\$configMap', "${pomappName}-dev-config", './manifests/deployment.yml')
        renameInFile('\\$configName', "${pomappName}-dev-config", './config-map-dev.yml')
        renameInFile('\\$image', "${pomappName}-dev", './manifests/deployment.yml')
        renameInFile('\\$replica', '1', './manifests/deployment.yml')
        renameInFile('\\$appName', "${pomappName}", './manifests/deployment.yml')
        renameInFile('\\$appName', "${pomappName}", './manifests/service.yml')
        renameInFile('\\$nameSpace', "${namespace}", './manifests/deployment.yml')
        renameInFile('\\$nameSpace', "${namespace}", './manifests/service.yml')
        renameInFile('\\$nameSpace', "${namespace}", './config-map-dev.yml')
        
        sh 'kubectl config use-context microservice-bootcam-dev'
        sh "kubectl apply -f config-map-dev.yml "
        sh "kubectl apply -f ./manifests"
        try {
        sh "kubectl -n ${namespace} rollout restart deployment ${pomappName}"
        }catch (e) {
            echo 'No restart deployment' + e.toString()
            //throw e
        }
    }  
}


def renameInFile(variable, newvalue, filename)
{ 
    content = readFile(filename)
    content = content.replaceAll(variable, newvalue)
    writeFile file: filename, text: content
}

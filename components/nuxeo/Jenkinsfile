/*
 * (C) Copyright 2017 Nuxeo (http://nuxeo.com/) and others.
 *
 * Contributors:
 *     Thomas Roger <troger@nuxeo.com>
 */

 properties([
    [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '1']],
    disableConcurrentBuilds(),
    [$class: 'RebuildSettings', autoRebuild: false, rebuildDisabled: false],
    pipelineTriggers([
        triggers: [
            [
                $class: 'ReverseBuildTrigger',
                upstreamProjects: "${env.UPSTREAM_PROJECT}", threshold: hudson.model.Result.SUCCESS
            ]
        ]
    ])
 ])

node(env.SLAVE) {
    try {
        timestamps {
            timeout(30) {
                stage('checkout') {
                    // manually clean node_modules folder
                    sh "rm -rf node_modules"

                    checkout scm
                }

                stage ('build and test') {
                    step([$class: 'GitHubCommitStatusSetter',
                        reposSource: [$class: 'ManuallyEnteredRepositorySource', url: 'https://github.com/nuxeo/nuxeo-js-client'],
                        contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: "${env.STATUS_CONTEXT_NAME}"],
                        statusResultSource: [$class: 'ConditionalStatusResultSource',
                        results: [[$class: 'AnyBuildResult', message: 'Building on Nuxeo CI', state: 'PENDING']]]])

                    def jdk = tool name: 'java-8-oracle'
                    env.JAVA_HOME = "${jdk}"
                    def mvnHome = tool name: 'maven-3.3', type: 'hudson.tasks.Maven$MavenInstallation'
                    sh "${mvnHome}/bin/mvn clean verify -f ${env.POM_PATH}"
                    sh "${mvnHome}/bin/mvn verify -f ${env.POM_PATH} -Pes5"
                }

                stage ('post build') {
                    step([$class: 'WarningsPublisher', canComputeNew: false, canResolveRelativePaths: false,
                        consoleParsers: [[parserName: 'Maven']], defaultEncoding: '', excludePattern: '',
                        healthy: '', includePattern: '', messagesPattern: '', unHealthy: ''])
                    archive 'ftest/target/tomcat/log/*.log, ftest/target/js-reports/*.xml, ftest/target/js-reports-es5/*.xml'
                    // TODO cobertura coverage
                    junit 'ftest/target/js-reports/*.xml, ftest/target/js-reports-es5/*.xml'
                    if (env.BRANCH_NAME == 'master') {
                        step([$class: 'JiraIssueUpdater', issueSelector: [$class: 'DefaultIssueSelector'], scm: scm])
                    }
                    if(currentBuild.getPreviousBuild() != null && 'SUCCESS' != currentBuild.getPreviousBuild().getResult()) {
                        mail (to: 'ecm@lists.nuxeo.com', subject: "${env.JOB_NAME} (${env.BUILD_NUMBER}) - Back to normal",
                            body: "Build back to normal: ${env.BUILD_URL}.")
                    }
                    step([$class: 'GitHubCommitStatusSetter',
                        reposSource: [$class: 'ManuallyEnteredRepositorySource', url: 'https://github.com/nuxeo/nuxeo-js-client'],
                        contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: "${env.STATUS_CONTEXT_NAME}"],
                        statusResultSource: [$class: 'ConditionalStatusResultSource',
                        results: [[$class: 'AnyBuildResult', message: 'Successfully built on Nuxeo CI', state: 'SUCCESS']]]])
                }
            }
        }
    } catch(e) {
        currentBuild.result = "FAILURE"
        step([$class: 'ClaimPublisher'])
        archive 'ftest/target/tomcat/log/*.log, ftest/target/js-reports/*.xml, ftest/target/js-reports-es5/*.xml'
        mail (to: 'ecm@lists.nuxeo.com', subject: "${env.JOB_NAME} (${env.BUILD_NUMBER}) - Failure!",
            body: "Build failed ${env.BUILD_URL}.")
        step([$class: 'GitHubCommitStatusSetter',
            reposSource: [$class: 'ManuallyEnteredRepositorySource', url: 'https://github.com/nuxeo/nuxeo-js-client'],
            contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: "${env.STATUS_CONTEXT_NAME}"],
            statusResultSource: [$class: 'ConditionalStatusResultSource',
            results: [[$class: 'AnyBuildResult', message: 'Failed to build on Nuxeo CI', state: 'FAILURE']]]])
        throw e
    } finally {
        step([$class: 'CheckStylePublisher', canComputeNew: false, defaultEncoding: '', healthy: '',
            pattern: 'ftest/target/checkstyle-result.xml', unHealthy: ''])
    }
}

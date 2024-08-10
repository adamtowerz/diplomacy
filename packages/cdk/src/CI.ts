import { Construct } from "constructs";
import { aws_codebuild as codebuild } from "aws-cdk-lib";

export function GitHubCI(scope: Construct, name: string, script: string) {
  //   new codebuild.GitHubSourceCredentials(scope, "CodeBuildGitHubCreds", {
  //     accessToken: SecretValue.secretsManager("deftly-gh-repo-oauth"),
  //   });

  const gitHubSource = codebuild.Source.gitHub({
    owner: "adamtowerz",
    repo: "deftly",
    webhook: true,
    webhookFilters: [
      codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_CREATED, codebuild.EventAction.PULL_REQUEST_UPDATED),
    ],
  });

  new codebuild.Project(scope, name, {
    source: gitHubSource,
    environment: {
      buildImage: codebuild.LinuxBuildImage.fromCodeBuildImageId("aws/codebuild/amazonlinux2-x86_64-standard:4.0"),
    },
    buildSpec: codebuild.BuildSpec.fromObjectToYaml({
      version: 0.2,
      phases: {
        install: {
          "on-failure": "ABORT",
          commands: [
            "node --version",
            "yarn --version",
            "corepack enable",
            "corepack prepare yarn@3.2.2 --activate",
            "yarn plugin import workspace-tools",
            "yarn",
          ],
          "runtime-versions": {
            nodejs: 16,
          },
        },
        build: {
          "on-failure": "ABORT",
          commands: [script],
        },
      },
    }),
  });
}

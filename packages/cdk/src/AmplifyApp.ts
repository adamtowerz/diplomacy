import { Construct } from "constructs";
import { aws_codebuild as codebuild, aws_amplify as amplify, aws_codebuild as CodeBuild } from "aws-cdk-lib";

export function AmplifyApp(scope: Construct, id: string) {
  const amplifyApp = new amplify.CfnApp(scope, id, {
    // sourceCodeProvider: new amplify.({
    //   owner: "adamtowerz",
    //   repository: "deftly",
    //   oauthToken: SecretValue.secretsManager("deftly-gh-repo-oauth"),
    // }),
    // accessToken: SecretValue.secretsManager("deftly-gh-repo-oauth"),

    name: id,
    buildSpec: codebuild.BuildSpec.fromObject({
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.fromCodeBuildImageId("aws/codebuild/amazonlinux2-x86_64-standard:5.0"),
      },
      environmentVariables: {
        GITHUB_PAT: {
          type: CodeBuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: "deftly-clone-common-pat",
        },
      },
      version: "1.0",
      frontend: {
        phases: {
          preBuild: {
            "on-failure": "ABORT",
            commands: [
              "node --version",
              "yarn --version",
              // Set to clone with the PAT as otherwise it can't be cloned. Ideally this would be a service account user with an ssh key in secrets manager
              `git submodule set-url common  "https://adamtowerz:$GITHUB_PAT@github.com/adamtowerz/common.git"`,
              "git submodule update --init",
              "corepack enable",
              "corepack prepare yarn@3.2.2 --activate",
              "yarn plugin import workspace-tools",
              "yarn",
              "cd common",
              "yarn",
              "cd ../",
            ],
          },
          build: {
            "on-failure": "ABORT",
            commands: [
              // recursive topological parallel build, requires plugin
              `yarn workspaces foreach -ptvR --from '${id}' run build`,
            ],
          },
        },
        artifacts: {
          files: ["**/*"],
          baseDirectory: `./deployments/${id}/build`,
        },
      },
    }).toBuildSpec(),
  });

  amplifyApp.customRules = [
    {
      source: "/api/<*>",
      target: "https://deftlyapi.com/<*>",
      status: "200",
    },
    {
      // eslint-disable-next-line no-useless-escape
      source: "</^[^.]+$|.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>",
      target: "/index.html",
      status: "200",
    },
  ];

  return amplifyApp;
}

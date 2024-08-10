import { Construct } from "constructs";
import {
  aws_codepipeline as Codepipeline,
  aws_codebuild as CodeBuild,
  aws_codepipeline_actions as CodepipelineActions,
  aws_iam as iam,
  SecretValue,
} from "aws-cdk-lib";

import { CDK_TOOLKIT_DEPLOY_BUCKET_ARN, CDK_TOOLKIT_DEPLOY_ROLE_ARN, DEFTLY_GITHUB_CODESTAR_ARN } from "./constants.js";

export function setupServicePipeline(scope: Construct, id: string) {
  const pipelineRole = new iam.Role(scope, `${id}-pipeline-role`, {
    assumedBy: new iam.ServicePrincipal("codepipeline.amazonaws.com"),
    description: "Service deployment pipeline role",
    managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCodePipeline_FullAccess")],
  });

  const codestarPolicy = new iam.Policy(scope, `${id}-codestar`);
  codestarPolicy.addStatements(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["codestar-connections:UseConnection"],
      resources: [DEFTLY_GITHUB_CODESTAR_ARN],
    })
  );

  pipelineRole.attachInlinePolicy(codestarPolicy);

  const pipeline = new Codepipeline.Pipeline(scope, `${id}_pipeline`, {
    crossAccountKeys: false,
    pipelineName: `${id}_pipeline`,
    role: pipelineRole,
    pipelineType: Codepipeline.PipelineType.V1,
  });

  const source_stage = pipeline.addStage({
    stageName: "Source",
  });

  const source_output = new Codepipeline.Artifact();
  const source_action = new CodepipelineActions.GitHubSourceAction({
    actionName: `${id}_pipeline_source`,
    output: source_output,
    owner: "adamtowerz",
    repo: "deftly",
    oauthToken: SecretValue.secretsManager("deftly-gh-repo-oauth"),
    branch: "main",
  });

  source_stage.addAction(source_action);

  const build_stage = pipeline.addStage({
    stageName: "Build",
  });

  const build_output = new Codepipeline.Artifact();
  const build_action = new CodepipelineActions.CodeBuildAction({
    actionName: `${id}_build`,
    input: source_output,
    type: CodepipelineActions.CodeBuildActionType.BUILD,
    project: new CodeBuild.Project(scope, `${id}_pipeline_build`, {
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.fromCodeBuildImageId("aws/codebuild/amazonlinux2-x86_64-standard:5.0"),
      },
      environmentVariables: {
        GITHUB_PAT: {
          type: CodeBuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: "deftly-clone-common-pat",
        },
      },
      buildSpec: CodeBuild.BuildSpec.fromObjectToYaml({
        version: 0.2,
        env: {
          "git-credential-helper": "yes",
        },
        phases: {
          install: {
            "on-failure": "ABORT",
            /**
             * This is an absolute mess because the clone source step does not clone the submodule
             */
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
            "runtime-versions": {
              nodejs: 18,
            },
          },
          pre_build: {
            "on-failure": "ABORT",
            commands: [`yarn workspace ${id} run test`],
          },
          build: {
            "on-failure": "ABORT",
            commands: [`yarn workspace ${id} run build`, `ls deployments/${id}/dist`],
          },
        },
        artifacts: {
          files: ["**/*"],
          name: "repo",
          "enable-symlinks": "no",
        },
      }),
    }),
    outputs: [build_output],
  });

  build_stage.addAction(build_action);

  const deploy_stage = pipeline.addStage({
    stageName: "Deploy",
  });

  // This requires that the cdk toolkit deploy role is granted the codebuild principal
  const cdk_deploy_role = iam.Role.fromRoleArn(scope, "imported-role", CDK_TOOLKIT_DEPLOY_ROLE_ARN);

  cdk_deploy_role.attachInlinePolicy(
    new iam.Policy(scope, "pipeline-deploy", {
      statements: [
        // oddly by default put is not provided for the local AWS account, but is provided for all others
        // this has something to do with cross-account deploy behavior I couldn't figure out. ergo this
        new iam.PolicyStatement({
          actions: ["s3:GetObject*", "s3:GetBucket*", "s3:List*", "s3:Abort*", "s3:DeleteObject*", "s3:PutObject*"],
          resources: [CDK_TOOLKIT_DEPLOY_BUCKET_ARN, `${CDK_TOOLKIT_DEPLOY_BUCKET_ARN}/*`],
        }),
        // honestly no clue what needs this
        new iam.PolicyStatement({
          actions: ["iam:GetRole"],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          actions: ["lambda:UpdateFunctionCode", "lambda:UpdateFunctionConfiguration"],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          actions: ["apigateway:*"],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          actions: ["events:*"],
          resources: ["*"],
        }),
      ],
    })
  );

  const deploy_action = new CodepipelineActions.CodeBuildAction({
    actionName: `${id}_deploy`,
    input: build_output,
    type: CodepipelineActions.CodeBuildActionType.BUILD,
    project: new CodeBuild.Project(scope, `${id}_pipeline_deploy`, {
      role: cdk_deploy_role,
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.fromCodeBuildImageId("aws/codebuild/amazonlinux2-x86_64-standard:4.0"),
      },
      buildSpec: CodeBuild.BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          pre_build: {
            "on-failure": "ABORT",
            commands: [
              "ls",
              "node --version",
              "yarn --version",
              "corepack enable",
              "corepack prepare yarn@3.2.2 --activate",
              "yarn plugin import workspace-tools",
              "yarn",
            ],
          },
          build: {
            "on-failure": "ABORT",
            commands: [`yarn workspace ${id} run cdk-deploy`],
          },
        },
      }),
    }),
  });

  deploy_stage.addAction(deploy_action);
}

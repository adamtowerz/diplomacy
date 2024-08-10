import { Construct } from "constructs";
import { aws_iam as iam, aws_secretsmanager as SecretsManager } from "aws-cdk-lib";

export function allowGetSecret(scope: Construct, secretName: string) {
  return new iam.PolicyStatement({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    resources: [SecretsManager.Secret.fromSecretNameV2(scope, secretName, secretName).secretArn! + "-??????"],
    actions: ["secretsmanager:GetSecretValue"],
  });
}

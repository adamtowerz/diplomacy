import { Construct } from "constructs";
import { aws_elasticbeanstalk as ElasticBeanstalk, aws_iam as iam } from "aws-cdk-lib";

export function constructElasticBeanstalk(scope: Construct, id: string) {
  // Create role and instance profile
  const myRole = new iam.Role(scope, `${id}-aws-elasticbeanstalk-ec2-role`, {
    assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
  });

  const managedPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName("AWSElasticBeanstalkWebTier");
  myRole.addManagedPolicy(managedPolicy);

  const myProfileName = `${id}-InstanceProfile`;

  const instanceProfile = new iam.CfnInstanceProfile(scope, myProfileName, {
    instanceProfileName: myProfileName,
    roles: [myRole.roleName],
  });

  const ebApp = new ElasticBeanstalk.CfnApplication(scope, `${id}_eb`, {
    applicationName: `${id}_eb`,
    description: `EB instance for ${id}`,
  });
  ebApp.addDependsOn(instanceProfile);

  const optionSettingProperties: ElasticBeanstalk.CfnEnvironment.OptionSettingProperty[] = [
    {
      namespace: "aws:autoscaling:launchconfiguration",
      optionName: "IamInstanceProfile",
      value: myProfileName,
    },
    {
      namespace: "aws:autoscaling:asg",
      optionName: "MinSize",
      value: "1",
    },
    {
      namespace: "aws:autoscaling:asg",
      optionName: "MaxSize",
      value: "1",
    },
    {
      namespace: "aws:ec2:instances",
      optionName: "InstanceTypes",
      value: "t2.micro",
    },
  ];

  const ebEnv = new ElasticBeanstalk.CfnEnvironment(scope, `${id}_eb_env`, {
    environmentName: `${id}-eb-env`,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    applicationName: ebApp.applicationName!,
    solutionStackName: "64bit Amazon Linux 2 v5.4.9 running Node.js 14",
    optionSettings: optionSettingProperties,
  });

  // TODO
  ebEnv.addDependsOn(ebApp);

  return { ebApp, ebEnv };
}

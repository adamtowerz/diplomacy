import { Construct } from "constructs";
import { aws_lambda as lambda, aws_events_targets as targets, aws_events as events } from "aws-cdk-lib";

type LambdaOptions = {
  handlerFunctionName: string;
  handlerFileName: string;
  handlerDirectoryPath: string;
};

const LAMBDA_OPTIONS_DEFAULTS: LambdaOptions = {
  handlerFunctionName: "handler",
  handlerFileName: "app",
  handlerDirectoryPath: "dist",
};

export function Lambda(scope: Construct, moduleId: string, lambdaName: string, opts?: Partial<LambdaOptions>) {
  const options: LambdaOptions = { ...LAMBDA_OPTIONS_DEFAULTS, ...opts };
  const fn = new lambda.Function(scope, `${moduleId}_${lambdaName}_fn`, {
    runtime: lambda.Runtime.NODEJS_20_X,
    handler: `${options.handlerFileName}.${options.handlerFunctionName}`,
    code: lambda.AssetCode.fromAsset(options.handlerDirectoryPath),
    environment: {
      NODE_ENV: "prod",
    },
  });

  return { fn };
}

export function ScheduleLambda(scope: Construct, name: string, fn: lambda.IFunction, cron: events.CronOptions) {
  const eventRule = new events.Rule(scope, name, {
    schedule: events.Schedule.cron(cron),
  });
  eventRule.addTarget(new targets.LambdaFunction(fn));
}

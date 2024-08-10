import { Construct } from "constructs";
import { aws_apigateway as apigw } from "aws-cdk-lib";
import { constructElasticBeanstalk } from "./eb.js";

// TODO: this doesn't work as I could never figure out how to put the eb behind apigw

export function constructElasticBeanstalkApi(scope: Construct, id: string) {
  const api = new apigw.RestApi(scope, id, {
    description: `API Gateway for ${id}`,
    deployOptions: {
      stageName: "dev",
    },
    defaultCorsPreflightOptions: {
      allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
      allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
      allowCredentials: true,
      // TODO: remove http origin support from api gateway
      allowOrigins: ["http://localhost:3000", "http://app.deftly.so", "https://app.deftly.so", "https://deftly.so"],
    },
  });

  const { ebEnv } = constructElasticBeanstalk(scope, id);

  const apigwIntegration = new apigw.AwsIntegration({
    service: "",
  });

  api.root.addMethod("GET", apigwIntegration);

  return { ebEnv, api };
}

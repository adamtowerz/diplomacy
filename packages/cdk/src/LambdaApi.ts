import { Construct } from "constructs";
import { aws_apigateway as apigw, aws_lambda as lambda, aws_certificatemanager as acm } from "aws-cdk-lib";
import { DEFTLYAPI_COM_ACM_CERT_ARN } from "./constants.js";

export type LambdaApiOptions = {
  description: string;
};

export function LambdaApi(
  scope: Construct,
  moduleId: string,
  apiName: string,
  lambdaFn: lambda.Function,
  { description }: LambdaApiOptions
) {
  const cert = acm.Certificate.fromCertificateArn(scope, `${moduleId}_${apiName}_cert`, DEFTLYAPI_COM_ACM_CERT_ARN);

  //   const domain = new apigw.DomainName(scope, , {
  //     domainName: "deftlyapi.com",
  //     certificate: cert,
  //     endpointType: apigw.EndpointType.EDGE,
  //   });

  const gateway = new apigw.LambdaRestApi(scope, `${moduleId}_${apiName}_gw`, {
    restApiName: `${moduleId}_${apiName}`,
    handler: lambdaFn,
    description,
    defaultCorsPreflightOptions: {
      allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
      allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
      allowCredentials: true,
      allowOrigins: ["http://localhost:3000", "http://app.deftly.so", "https://app.deftly.so", "https://deftly.so"],
    },
  });

  gateway.addDomainName(`${moduleId}_${apiName}_domain`, {
    domainName: "deftlyapi.com",
    certificate: cert,
    basePath: moduleId,
  });

  //   domain.addBasePathMapping(gateway, { basePath: moduleId });

  return { gateway };
}

import * as cdk from "@aws-cdk/core";

import { GitHubCI } from "@deftly/cdk";

class CIStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    GitHubCI(this, "monorepo-test", "yarn test");
  }
}

const app = new cdk.App();
new CIStack(app, "ci-stack", {});
app.synth();

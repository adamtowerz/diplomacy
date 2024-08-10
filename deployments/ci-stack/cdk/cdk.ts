import * as cdk from "@aws-cdk/core";

import { setupServicePipeline, Lambda, LambdaApi, DdbTable, allowTableReadWriteAccess } from "@diplomacy/cdk";

class MegalithStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { fn } = Lambda(this, id, "service");

    LambdaApi(this, id, "service", fn, {
      description: "Gateway to megalith service",
    });

    const { table } = DdbTable(this, "megalith");

    fn.addToRolePolicy(allowTableReadWriteAccess(table));
  }
}

class MegalithSetupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    setupServicePipeline(this, "megalith");
  }
}

const app = new cdk.App();
new MegalithStack(app, "megalith", {});
new MegalithSetupStack(app, "megalith-setup", {});
app.synth();

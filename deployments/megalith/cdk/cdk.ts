import {
  App,
  Construct,
  Stack,
  StackProps,
  //
  setupServicePipeline,
  Lambda,
  LambdaApi,
  DdbTable,
} from "@diplomacy/cdk";

class MegalithStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const OnlineData = DdbTable(this, "online-data");
    OnlineData.addGSI("pk2", "sk2");
    OnlineData.addLSI("lsi1");
    OnlineData.addLSI("lsi2");

    // Megalith service
    const { fn: serviceLambda } = Lambda(this, id, "service");
    LambdaApi(this, id, "service", serviceLambda, {
      description: "Gateway to backend service",
    });
  }
}

class MegalithSetupStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    setupServicePipeline(this, "megalith");
  }
}

const app = new App();
new MegalithStack(app, "megalith", {});
new MegalithSetupStack(app, "megalith-setup", {});
app.synth();

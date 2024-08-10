import { AmplifyApp, Stack, StackProps, Construct, App } from "@deftly/cdk";

class DashboardStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    AmplifyApp(this, id);
  }
}

const app = new App();
new DashboardStack(app, "dashboard", {});
app.synth();

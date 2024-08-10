import { configManager } from "@common/core";

type MegalithConfigKey = "PORT" | "DEPLOYMENT_ID" | "AWS_REGION";

const configSet: configManager.ConfigSchemaSet<MegalithConfigKey> = {
  default: {
    PORT: "3010",
    DEPLOYMENT_ID: "dev",
    AWS_REGION: "us-west-2",
  },
  development: {
    DEPLOYMENT_ID: {
      type: "env-override",
      key: "DEPLOYMENT_ID",
    },
  },
  production: {
    PORT: {
      type: "env-override",
      key: "PORT",
    },
  },
};

const config = configManager.resolveConfig<MegalithConfigKey>(configSet);

configManager.provideConfig(config);

export default config;

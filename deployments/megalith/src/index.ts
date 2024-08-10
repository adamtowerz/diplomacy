import { Logger, env } from "@common/core";

import service from "./service/service";


const log = new Logger("root");
log.info({}, `Starting Megalith (${env.getEnv()})`);

if (env.isLocal()) {
  service.listen();
}

export const handler = service.lambda();

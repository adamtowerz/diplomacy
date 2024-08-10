// eslint-disable-next-line @typescript-eslint/no-unused-vars
import config from "./src/service/config";
import { saveOpenApi } from "@common/web-server";

import service from "./src/service/service";

// This may be loadbearing.
console.log(config.AWS_REGION);

saveOpenApi(service.getOpenApi());

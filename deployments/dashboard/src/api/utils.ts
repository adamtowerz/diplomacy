import { isUndefined } from "lodash-es";

export type PathArgs = Record<string, string | number | boolean>;
export type QueryArgs = Record<string, string | number | boolean>;

// TODO: support optional pathArgs
// TODO: there's gotta be some lib that solves this problem. Maybe even URL
// Assumes path slots (ie `:id`) are unique.
export function constructQS({ endpoint, pathArgs, query }: { endpoint: string; pathArgs?: PathArgs; query?: QueryArgs }): string {
  let path = endpoint;

  if (endpoint.includes(":")) {
    if (!pathArgs) {
      throw new Error("Endpoint includes path args but some are specified");
    }

    const pathSlots = endpoint
      .split("/")
      .filter((p) => p.startsWith(":"))
      .map((p) => p.substring(1));

    if (!pathSlots.every((slot) => pathArgs[slot])) {
      throw new Error("Not all path args are populated");
    }

    pathSlots.forEach((slot) => {
      path = path.replace(`:${slot}`, String(pathArgs[slot]));
    });
  }

  if (query) {
    const queryArgsArray = Object.entries(query).filter(([, v]) => !isUndefined(v));
    const queryString = queryArgsArray.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");

    path = `${path}?${queryString}`;
  }

  return path;
}

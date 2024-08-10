import JWTLib from "jsonwebtoken";
import { secretsManager } from "@common/storage";
import { createTypeSpec, z } from "@common/type-spec";
import { ServiceMemoryCache } from "@common/cache";

export const JwtPayload = createTypeSpec(
  "Refresh-JWT",
  z.object({
    sub: z.string(),
    oid: z.string(),
  })
);

const SigningSecretCache = new ServiceMemoryCache<string>({
  id: "refresh-jwt-secret",
  name: "refresh-jwt-secret",
  prefix: "refresh-jwt-secret",
  lifespan: 60_000,
});

export type JwtPayload = z.TypeOf<typeof JwtPayload>;

const ISSUER = "deftly.co";
const AUDIENCE = "server";

async function getSigningSecret(): Promise<string> {
  const cachedValue = await SigningSecretCache.get("secret");

  if (cachedValue) {
    return cachedValue;
  }

  const secret = await secretsManager.getSecret("deftly-refresh-jwt-signing-secret");
  await SigningSecretCache.set("secret", secret);
  return secret;
}

async function generate({ userId, oid }: { userId: string; oid: string }): Promise<string> {
  const key = await getSigningSecret();

  const jwt = JWTLib.sign({ sub: userId, oid }, key, { expiresIn: "30d", issuer: ISSUER, audience: AUDIENCE });

  return jwt;
}

async function verify(jwt: string): Promise<{ payload: JwtPayload }> {
  const key = await getSigningSecret();

  const content = JWTLib.verify(jwt, key, { complete: true, issuer: ISSUER, audience: AUDIENCE });

  const payload = JwtPayload.parse(content.payload);

  return { payload };
}

const RefreshJWT = {
  generate,
  verify,
};

export { RefreshJWT };

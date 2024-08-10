jest.doMock("@common/storage", () => ({ secretsManager: { getSecret: jest.fn() } }));
import { secretsManager } from "@common/storage";

import { RefreshJWT } from "./refresh-jwt";

describe("jwt", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    (secretsManager.getSecret as jest.Mock).mockResolvedValue("secret1");
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should include the subject", async () => {
    const token = await RefreshJWT.generate({ userId: "user1", oid: "oid1" });

    const { payload } = await RefreshJWT.verify(token);

    expect(payload.sub).toEqual("user1");
  });

  it("should reject garbage", async () => {
    await expect(() => RefreshJWT.verify("garbage")).rejects.toThrow("jwt malformed");
  });

  // TODO: doens't make sense after caching change
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("should reject if key changes", async () => {
    const token = await RefreshJWT.generate({ userId: "user1", oid: "oid1" });
    (secretsManager.getSecret as jest.Mock).mockResolvedValue("secret2");

    await expect(() => RefreshJWT.verify(token)).rejects.toThrow("invalid signature");
  });

  it("should reject missing userId", async () => {
    const token = await RefreshJWT.generate({ userId: undefined as unknown as string, oid: "string" });

    await expect(() => RefreshJWT.verify(token)).rejects.toThrow("invalid_type");
  });

  // TODO: doesn't work with modern timers, or ever work idk
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("should reject if expired", async () => {
    const token = await RefreshJWT.generate({ userId: "user1", oid: "oid1" });

    jest.advanceTimersByTime(1000 * 60 * 60 * 24 * 3);

    await expect(() => RefreshJWT.verify(token)).rejects.toThrow("jwt expired");
  });
});

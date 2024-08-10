export class TokenManager {
  private tokenKey: string;

  constructor(tokenKey: string) {
    this.tokenKey = tokenKey;
  }

  get(): string | undefined {
    const token = localStorage.getItem(this.tokenKey);

    if (!token) {
      // Would rather return undefined than null
      return undefined;
    }

    return token;
  }

  getExpiry(): string {
    const token = this.get();
    if (!token) {
      throw new Error("No auth token");
    }

    try {
      const encodedPayload = token.split(".")[1];
      const payload = JSON.parse(encodedPayload);

      if (!payload.exp) {
        throw new Error("No token expiry");
      }

      return payload.exp;
    } catch (e) {
      throw new Error("Token malformed", { cause: e });
    }
  }

  set(t: string) {
    localStorage.setItem(this.tokenKey, t);
  }

  clear() {
    localStorage.removeItem(this.tokenKey);
  }
}

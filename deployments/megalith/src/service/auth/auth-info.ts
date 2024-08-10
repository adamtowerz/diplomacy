import { OrgId, EmailUtils, error } from "@common/core";

import { Orgs } from "../../app/orgs/orgs";

type AuthInfo = {
  orgId: OrgId;
  authType: "password";
};

async function getByEmail(email: string): Promise<AuthInfo> {
  const { domain } = EmailUtils.parse(email);
  const org = await Orgs.getByDomain(domain);

  if (!org) {
    throw new error.NotFoundError(`Could not find org for domain "${domain}"`);
  }

  if (org.auth.type !== "password") {
    throw new error.NotYetImplemented(`Auth type of ${org.auth.type} is not yet supported`);
  }

  return { orgId: org.oid, authType: org.auth.type };
}

const AuthInfo = {
  getByEmail,
};

export { AuthInfo };

// (username, organization) -> login method

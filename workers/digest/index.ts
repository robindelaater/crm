import { getDb } from "$lib/server/db";
import {
  listContractsNeedingAttention,
  type ContractNeedingAttention,
} from "$lib/server/attention";
import { digestContracts, digestSubject, isSendingHour } from "./digest";

type Env = {
  DB: D1Database;
  RESEND_API_KEY: string;
  DIGEST_FROM: string;
  DIGEST_TO: string;
  APP_URL: string;
};

const digestTemplateId = "contract-approval";

const send = async (env: Env, contracts: ContractNeedingAttention[]) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.DIGEST_FROM,
      to: env.DIGEST_TO,
      subject: digestSubject(contracts),
      template: {
        id: digestTemplateId,
        variables: { contracts: digestContracts(contracts, env.APP_URL) },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the digest: ${response.status} ${await response.text()}`);
  }
};

const sendDigest = async (env: Env) => {
  const contracts = await listContractsNeedingAttention(getDb(env.DB));

  if (contracts.length === 0) return { sent: false, count: 0 };

  await send(env, contracts);

  return { sent: true, count: contracts.length };
};

export default {
  async scheduled(controller, env: Env, ctx) {
    if (!isSendingHour(new Date(controller.scheduledTime))) return;

    ctx.waitUntil(sendDigest(env));
  },
} satisfies ExportedHandler<Env>;

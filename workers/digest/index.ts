import { getDb } from "$lib/server/db";
import { listContractsNeedingAttention } from "$lib/server/attention";
import { digestHtml, digestSubject, digestText, isSendingHour } from "./digest";

type Env = {
  DB: D1Database;
  RESEND_API_KEY: string;
  DIGEST_FROM: string;
  DIGEST_TO: string;
  APP_URL: string;
};

const send = async (env: Env, body: Record<string, string>) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from: env.DIGEST_FROM, to: env.DIGEST_TO, ...body }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the digest: ${response.status} ${await response.text()}`);
  }
};

const sendDigest = async (env: Env) => {
  const contracts = await listContractsNeedingAttention(getDb(env.DB));

  if (contracts.length === 0) return { sent: false, count: 0 };

  await send(env, {
    subject: digestSubject(contracts),
    text: digestText(contracts, env.APP_URL),
    html: digestHtml(contracts, env.APP_URL),
  });

  return { sent: true, count: contracts.length };
};

export default {
  async scheduled(controller, env: Env, ctx) {
    if (!isSendingHour(new Date(controller.scheduledTime))) return;

    ctx.waitUntil(sendDigest(env));
  },
} satisfies ExportedHandler<Env>;

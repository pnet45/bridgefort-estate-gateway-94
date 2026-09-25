import { PostHog } from "npm:posthog-node";

export const captureServerEvent = async (
  distinctId: string,
  event: string,
  properties: Record<string, unknown>,
) => {
  const projectToken = Deno.env.get("POSTHOG_PROJECT_TOKEN");
  const host = Deno.env.get("POSTHOG_HOST");
  if (!projectToken || !host) return;

  const client = new PostHog(projectToken, { host });
  client.capture({ distinctId, event, properties });
  await client.shutdown();
};

export const getPostHogDistinctId = (req: Request, fallback: string) =>
  req.headers.get("X-POSTHOG-DISTINCT-ID") || fallback;

export const getPostHogSessionId = (req: Request) =>
  req.headers.get("X-POSTHOG-SESSION-ID") || undefined;

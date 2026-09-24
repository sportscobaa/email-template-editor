import { normalizeTemplate } from "@/lib/email/blocks";
import { renderEmail } from "@/lib/email/renderer";

/**
 * POST a template JSON (the same shape "Save JSON" downloads) and get the
 * email HTML back. Useful for rendering templates from a backend or CI.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const template = normalizeTemplate(body);
  if (!template) {
    return Response.json({ error: "Expected an object with a `blocks` array." }, { status: 400 });
  }

  return new Response(renderEmail(template), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

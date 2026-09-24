import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Reverse proxy /api requests to internal backend service on Render or local backend
      if (url.pathname.startsWith("/api/")) {
        const rawTarget =
          process.env.BACKEND_INTERNAL_URL ||
          (process.env.VITE_API_URL && process.env.VITE_API_URL.includes(".")
            ? process.env.VITE_API_URL
            : "https://rolex-backend-7blq.onrender.com");

        const backendBase = rawTarget.startsWith("http://") || rawTarget.startsWith("https://")
          ? rawTarget
          : `https://${rawTarget}`;

        const targetUrl = `${backendBase.replace(/\/+$/, "")}${url.pathname}${url.search}`;

        const headers = new Headers();
        for (const [key, value] of request.headers.entries()) {
          if (key.toLowerCase() !== "host") {
            headers.set(key, value);
          }
        }

        const body =
          request.method !== "GET" && request.method !== "HEAD"
            ? await request.arrayBuffer()
            : undefined;

        try {
          return await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
          });
        } catch (proxyError) {
          console.error("Failed to proxy API request to:", targetUrl, proxyError);
          return new Response(
            JSON.stringify({ detail: `Proxy Error connecting to backend: ${proxyError}` }),
            {
              status: 502,
              headers: { "content-type": "application/json" },
            },
          );
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

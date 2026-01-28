export interface ActionIDValidateRequest {
  csid: string;
  uid: string;
  action: string;
  enrollment?: boolean;
}

export interface ActionIDValidateResponse {
  verifiedAction: boolean;
  ivScore?: number;
  indicators?: Record<string, unknown>;
}

// Hardcoded ActionID configuration
const ACTIONID_API_URL = 'https://aa-api.a2.ironvest.com';
const ACTIONID_CID = 'ivengprod';

function getApiKey(): string {
  const apiKey = process.env.ACTIONID_API_KEY;
  if (!apiKey) {
    throw new Error('Missing env var: ACTIONID_API_KEY');
  }
  return apiKey;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Server-side validation call per backend integration docs:
 * POST {API_URL}/v1/validate with header apikey.
 * https://actionid-dev-portal.lovable.app/docs/backend-integration
 */
export async function validateActionIDSession(
  req: ActionIDValidateRequest
): Promise<ActionIDValidateResponse> {
  const apiUrl = ACTIONID_API_URL;
  const cid = ACTIONID_CID;
  const apiKey = getApiKey();

  // Best practice: implement retry with exponential backoff for transient failures
  // (network issues, 5xx responses, etc.).
  const maxAttempts = 3;
  const baseDelayMs = 300;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${apiUrl}/v1/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify({
          cid,
          csid: req.csid,
          uid: req.uid,
          action: req.action, // e.g. 'user_enrollment' or 'login'
          enrollment: req.enrollment ?? true,
        }),
      });

      const raw = await response.text();

      let json: ActionIDValidateResponse;
      try {
        json = raw ? (JSON.parse(raw) as ActionIDValidateResponse) : ({} as ActionIDValidateResponse);
      } catch {
        console.error('Unexpected non‑JSON response from ActionID:', raw.slice(0, 300));

        // Retry on non‑JSON only for server errors; otherwise treat as fatal.
        if (response.status >= 500 && attempt < maxAttempts) {
          await sleep(baseDelayMs * 2 ** (attempt - 1));
          continue;
        }

        throw new Error(`ActionID validate failed (${response.status}): non‑JSON response`);
      }

      if (!response.ok) {
        // Retry on typical transient statuses
        if ((response.status >= 500 || response.status === 429) && attempt < maxAttempts) {
          await sleep(baseDelayMs * 2 ** (attempt - 1));
          continue;
        }

        throw new Error(`ActionID validate failed (${response.status})`);
      }

      return json;
    } catch (error) {
      lastError = error;

      // Network-level or unexpected errors: retry up to maxAttempts.
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * 2 ** (attempt - 1));
        continue;
      }

      throw error instanceof Error ? error : new Error('ActionID validate failed (unknown error)');
    }
  }

  // Should be unreachable, but TypeScript requires a return.
  throw lastError instanceof Error ? lastError : new Error('ActionID validate failed after retries');
}


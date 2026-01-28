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

function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    // Fail fast on misconfiguration; avoid logging sensitive values.
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

/**
 * Server-side validation call per backend integration docs:
 * POST {API_URL}/v1/validate with header apikey.
 * https://actionid-dev-portal.lovable.app/docs/backend-integration
 */
export async function validateActionIDSession(
  req: ActionIDValidateRequest
): Promise<ActionIDValidateResponse> {
  const apiUrl = env('ACTIONID_API_URL').replace(/\/$/, '');
  const cid = env('ACTIONID_CID');
  const apiKey = env('ACTIONID_API_KEY');

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
    throw new Error(`ActionID validate failed (${response.status}): non‑JSON response`);
  }

  if (!response.ok) {
    throw new Error(`ActionID validate failed (${response.status})`);
  }

  return json;
}


/**
 * ActionID SDK configuration for the **frontend** SDK (window.Ironvest).
 *
 * - Values come from NEXT_PUBLIC_* env vars so they can be used in the browser.
 * - The API key is **never** exposed here – it is only used server‑side in
 *   `lib/actionid-server.ts` via ACTIONID_API_KEY.
 */
const CID =
  process.env.NEXT_PUBLIC_ACTIONID_CID ||
  // fallback to the known sandbox CID if env is missing
  'ivengprod';

const BASE_URL =
  process.env.NEXT_PUBLIC_ACTIONID_BASE_URL ||
  // fallback to the sandbox base URL from the README
  'https://aa-api.a2.ironvest.com';

export const ACTIONID_CONFIG = {
  cid: CID,
  baseURL: BASE_URL,
  debug: process.env.NODE_ENV === 'development',
} as const;


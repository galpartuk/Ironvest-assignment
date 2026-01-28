/**
 * ActionID SDK configuration for the **frontend** SDK (window.Ironvest).
 *
 * - Values are hardcoded for the production ActionID environment.
 * - The API key is **never** exposed here – it is only used server‑side in
 *   `lib/actionid-server.ts` via ACTIONID_API_KEY.
 */
export const ACTIONID_CONFIG = {
  cid: 'ivengprod',
  baseURL: 'https://aa-api.a2.ironvest.com',
  debug: process.env.NODE_ENV === 'development',
} as const;


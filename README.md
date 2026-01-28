## ActionID Biometric Authentication App

A production-style Next.js application that implements email‑based authentication with biometric verification using the ActionID JavaScript SDK and backend `/v1/validate` API.

---

## 1. Setup & Run Instructions

### 1.1 Prerequisites

- **Node.js** ≥ 18
- **npm** (bundled with Node)

### 1.2 Install dependencies

```bash
npm install
```

### 1.3 Environment configuration

Create a `.env.local` file in the project root with your ActionID API key:

```bash
ACTIONID_API_KEY=your-api-key-here
```

Notes:
- The API key is the only required environment variable and is **server-only** (never exposed to the client).
- All other ActionID configuration (API URL, Client ID) is hardcoded in the application for the production environment.

### 1.4 SDK script

The ActionID SDK (`ironvest.js`) is served from `public/` and loaded once in `app/layout.tsx` via `next/script`.  
If you replace or update the SDK file, keep the same file name or adjust the script tag accordingly.

### 1.5 Run the app

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## 2. High‑Level Architecture

### 2.1 Tech stack

- **Framework**: Next.js App Router (TypeScript, React)
- **UI**: Lightweight custom components + Tailwind CSS (v4, via `app/globals.css`)
- **Forms & validation**: `react-hook-form` + Zod
- **Auth state**: React Context (`AuthContext`) + `localStorage` persistence
  - On initial load, we call `/api/auth/me` (JWT + DB) and use `localStorage` only as a UI cache.
- **Biometrics**:
  - Frontend ActionID SDK (`window.Ironvest`) for capture
  - Backend `/v1/validate` integration for session validation
  - Authentication session maintained via a signed JWT in an HTTP-only cookie

### 2.2 Project structure (simplified)

```text
app/
  (auth)/
    login/      # Email-only login, redirects to /enroll?flow=login
    register/   # Email-only registration, redirects to /enroll?flow=register
    enroll/     # Biometric capture for register/login flows
  home/         # Protected home page
  api/auth/
    login/      # POST /api/auth/login    → ActionID validate + DB lookup
    register/   # POST /api/auth/register → ActionID validate + create DB user

components/
  ui/           # Button, Card, Input, ErrorMessage, etc.
  forms/        # RegisterForm, LoginForm, EnrollForm, ActionIDFlowCapture
  BiometricCapture/  # Camera container for SDK

context/
  AuthContext.tsx    # AuthProvider + useAuth hook

hooks/
  useActionID.ts     # Thin wrapper around ActionID SDK lifecycle

lib/
  actionid-config.ts # Frontend SDK config (hardcoded)
  actionid-server.ts # Backend /v1/validate client
  actionid-errors.ts # Maps ActionID indicators → user-friendly messages
  db.ts              # SQLite wrapper for user storage
  auth.ts            # Local/session storage helpers

types/
  auth.ts            # Auth-related types
  actionid.d.ts      # Global ActionID SDK typings (window.Ironvest)
```

---

## 3. Flow Design & Architecture Decisions

### 3.1 Registration & login flows

- **Registration**
  - `/register` collects **email only**.
  - On submit, the email is stored in `sessionStorage` as "pending registration" and the user is redirected to `/enroll?flow=register`.
  - `/enroll?flow=register` loads `ActionIDFlowCapture`:
    - Initializes the ActionID SDK with `uid = email` and a new `csid`.
    - Starts biometric capture in the `BiometricCapture` container (auto-started on page load).
    - After ~8 seconds (or when the capture completes), calls backend `POST /api/auth/register` with `{ email, csid }`.
  - The register API:
    - First checks the SQLite database to ensure this `email` is not already enrolled.
    - Calls ActionID `/v1/validate` with `action: "user_enrollment"`.
    - On success, stores the user `{ id: email, created_at }` in the `users` table and returns a `User`
      (including `createdAt`) used to update `AuthContext` and redirect to `/home`.

- **Login**
  - `/login` also collects **email only**.
  - On submit, email is stored as "pending login" and the user is redirected to `/enroll?flow=login`.
  - `/enroll?flow=login` uses `ActionIDFlowCapture` with `action: "login"` and, after capture,
    calls the login API which:
    - Validates the session with ActionID (`action: "login"`, `enrollment: false` so the user must already exist).
    - Looks up the user by email in the SQLite database.
    - If the user is missing, returns an error ("User does not exist. Please register first.").
    - If the user exists, returns a `User` (including `createdAt`) and updates `AuthContext`
      before redirecting to `/home`.

### 3.2 SDK integration (`useActionID` hook)

Key responsibilities:

- **Initialization**
  - Verifies `window.Ironvest` is present.
  - Generates a new `csid` (`crypto.randomUUID()`), sets it on the SDK instance, and stores it for later backend validation.
  - Applies configuration from `ACTIONID_CONFIG` (cid, baseURL, debug).

- **Biometric session**
  - `startBiometric(containerId, actionID?)` starts `startBiometricSession` with:
  - `size: "fill"`, `opacity: 1`, `useVirtualAvatar: false`, `frequency: 2000`.
  - Throws a clear error if the instance is not initialized ("Camera is not ready yet. Please try again.").
  - The capture step is auto-started when the biometric page mounts and a `uid` is available,
    without requiring the user to click a "Start" button first.

- **Camera permission handling**
  - `ensureCameraPermission()`:
    - Calls `navigator.mediaDevices.getUserMedia({ video: true })` to trigger the browser permission dialog.
    - Stops all tracks immediately; it is only used to check access.
    - Translates common browser errors into user‑friendly messages:
      - Permission denied, no devices, unsupported browser, generic failures.

- **Cleanup**
  - `stop()` calls `stopBiometric()` and `destroy()` defensively if available.
  - `useEffect` cleanup ensures the SDK instance is always torn down when the component unmounts.

### 3.3 Backend validation (`lib/actionid-server.ts`)

- Provides `validateActionIDSession({ csid, uid, action, enrollment? })`.
- Builds a request to:

  ```text
  POST https://aa-api.a2.ironvest.com/v1/validate
  Headers: { "Content-Type": "application/json", "apikey": <from ACTIONID_API_KEY env var> }
  Body: {
    cid: "ivengprod",
    csid,
    uid,
    action,      # e.g. "login", "user_enrollment"
    enrollment: true | false
  }
  ```

- Parses responses defensively:
  - Reads the raw body, attempts `JSON.parse`, and throws a clear error if the response is non‑JSON or not `2xx`.

### 3.4 Error handling strategy

- **Network / HTTP errors**
  - API routes wrap calls with try/catch and return generic but clear messages such as:
    - `"ActionID error: ..."` for server issues
    - `"Network error. Please try again."` for fetch failures.

- **Biometric validation failures**
  - When ActionID returns `verifiedAction: false` but a valid `200` response, we:
    - Inspect `validation.indicators` and pass them through `getActionIDFriendlyError`.
    - Present specific messages (e.g., liveness, enrollment, or match issues) instead of “Biometric validation failed”.

- **Camera permission**
  - `ensureCameraPermission()` provides user‑friendly messages for denied or unavailable camera access.

---

## 4. Assumptions

- **Email as primary identifier**
  - The system treats email as the unique user identifier and uses it as `uid` for ActionID.
  - No passwords are stored or validated in this implementation; authentication is **purely biometric** with ActionID.

- **Best‑effort local persistence**
  - User session is persisted to `localStorage` via `AuthContext` for convenience.
  - This is acceptable for the current scope; a production deployment may replace this with secure HTTP‑only cookies or a proper token/session store.

- **Simple in‑process “user store”**
  - The backend currently assumes a lightweight, demo‑style persistence model (aligned with the repository scope) and focuses primarily on demonstrating the ActionID integration rather than full user lifecycle management.

- **Single ActionID tenant**
  - The app assumes a single set of ActionID credentials (one client ID / API key pair) defined at build time via environment variables.

- **One active biometric session per browser tab**
  - The SDK wrapper (`useActionID`) manages a single `csid` and instance per component lifecycle and does not attempt to coordinate multiple concurrent biometric sessions.


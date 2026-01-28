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

### 1.6 Build for production

```bash
npm run build
npm start
```

---

## 2. High‑Level Architecture

### 2.1 Tech stack

- **Framework**: Next.js 16+ App Router (TypeScript, React)
- **UI**: Custom component library + Tailwind CSS v4
- **Forms & validation**: `react-hook-form` + Zod
- **Database**: SQLite via `better-sqlite3` for user and audit log storage
- **Auth state**: 
  - Server-side: JWT stored in HTTP-only cookies
  - Client-side: React Context (`AuthContext`) with `/api/auth/me` verification on load
- **Biometrics**:
  - Frontend: ActionID SDK (`window.Ironvest`) for biometric capture
  - Backend: `/v1/validate` API integration for session validation

### 2.2 Project structure

```text
app/
  (auth)/
    login/        # Email-only login page
    register/     # Email-only registration page
    enroll/       # Biometric capture for both flows (via ?flow=register|login)
  home/           # Protected dashboard page
  api/auth/
    login/        # POST → ActionID validate + DB lookup + JWT cookie
    register/     # POST → ActionID validate + create DB user + JWT cookie
    logout/       # POST → Clear JWT cookie
    me/           # GET  → Verify JWT + return user data
    audit-logs/   # GET  → Fetch user's biometric validation history
    user-check/   # GET  → Check if email exists in database
  layout.tsx      # Root layout with ActionID SDK script
  globals.css     # Tailwind CSS v4 configuration
  page.tsx        # Landing page (redirects to login)

components/
  ui/                    # Reusable UI primitives
    Button.tsx           # Button with variants, loading state
    Card.tsx             # Card container with optional accent colors
    Input.tsx            # Form input with label and error states
    ErrorMessage.tsx     # Error alert component
    PasswordStrength.tsx # Password strength indicator (unused currently)
    StepIndicator.tsx    # Multi-step progress indicator
  forms/
    RegisterForm.tsx     # Email registration form
    LoginForm.tsx        # Email login form
    ActionIDFlowCapture.tsx  # Biometric capture flow controller
  dashboard/
    DashboardSummaryCard.tsx   # User account overview card
    IntegrationDetailsCard.tsx # ActionID integration info card
    AuditLogTable.tsx          # Biometric validation history table
  BiometricCapture/
    BiometricCapture.tsx       # Camera container for SDK
    CameraPermissionPrompt.tsx # Permission request UI

context/
  AuthContext.tsx    # AuthProvider + useAuth hook for client-side auth state

hooks/
  useActionID.ts     # ActionID SDK lifecycle wrapper

lib/
  actionid-config.ts # Frontend SDK config (cid, baseURL - hardcoded)
  actionid-server.ts # Backend /v1/validate client with retry logic
  actionid-errors.ts # Maps ActionID indicators → user-friendly messages
  db.ts              # SQLite database (users table, audit_logs table)
  jwt.ts             # JWT sign/verify utilities for auth cookies
  auth.ts            # Session storage helpers for pending registration/login
  user-store.ts      # User store utilities
  utils.ts           # General utilities (cn for classnames)

types/
  auth.ts            # Auth-related TypeScript types
  actionid.d.ts      # Global ActionID SDK typings (window.Ironvest)

middleware.ts        # Route protection middleware

public/
  ironvest.js        # ActionID SDK script
```

---

## 3. Flow Design & Architecture Decisions

### 3.1 Registration flow

1. User visits `/register` and enters their email
2. Email is stored in `sessionStorage` as "pending registration"
3. User is redirected to `/enroll?flow=register`
4. `ActionIDFlowCapture` component:
   - Checks camera permissions (shows `CameraPermissionPrompt` if needed)
   - Initializes ActionID SDK with `uid = email` and generates a new `csid`
   - Auto-starts biometric capture in the `BiometricCapture` container
   - After ~8 seconds, calls `POST /api/auth/register` with `{ email, csid }`
5. Register API:
   - Checks SQLite database to ensure email is not already enrolled
   - Calls ActionID `/v1/validate` with `action: "user_enrollment"`
   - On success: creates user record, logs audit entry, sets JWT cookie
   - Returns user data; client redirects to `/home`

### 3.2 Login flow

1. User visits `/login` and enters their email
2. Email is stored in `sessionStorage` as "pending login"
3. User is redirected to `/enroll?flow=login`
4. `ActionIDFlowCapture` component:
   - Same camera permission and SDK initialization as registration
   - After capture, calls `POST /api/auth/login` with `{ email, csid }`
5. Login API:
   - Looks up user by email in SQLite database
   - If not found: returns error "User does not exist. Please register first."
   - Calls ActionID `/v1/validate` with `action: "login"`, `enrollment: false`
   - On success: logs audit entry, sets JWT cookie
   - Returns user data; client redirects to `/home`

### 3.3 Session management

- **JWT Cookies**: Authentication uses HTTP-only cookies containing a signed JWT
  - Token includes user ID (`sub` claim) and expiration (1 hour default)
  - Cookie is set on login/register, cleared on logout
- **Client-side state**: `AuthContext` calls `/api/auth/me` on mount to verify session
  - Uses `localStorage` only as a UI cache for faster initial render
  - Server is the source of truth for authentication state

### 3.4 Dashboard (`/home`)

The protected home page displays:
- **DashboardSummaryCard**: User email, account creation date, biometric enrollment status
- **IntegrationDetailsCard**: ActionID integration configuration details
- **AuditLogTable**: Recent biometric validation history with:
  - Timestamp, flow type (login/register), verification status
  - IV score, indicator pills (liveness, match, enrolled, etc.)

### 3.5 SDK integration (`useActionID` hook)

Key responsibilities:

- **Initialization**
  - Verifies `window.Ironvest` is present
  - Generates a new `csid` (`crypto.randomUUID()`) and stores it for backend validation
  - Applies hardcoded configuration (cid: `ivengprod`, baseURL: `https://aa-api.a2.ironvest.com`)

- **Biometric session**
  - `startBiometric(containerId, action)` starts capture with:
    - `size: "fill"`, `opacity: 1`, `useVirtualAvatar: false`, `frequency: 2000`
  - Auto-starts when the enroll page mounts (no manual "Start" button required)

- **Camera permission handling**
  - `getPermissionStatus()`: Checks current permission state via SDK
  - `ensureCameraPermission()`: Triggers browser permission dialog
  - User-friendly error messages for denied/unavailable camera

- **Cleanup**
  - `stop()` calls `stopBiometric()` and `destroy()` defensively
  - `useEffect` cleanup ensures SDK is torn down on unmount

### 3.6 Backend validation (`lib/actionid-server.ts`)

- Provides `validateActionIDSession({ csid, uid, action, enrollment? })`
- Implements retry with exponential backoff (3 attempts, 300ms base delay)
- Request format:

  ```text
  POST https://aa-api.a2.ironvest.com/v1/validate
  Headers: { "Content-Type": "application/json", "apikey": <ACTIONID_API_KEY> }
  Body: {
    cid: "ivengprod",
    csid,
    uid,
    action,      # "login" or "user_enrollment"
    enrollment: true | false
  }
  ```

- Response handling:
  - Parses JSON defensively with clear error messages
  - Retries on 5xx errors and rate limits (429)

### 3.7 Error handling

- **Network/HTTP errors**: Generic but clear messages ("ActionID error: ...", "Network error. Please try again.")
- **Biometric validation failures**: Inspects `validation.indicators` and maps to user-friendly messages via `getActionIDFriendlyError`
- **Camera permission**: `CameraPermissionPrompt` component with retry/back options

---

## 4. API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register new user with biometric enrollment |
| `/api/auth/login` | POST | Login existing user with biometric verification |
| `/api/auth/logout` | POST | Clear auth cookie and end session |
| `/api/auth/me` | GET | Get current user from JWT cookie |
| `/api/auth/audit-logs` | GET | Get user's biometric validation history |
| `/api/auth/user-check` | GET | Check if email exists in database |

---

## 5. Database Schema

SQLite database (`actionid.db`) with two tables:

**users**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PRIMARY KEY | User email address |
| created_at | TEXT | ISO timestamp of registration |

**audit_logs**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| user_id | TEXT | Foreign key to users.id |
| action | TEXT | Flow type ("login", "user_enrollment") |
| verified_action | INTEGER | 1 = success, 0 = rejected |
| iv_score | INTEGER | ActionID verification score |
| indicators | TEXT | JSON string of indicator flags |
| created_at | TEXT | ISO timestamp |

---

## 6. Assumptions & Design Decisions

- **Email as primary identifier**: Email is used as the unique user ID and ActionID `uid`. No passwords are stored; authentication is purely biometric.

- **Hardcoded ActionID configuration**: API URL (`https://aa-api.a2.ironvest.com`) and Client ID (`ivengprod`) are hardcoded. Only the API key requires environment configuration.

- **HTTP-only JWT cookies**: Authentication tokens are stored in secure, HTTP-only cookies rather than localStorage for better security.

- **SQLite for persistence**: Lightweight file-based database suitable for demos and development. Production deployments may use PostgreSQL, MySQL, etc.

- **Single ActionID tenant**: The app assumes one set of ActionID credentials. Multi-tenant support would require additional configuration.

- **One biometric session per tab**: The SDK wrapper manages a single `csid` per component lifecycle and does not coordinate multiple concurrent sessions.

---

## 7. Development

### Linting & Type checking

```bash
npm run lint
npm run build  # Includes TypeScript type checking
```

### Project dependencies

Key dependencies:
- `next` - React framework
- `react`, `react-dom` - UI library
- `better-sqlite3` - SQLite database
- `jsonwebtoken` - JWT handling
- `react-hook-form` - Form management
- `zod` - Schema validation
- `tailwindcss` - Styling

Dev dependencies:
- `typescript` - Type checking
- `@types/*` - TypeScript definitions
- `eslint` - Linting

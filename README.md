# ActionID Authentication App

A secure authentication web application with biometric enrollment built with Next.js, React, and TypeScript.

## Overview

This application implements user authentication flows including:
- User registration with email and password
- Biometric enrollment (UI ready for SDK integration)
- User login with biometric verification
- Protected home page (only accessible after login)

## Tech Stack

- **Client**: React (Next.js App Router)
- **Server**: Node.js (Next.js API Routes)
- **Styling**: Tailwind CSS
- **Validation**: React Hook Form + Zod
- **Type Safety**: TypeScript

## Project Structure

```
actionid-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── enroll/        # Biometric enrollment page
│   ├── home/              # Protected dashboard
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   └── layout.tsx         # Root layout with AuthProvider
├── components/
│   ├── ui/                # Reusable UI components
│   ├── forms/             # Form components
│   └── BiometricCapture/  # Biometric capture component
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── lib/
│   ├── auth.ts            # Auth utilities
│   └── utils.ts           # Helper functions
└── types/
    └── auth.ts            # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages

- `/` - Landing page (redirects to login or home)
- `/login` - Login form with email/password
- `/register` - Registration form
- `/enroll` - Biometric enrollment page
- `/home` - Protected dashboard (requires authentication)

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/enroll` - Biometric enrollment

## Current Implementation Status

### Phase 1: Frontend (✅ Complete)
- All pages and UI components implemented
- Form validation with React Hook Form + Zod
- Authentication state management with React Context
- Mock API endpoints for development
- Route protection and redirects
- Responsive design with Tailwind CSS

### Phase 2: SDK Integration (⏳ Pending)
- Integration with ActionID JavaScript SDK
- Real biometric enrollment flow
- Actual authentication with ActionID backend

## Architecture Decisions

1. **Next.js App Router**: Modern routing with server components support
2. **React Context API**: Simple state management for auth state
3. **Mock Backend**: API routes with in-memory storage for development
4. **Client-Side Auth**: Uses localStorage for session persistence (will be replaced with secure tokens in phase 2)
5. **TypeScript**: Full type safety throughout the application

## Development Notes

- Mock user database is stored in memory (resets on server restart)
- Test user: `test@example.com` / `password123`
- Authentication state persists in localStorage
- All forms include client-side validation

## Next Steps (Phase 2)

1. Install ActionID JavaScript SDK
2. Integrate SDK into BiometricCapture component
3. Update API routes to use ActionID SDK
4. Replace mock authentication with real SDK calls
5. Add proper error handling for SDK-specific errors

## Credentials (for Phase 2)

```
Client ID (cid):   ivengprod
Base URL:          https://aa-api.a2.ironvest.com
API Key:           5000d0dc-9729-4273-b286-01ebb5a8fd7f
API URL:           https://aa-api.a2.ironvest.com
```

## Resources

- [ActionID Developer Docs](https://actionid-dev-portal.lovable.app)
- [Frontend Integration Guide](https://actionid-dev-portal.lovable.app/docs/frontend-integration)
- [SDK Reference](https://actionid-dev-portal.lovable.app/docs/sdk-reference)

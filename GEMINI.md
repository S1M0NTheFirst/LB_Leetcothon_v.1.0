# Project: LB_Leetcodethon_v1.0

## Context
We are building a competitive coding platform for CSULB students called "LB Leetcodethon".
The event runs from **Monday, March 30** to **Sunday, April 5**.
Currently, we are building the **Landing Page** and **Authentication System**.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide React (for icons)
- **Database:** AWS DynamoDB (Single Table Design preferred)
- **Authentication:** NextAuth.js (v5) with Microsoft Entra ID Provider
- **Deployment:** Vercel (recommended) or AWS Amplify

## Design System & UI Rules
- **Theme:** "CSULB Gold & Black" meets "Dark Mode Hacker".
- **Colors:**
    - Primary: `#FFC72C` (CSULB Gold)
    - Background: `#111111` (Dark Grid)
    - Text: `#FFFFFF` and `#E5E7EB`
- **Components:** Use functional components with strict TypeScript interfaces.
- **Responsiveness:** Mobile-first approach using Tailwind classes (e.g., `md:flex-row`).

## specific Features
1.  **Auth Gate:** Users MUST sign in with a Microsoft account.
    - *Constraint:* Only allow users from the CSULB tenant (handled by App Registration).
2.  **User Profile:**
    - On first login: Create user in DynamoDB with `email` as `primary_key`.
    - Default `username` = email prefix (e.g., `simon` from `simon@student.csulb.edu`).
    - Users can edit `username` and `avatar_url` later.
3.  **Real-Time Counter:** Display the total number of rows in the `Users` table as "Hackers Joined".
4.  **Event Countdown:** Count down to March 30, 2026.

## Coding Conventions
- Use `shadcn/ui` or generic Tailwind components.
- Do not use raw CSS files; use Tailwind utility classes.
- For DynamoDB calls, use `aws-sdk/client-dynamodb` and `lib-dynamodb`.

## UI & Animation Features
- **Animation Library:** `framer-motion` (Use `AnimatePresence` for the number flip effect).
- **Data Fetching:** `swr` (Use for polling the user count every 5 seconds).
- **Navbar:** Sticky top, glassmorphism effect (`backdrop-blur`).
- **Profile Management:**
    - Use a **Dialog/Modal** for editing the profile.
    - **Avatar:** For V1, allow users to enter an image URL or randomize a "DiceBear" seed.

## Authentication Rules
- **Global Protection:** The entire application is protected.
- **Middleware:** Use `middleware.ts` to intercept all requests.
- **Logic:**
    - If user is NOT logged in -> Redirect to `/api/auth/signin` (Microsoft).
    - If user IS logged in -> Allow access to `/`.
    - **Exceptions:** Allow access to `/_next` (static files), `/api/auth` (login routes), and `/favicon.ico`.


## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide React (for icons)
- **Database:** AWS DynamoDB (Single Table Design)
- **Backend:** Python FastAPI (handling scoring and event logic)
- **State Management:** TanStack Query (React Query)
- **Editor:** `@monaco-editor/react`
- **Code Execution:** Judge0 API (or Piston API)

## Design System & UI Rules
- **Theme:** "CSULB Gold & Black" meets "Dark Mode Hacker".
- **Colors:** Primary: `#FFC72C` (CSULB Gold), Background: `#111111`, Text: `#FFFFFF`

## Specific Features: The Arena
1.  **Arena Layout:**
    - **The Playground:** An unlocked practice section containing 5 problem boxes (4 standard algorithms + 1 high-point bonus challenge).
    - **Event Sections:** 7 distinct sections (Days 1-7) that remain visually locked (using Lucide lock icons) until their respective release dates.
2.  **The Code Editor:**
    - Must use Monaco Editor for a VS Code-like experience.
    - **Run Button:** Executes code against a visible public test case.
    - **Submit Button:** Evaluates code against hidden test cases, returning execution time, memory usage, and awarding points based on efficiency.

## Authentication Rules
- The home page is public. 
- The profile page requires authentication to view stats. Logging in registers the user to the Live Counter.
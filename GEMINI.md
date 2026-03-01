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
    - **The Playground:** An unlocked practice section containing 5 problem boxes (4 standard algorithms + 1 high-point bonus challenge) populated dynamically based on user experience level.
    - **Event Sections:** 7 distinct sections (Days 1-7) that remain visually locked (using Lucide lock icons) until their respective release dates.
2.  **Problem Description & UI (LeetCode Clone):**
    - Must use a resizable split-screen layout (e.g., `react-resizable-panels`).
    - **Left Pane:** Problem description rendered exactly like LeetCode (Markdown formatting, highlighted Example inputs/outputs, and a strict Constraints section).
    - **Terminal/Console (Bottom Right):** Dynamic tabs for "Testcase" and "Test Result". Must include LeetCode-style pill buttons for selecting test cases and dark gray output boxes.
    - **Submission Success:** Authentic stat cards displaying Judge0 execution metrics (Runtime in ms, Memory in MB, and simulated "Beats %" stats with icons) matching LeetCode's dark mode UI.
3.  **The Code Editor:**
    - Must use `@monaco-editor/react` (`vs-dark` theme) for an authentic VS Code-like experience.
    - **Multi-Language Support:** Users must be able to select and write code in Python (`python`), C (`c`), C++ (`cpp`), or Java (`java`) via a dropdown.
    - **Code Persistence:** Automatically save the user's drafted code to browser `localStorage` (keyed by problem ID and language) so it survives page refreshes.
    - **Run Button:** Sends code to the backend to execute against visible public test cases via Judge0.
    - **Submit Button:** Sends code to the backend, prepends/appends hidden Driver Code, and evaluates against hidden test cases. Awards points based on successful evaluation.


## Specific Features: Prediction Pool
1.  **Visual State:**
    - Must feature a "Glassmorphism" overlay (`backdrop-blur`) that disables interaction but keeps the underlying UI visible.
    - Overlay must display a large Lock icon, "PREDICTION POOL IS CURRENTLY LOCKED", and a countdown timer.
2.  **Pool Categories (The 3 Bets):**
    - "Next Problem": Betting points on successfully solving the next attempted problem.
    - "Daily Clear": Betting points on solving all 5 daily problems.
    - "Ironman Streak": Betting points on solving at least one problem every day of the 7-day challenge.
3.  **Real-Time Total:**
    - Must feature a prominent, animated (spinning or pulsing) circular UI element displaying the "Total Pool Pot" (mocked to a high number like 24,500 pts).
4.  **User Controls:**
    - A bottom dashboard showing the user's current available points.
    - An input field to enter the wager amount and a disabled "Place Bet" button.

## Authentication Rules
- The home page is public. 
- The profile page requires authentication to view stats. Logging in registers the user to the Live Counter.
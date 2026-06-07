# Project Overview
- **Name:** iMapping (Web Platform).
- **Core USP:** Personalized travel destination recommendations using AI based on user personality and preferences.
- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS (Frontend) | Java Spring Boot & MySQL (Backend).
- **Crucial Rule:** This is a purely WEB-based project. Do NOT generate mobile-specific (React Native/Flutter) code.

# Design & UI Guidelines (Summer Vibe Palette)
- **Primary (60%):** Teal (`#008080`) - Use for branding, main headers, and general layout structures.
- **Neutral/Background (30%):** Light Cyan (`#E0F7FA`) or clean Whites/Light Grays - Use for background breathing space to make images pop.
- **Accent/CTA (10%):** Coral (`#FF7F50`) - Use STRICTLY for Call-to-Action buttons (Login, Save Preferences, Create Plan) to create contrast.
- Build responsive, modern minimalist UI using Tailwind CSS.
- Optimize performance: use lazy loading, Next/Image (WebP), and minimize re-renders.
- Follow "person-first" tech philosophy: prioritize UX/UI that focuses on personal taste and smooth interactions.

# Backend API Endpoints & Expected JSON Data (Java Spring Boot)
All APIs return Status 200 with structure: { "status": 200, "message": "...", "data": <Specific Data below> }

1. **Auth:** POST `/api/v1/auth/register` (data: "Success"), POST `/api/v1/auth/login` (data: { token: string, username: string }).
2. **Quiz:** GET `/api/v1/quiz` (data: [{id, content, options: [{id, content}]}]), POST `/api/v1/quiz/submit/{userId}` (data: "Success").
3. **Plans:** POST `/api/v1/plans` (data: {planId, name, hostId}), POST `/api/v1/plans/{planId}/members` (data: "Success"), POST `/api/v1/plans/{planId}/itinerary` (data: {itemId, locationName, time}), PUT `/api/v1/plans/{planId}/itinerary/reorder` (data: "Success"), POST `/api/v1/plans/{planId}/itinerary/optimize` (data: [{order, locationName}]).
4. **Expenses:** POST `/api/v1/expenses` (data: {expenseId, title, amount}), GET `/api/v1/expenses/plan/{planId}/balances` (data: [{fromUserId, toUserId, amount}]).
5. **Locations:** GET `/api/v1/locations/match/{userId}` (data: [{locationId, name, matchPercentage, matchReason}]).
6. **AI Chat:** POST `/api/v1/chat/{userId}` (data: "AI response string").
7. **Gamification:** POST `/api/v1/gamification/checkin/{userId}` (data: {currentStreak, pointsEarned, totalPoints}).

# AI Interaction Rules
- Use Tailwind arbitrary values (e.g., `bg-[#008080]`) or instruct the user to configure `tailwind.config.ts`.
- Generate exact TypeScript interfaces for the "data" payload of each API.
- Generate clean, modular components in `src/components`.
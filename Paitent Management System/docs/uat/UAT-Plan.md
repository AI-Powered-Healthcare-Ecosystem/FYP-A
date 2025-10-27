# User Acceptance Testing (UAT) Plan – Patient Management System

Version: 1.0  
Location: `Paitent Management System/docs/UAT-Plan.md`

---

## 1. Overview

- **System under test**: Full-stack Patient Management System combining:
  - React frontend (`Paitent Management System/frontend/`)
  - Laravel API backend (`Paitent Management System/backend/`)
  - FastAPI AI/ML microservice (`Paitent Management System/backend/fastapi/`)
- **Purpose**: Validate that end-to-end user journeys work as expected and meet acceptance criteria for Patient, Doctor, and Admin roles.
- **Out of scope**: Load testing at production scale; deep model validation beyond UI/UX and API contract behavior.

## 2. References

- Frontend routes: `frontend/src/App.jsx`
- Laravel endpoints: `backend/routes/api.php`
- SPA delivery: `backend/routes/web.php`
- FastAPI endpoints: `backend/fastapi/main.py`
- Quick start run commands: `Paitent Management System/README.md`

## 3. Test Environments

- **Frontend (Vite)**: `npm run dev` in `frontend/`
- **Laravel**: `php artisan serve` in `backend/`
- **FastAPI**: `uvicorn main:app --reload --port 5000` in `backend/fastapi/`

### 3.1 Configuration

- Frontend env: `VITE_LARAVEL_URL` pointing to Laravel server origin.
- FastAPI CORS: `FRONTEND_ORIGIN`, `LARAVEL_ORIGIN` must include the above.
- Database: Laravel `.env` configured for MySQL; FastAPI reads same `DB_*` to read/write `patients` table.
- AI keys (if using RAG/therapy): `PINECONE_API_KEY`, `GROQ_API_KEY`, and optionally `OPENAI_API_KEY`.

## 4. Roles and Test Accounts

- **Patient**: Basic access to dashboard, profile, messages, chatbot, patient settings.
- **Doctor**: Patients list, create patient, risk dashboard, therapy effectiveness, treatment recommendation, doctor settings, messages.
- **Admin**: Admin dashboard, manage users, patients, analytics, admin settings.

Create three users (one per role) via `POST /api/register` or seed, then login via UI.

## 5. Entry and Exit Criteria

- **Entry**
  - All services running locally and reachable with correct CORS.
  - Test accounts available and at least one patient record exists (doctor can create).
- **Exit**
  - All high/medium priority test cases pass.
  - No critical/blocker defects open; major issues have acceptable workarounds or fixes.

## 6. Test Data

- One patient created by doctor; note `patient_id`.
- Sample features for risk prediction (numeric array consistent with model input).
- Therapy inputs: HbA1c1/2/3, FVG1/2/3, DDS1/3, gaps, eGFR, insulin regimen.

## 7. Test Plan and Cases

### 7.1 Authentication

- **Register (UI + API)**
  - Step: Visit `/register`, submit valid/invalid data.
  - Expect: `POST /api/register` creates user; errors shown inline for invalid inputs.
- **Login**
  - Step: Submit credentials on SignIn.
  - Expect: `POST /api/login` succeeds, user routed to `/`. Invalid creds show error.
- **Session/Unauthorized**
  - Step: Access protected routes while logged out.
  - Expect: Redirect to SignIn; no protected data visible.
- **Session persistence**
  - Step: Refresh after login.
  - Expect: Still authenticated; landing stays in authenticated area.

### 7.2 Role-Based Access (from `frontend/src/App.jsx`)

- **Patient-only**: `/profile/edit` available only for patient role.
- **Doctor-only**: `/patients`, `/predict`, `/therapy-effectiveness`, `/treatment-recommendation`, etc.
- **Admin-only**: `/admin`, `/admin/users`, `/admin/patients`, `/admin/analytics`.
- Expect: Only role-appropriate navigation shown; unauthorized routes redirect to `/`.

### 7.3 Patient Flows

- **Profile Redirect**
  - Step: Visit `/profile` as patient.
  - Backend: `GET {VITE_LARAVEL_URL}/api/patients/by-user/:id`.
  - Expect: Auto-redirect to `/patient/:id` or friendly error when no link.
- **Create Patient (Doctor/Admin)**
  - Step: `/patients/create` → `POST /api/patients`.
  - Expect: New patient visible in lists and detail view.
- **View/Update Patient**
  - Step: `/patient/:id/*` loads detail; `/patient/update/:id` updates via `PUT /api/patients/{id}`.
  - Expect: Persisted changes reflected on reload.
- **Assigned Doctor**
  - Step: `GET /api/patients/{id}/doctor`.
  - Expect: Correct doctor shown or clear empty-state.

### 7.4 Messaging

- **Conversations**: `GET /api/messages/conversations` renders list.
- **Thread**: `GET /api/messages/thread/{patientId}` shows messages; empty-state friendly.
- **Send**: `POST /api/messages` posts and updates UI instantly.
- **Read Receipts**: `PATCH /api/messages/{id}/read` decreases unread counters.
- **Clear Thread**: `DELETE /api/messages/thread/{patientId}` removes messages after confirmation.

### 7.5 Notifications

- **List**: `GET /api/notifications` populates notifications UI.
- **Unread Count**: `GET /api/notifications/unread-count` drives badge.
- **Mark Read**: `PATCH /api/notifications/{id}/read` updates state.
- **Mark All Read**: `PATCH /api/notifications/mark-all-read` sets unread to 0.

### 7.6 Risk Prediction (FastAPI + Laravel persistence)

- **Dashboard Call**
  - Step: From doctor UI (`/predict`, `/predict/:id`), call FastAPI `POST /risk-dashboard` with features and `patient_id`.
  - Expect (1st call): `cached: False`, returns `prediction`, `risk_label`; MySQL `patients.last_risk_score` updated via FastAPI `save_latest_to_mysql()`.
  - Expect (2nd call): `cached: True` with same value when `patient_id` unchanged.
- **Label mapping**
  - Verify label bins (Normal/At Risk/Moderate Risk/Risky/Very Risky/Critical) are coherent in UI.
- **Force recompute** (if UI parameter supported): `force=true` bypasses cache and updates DB.

### 7.7 Therapy Effectiveness

- **Predict**
  - Step: Use `/therapy-effectiveness` or `/therapy-effectiveness/:id` to call `POST /predict-therapy-pathline`.
  - Expect: Response includes `probabilities` (3 values), `insight` markdown, and `top_factors` (feature importances). UI renders charts & text.
  - Error handling visible when inputs missing/invalid or AI key missing.

### 7.8 Treatment Recommendation (RAG)

- **Recommend**
  - Step: Use `/treatment-recommendation` or `/:id` to call `POST /treatment-recommendation` with `patient` context and `question`.
  - Expect: Response contains `response` text (optional `context_used`). UI renders nicely; timeouts handled.

### 7.9 Chatbot

- **Conversation**
  - Step: `/chatbot` → `POST /chatbot-patient-query` with patient context.
  - Expect: Markdown bullets without hidden reasoning; clear, concise answers as instructed in prompt.

### 7.10 Admin

- **Users**: `GET /api/admin/users`, `PUT /api/admin/users/{id}`, `DELETE /api/admin/users/{id}` work and reflect in UI.
- **Patients**: `GET /api/admin/patients`, `DELETE /api/admin/patients/{id}`, `PATCH /api/admin/patients/{id}/assign-doctor`.
- **Analytics/Settings**: Pages load and handle empty/slow states.

### 7.11 SPA Delivery via Laravel

- **Catch-all**
  - Web route `backend/routes/web.php` serves `public/index.html` for all paths.
  - Expect: Client-side routing works on refresh; log shows helpful error if `index.html` missing.

### 7.12 Error Handling & UX

- Simulate 4xx/5xx and timeouts; UI shows actionable errors.
- Form validations: client + server errors presented inline.
- Empty states for lists (patients, messages, notifications).
- Loading spinners/skeletons present.
- Accessibility basics: keyboard navigation, labels, contrast.

### 7.13 Performance (basic)

- First load has no critical console errors.
- Interactive API calls return in a few seconds with visible progress states.

### 7.14 Security & Privacy (spot checks)

- Protected routes require auth; unauthorized calls return 401/403.
- Sensitive medical data not logged in console or error toasts.
- CORS restricted to configured origins; secrets are not exposed in frontend code.

### 7.15 Cross-Browser

- Smoke test on Chrome, Edge, Firefox. Optional Safari/mobile as per `Testing/README.md`.

## 8. Defect Management

- Record defects with: title, steps, expected, actual, screenshots, logs, environment.
- Severity: Blocker, Critical, Major, Minor; Priority: High, Medium, Low.

## 9. Sign-off

- Stakeholders: Product owner / Supervisor / QA.
- Sign-off when all acceptance criteria met and no open critical defects.

---

## 10. Checklist Summary

- [ ] Auth: register/login/session/unauthorized
- [ ] Role-based routing visibility/guards
- [ ] Patient create/view/update/link
- [ ] Messaging: list/thread/send/read/clear
- [ ] Notifications: list/badge/mark read/all read
- [ ] Risk dashboard: cache semantics + DB persistence
- [ ] Therapy effectiveness: charts, insight, importances
- [ ] Treatment recommendation: RAG responses
- [ ] Chatbot: formatted, concise replies
- [ ] Admin: users/patients/analytics/settings
- [ ] SPA delivery via Laravel catch-all
- [ ] Error handling, empty states, loading
- [ ] Performance smoke
- [ ] Security & privacy checks
- [ ] Cross-browser smoke

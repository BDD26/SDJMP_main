# Employer Area Dynamic Refactor Plan

Refactors all employer-facing pages from static mock data to live API data, defines a canonical applicant-to-hire pipeline, implements deterministic match scoring, normalizes the interview object, role-gates CTAs, and cleans up UI inconsistencies.

## Proposed Changes

---

### Backend — Employer Controller & Application Model

#### [MODIFY] [employer.controller.js](file:///d:/SDJMP-main/SDJMP_main/server/src/modules/employer/employer.controller.js)
Implement all four stubs (`notImplemented`) with real logic:

- **`getEmployerStats`** — aggregate counts from `Job` and `Application` for the calling employer:
  - `activeJobs`, `totalApplicants`, `newApplications` (today), `scheduledInterviews` (status=interview)
  - `weeklyTrend`: last 4 weeks bucketed application counts and interview counts for the chart
  - `recentApplications`: last 5 applications with candidate name, position, status

- **`getEmployerApplicants`** — if `:jobId` is `"all"`, return all applications for this employer; otherwise return by job. For each application, compute a **deterministic match score**:
  - Compare student's `profile.skills` array against job's `skills` array
  - Score = (matching skills count / total job skills) × 100
  - Return `score`, `matchedSkills[]`, `missingSkills[]` as breakdown
  - No AI language — label clearly as "Skill Match Score"

- **`scheduleEmployerInterview`** — persist normalized interview object onto `application.interview`:
  - Fields: `method` (`online`|`offline`), `link` (if online), `location` (if offline), `date`, `time`, `notes`
  - Set `application.status = 'interview'`

- **`getEmployerInterviews`** (new endpoint) — return all applications with `status === 'interview'` for this employer, returning applicant info + normalized interview object.

#### [MODIFY] [employer.routes.js](file:///d:/SDJMP-main/SDJMP_main/server/src/modules/employer/employer.routes.js)
- Add route: `GET /employer/interviews` → `getEmployerInterviews`
- Register existing `getEmployerApplicants` to also handle `/:jobId` where jobId can be `"all"`

#### [MODIFY] [application.model.js](file:///d:/SDJMP-main/SDJMP_main/server/src/modules/applications/application.model.js)
Replace `interview: Mixed` with a structured subdocument schema:
```js
interview: {
  method: { type: String, enum: ['online', 'offline'], default: null },
  link:     { type: String, default: '' },
  location: { type: String, default: '' },
  date:     { type: String, default: '' },
  time:     { type: String, default: '' },
  notes:    { type: String, default: '' },
}
```

---

### Frontend — api.js

#### [MODIFY] [api.js](file:///d:/SDJMP-main/SDJMP_main/client/src/services/api.js)
- Add `employerAPI.getAllApplicants()` → `GET /employer/applicants/all`
- Add `employerAPI.getInterviews()` → `GET /employer/interviews`
- Update `employerAPI.scheduleInterview` to send normalized `{ method, link, location, date, time, notes }`

---

### Frontend — EmployerDashboard

#### [MODIFY] [EmployerDashboard.jsx](file:///d:/SDJMP-main/SDJMP_main/client/src/pages/employer/EmployerDashboard.jsx)
- Call `employerAPI.getStats()` on mount with `useEffect`/loading state
- Replace all static stat values with real API data
- Replace static chart array with real weekly trend data from API
- Replace static `recentApplications` array with real records from API
- Remove "Quick Actions" card entirely

---

### Frontend — EmployerApplicants

#### [MODIFY] [EmployerApplicants.jsx](file:///d:/SDJMP-main/SDJMP_main/client/src/pages/employer/EmployerApplicants.jsx)
- Remove `INITIAL_APPLICANTS` static array
- On mount, fetch `applicationsAPI.getForJob(jobId)` or `employerAPI.getAllApplicants()` if no jobId
- Display `matchScore`, `matchedSkills`, `missingSkills` from API (label: "Skill Match Score")
- Call `applicationsAPI.updateStatus(id, status)` for Shortlist/Reject actions
- **Update schedule form**:
  - Add `interviewMethod` select: `online` | `offline`
  - Conditional field: `meetingLink` (if online) or `location` (if offline) — replace the old generic "Location or meeting link" field
  - On save, call `employerAPI.scheduleInterview(applicationId, { method, link, location, date, time, notes })`
- Remove `Sparkles` icon from the schedule preview (it implied AI)

---

### Frontend — InterviewsPage

#### [MODIFY] [InterviewsPage.jsx](file:///d:/SDJMP-main/SDJMP_main/client/src/pages/employer/InterviewsPage.jsx)
- Remove `INITIAL_INTERVIEWS` static array
- On mount, fetch `employerAPI.getInterviews()`
- Remove the "Schedule Interview" `<Button>` from `PageHeader` and the entire create dialog
- Remove `scheduleOpen` and `createInterview` state/logic
- **Calendar Sync card**: replace toggle button with a static "Active" badge — no connect/disconnect behavior
- Show `interview.method` (online/offline) to choose between `Video` or `MapPin` icon
- Show `interview.link` if `method=online` for a "Join" button
- Stats (`scheduled`, `completed`, `cancelled`) computed from API data
- Keep Reschedule dialog — on save, call `applicationsAPI.updateStatus(id, currentStatus, undefined, interviewUpdate)` or a dedicated patch

---

### Frontend — JobPostForm

#### [MODIFY] [JobPostForm.jsx](file:///d:/SDJMP-main/SDJMP_main/client/src/pages/employer/JobPostForm.jsx)
- Remove the "Go Back" `<ChevronLeft>` icon button that precedes Cancel in the PageHeader
- In edit mode, load real job data via `jobsAPI.getById(id)` instead of hardcoded strings
- Replace "AI Match Preview" card title with "Skill Match Preview"
- Remove static "High / 94% Accurate" badge — show dynamic skill count or neutral description
- Skills stored as `[String]` in the backend — adapt form to store skills as strings, with weights kept client-side only (since the model doesn't have a weight field)

> [!IMPORTANT]
> The job model stores `skills: [String]`, so skill weights are a client-side UI concept only. The form can add/remove skill strings. The "weight" slider adjusts relative display, but only skill names are persisted to the backend.

---

## Verification Plan

### Automated
- Run `npm run build` to check for compile errors

### Manual Verification
1. Visit `/employer/dashboard` — stat cards show live values, no "Quick Actions"
2. Visit `/employer/applicants` — applicants load from API, match score shows skill breakdown
3. Click "Schedule" on an applicant — form shows method dropdown (online/offline), conditional field switches correctly
4. Visit `/employer/interviews` — interviews reflect applicant-scheduled records; no "Schedule Interview" button; calendar sync shows "Active"
5. Visit `/employer/jobs/new` — no "Go Back" button
6. Visit `/employer/jobs/:id/edit` — real job data loads; skill requirements are editable

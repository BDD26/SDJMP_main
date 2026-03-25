# Job Matching Pipeline (Single Skill Inventory)

## Source Of Truth
- `User.profile.skills` is the only skill inventory.
- No separate pipeline dependency on the `Skill` collection.

## Pipeline Flow
1. Skill update events:
   - Resume upload (`type: uploaded`): parse PDF text and extract skills.
   - Resume builder (`type: built`): ingest `data.skills`.
   - Manual profile skill updates (`PUT /api/users/profile`).
   - Skill routes (`POST/PUT /api/skills/user*`).
   - Assessment completion (`POST /api/assessments/:assessmentId/complete`).
2. Normalize and merge:
   - Skill names are normalized.
   - Existing skill entries are updated (level/years/verified) without duplicates.
3. Persist inventory:
   - Write only to `user.profile.skills`.
4. Match computation:
   - Use user skills vs. `job.skills` + `job.skillRequirements`.
   - Score with weighted matching and preference boosts.
5. Recommendation notifications:
   - On employer job publish (`POST /api/jobs` when `status=published`), notify matching students.
   - On student skill changes, re-evaluate all published jobs and notify matches.
   - Daily cron keeps backup matching run.
6. Deduping:
   - Job notifications use `metadata.dedupeKey = job-match:<userId>:<jobId>`.

## Why Skills Could Appear Empty
- Resume extraction only runs for uploaded PDFs (`mimeType` must include `pdf`).
- If PDF fetch/parsing fails, no skills are extracted.
- Non-student users do not receive student matching notifications.

## Current Intent
- Keep behavior deterministic: one skill inventory, one matching pipeline, one notification dedupe strategy.

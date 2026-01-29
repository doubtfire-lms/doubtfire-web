# Analytics & Session Tracking Handover

## 1. Overview
The Tutor Analytics dashboard visualizes marking session data to provide insights into workload and efficiency. This document outlines the architecture implemented in the 10.0.x release and identifies specific data integrity observations, testing requirements and direction for future development.

## 2. Architecture Status (Completed Work)
The following architecture has been implemented and verified in the 10.0.x branch:

* **Tracking Mode:** Automated / "Sticky Session" Logic.
    * *Behavior:* Sessions are automatically created and extended to group user activity to continuous sessions.
    * *Threshold:* A 15-minute inactivity window determines when a session closes.
* **Manual Timer:** (Mentioned in the Thoth-tec Documentation Website) Deprecated and removed from the UI to reduce tutor cognitive load.
* **Data Source:** * The `duration_minutes` field is now calculated and added on to the `MarkingSession` model in the backend (doubtfire-api).
    * The frontend (doubtfire-web) dashboard consumes this pre-calculated value rather than performing date-diff logic client-side.
* **Visualization:**
    * **Summary Cards:** Real-time metrics for Total Time, Tasks Assessed, Submissions Opened and Efficiency.
    * **Activity Chart:** Grouped bar chart comparing "Hours Worked" and "Tasks Assessed" per day.

## 3. Known Data Integrity Observations & Future Work

During implementation, code review of `doubtfire-api` and `doubtfire-web` identified three areas where data capture could be refined. 

> **Note:** any changes to the logic below should be confirmed with the Product Owner, as they may alter historical data definitions or reporting metrics.

### A. Zero-Minute Sessions (Backend)
* **Observation:** The dashboard displays valid sessions with `0 minutes` duration.
* **Root Cause:** The `SessionTracker` service uses a strict "Sticky Session" logic.
    * *Scenario:* A tutor performs a single action (e.g., grading one student) at `12:00:00` and performs no further write actions.
    * *Result:* `start_time` and `end_time` are identical (`12:00:00`), resulting in a 0-minute duration.
* **Impact:** This may result in the under-reporting of workload, as the reading time (cognitive load) preceding the action is not captured.
* **Suggested Improvement:** * Consider implementing a minimum duration floor (heuristic) in `SessionTracker`.
    * *Example Logic:* On session creation, ensure `end_time` is at least `now + 5.minutes`.

### B. Assessment Count Inflation (Backend)
* **Observation:** The "Tasks Assessed" metric can be higher than the actual number of unique students graded.
* **Root Cause:** `SessionTracker.record_assessment_activity` creates a `session_activity` record unconditionally every time the API endpoint is called.
    * *Scenario:* A tutor clicks on a task multiple times without changing the status (e.g. re-saving 'Discuss' 
      status doubtfire-api/app/models/comments/discussion_comment.rb).
    * *Result:* Multiple assessment activities are logged for a single logical action.
* **Suggested Improvement:** * Implement Dirty Checking or Hashing type solution in the Rails service to filter out redundant saves.
    * *Example Logic:* Only call `record_assessment_activity` if there's a change in taskid.

## 4. Future Contributions
* **Tutor Filtering:** The API can serve all tutor data to Convenors. The frontend requires a "Staff Selection" dropdown to filter the events array by user_id.

* **Granular Task Analytics:** To visualize time spent marking per Ontrack task, future teams should expose session_activities in the MarkingSessionEntity and calculate grouped durations on the frontend. 

* **Threshhold & Date testing:** 
- Ensure when running tests and asserting on session duration, call .reload on the model object. To ensure the API updates the database, but the local Ruby variable remains a stale snapshot.
- To force a session split in tests, ensure (travel 16.minutes) and ensure the previous session's end_time is properly persisted. 
- Always use in_time_zone rather than to_time to avoid sub-second drift that can cause sessions to merge or split incorrectly during loops.

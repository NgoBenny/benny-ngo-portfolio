---
title: Job Application Copilot
subtitle: browser extension / application assistant
summary: A Chrome extension that helps fill job applications from a verified profile. It proposes changes for review, handles platform-specific controls, and checks the displayed result after each write.
order: 4
category: Browser extension development
period: Personal software project
technologies: [TypeScript, React, WXT, Chrome Extension APIs, Zod, Playwright]
thumbnail: ../../assets/job-application-copilot.png
thumbnailAlt: Job Application Copilot’s master-profile dashboard with fabricated contact details for Avery Example and tabs for applications, saved answers, employer accounts, and privacy.
caption: The repository’s dashboard screenshot uses fabricated data only. The extension is experimental and distributed from source; there is no hosted application demo.
sourceVisibility: public
repositoryUrl: https://github.com/NgoBenny/job-application-copilot-public
highlights:
  - value: Local
    label: Profile storage
  - value: Review
    label: Before filling
  - value: Manual
    label: Submission
architecture:
  - title: Profile
    detail: Verified local records
  - title: Adapters
    detail: Platform-specific scan
  - title: Review
    detail: Approve proposed writes
  - title: Verify
    detail: Check displayed values
---

## The problem

Application forms often ask for the same information but use different controls and layouts. I built Copilot around a verified master profile, with a separate record for each application and a review step before filling anything.

The Chrome extension has adapters for Workday candidate portals, hosted Greenhouse boards, and Ashby application pages. Profile and application data stay in the local Chrome profile. It uses no backend or AI service. Navigation, uploads, signatures, and submission stay manual.

## Engineering decisions

### Recheck the field before writing

Platform adapters handle detection, scanning, filling, and verification. Before a write, the extension rechecks the field’s identity and current value so a rerender or user edit can invalidate an old proposal. Uncertain fields are left for review.

Workday’s parsed work and education entries are matched by identity instead of position. Missing entries require approval before they are added. Skill suggestions come from the verified inventory; a related option needs approval when an exact match is unavailable.

### Keep the master profile separate from imports

Tailored PDF and JSON resume imports are compared with the master profile before use. Importing a resume does not silently replace the master record. The review shows conflicts and the source of proposed answers.

Sensitive answers require individual approval and an exact option match. Passwords and one-time codes are outside the filling workflow, as are attestations and submission. Answers are remembered only after an explicit request, with a scope for the employer, job, or all employers.

### Check what the page actually shows

Each write waits for the control to settle and checks its displayed value. Workday skills dialogs in narrow windows needed their own search input and stable field identification across scans. Ashby exposed a different problem: answers written back to back could appear in the boxes while overwriting each other in its internal form store. The adapter now spaces out writes, with a synthetic regression test reproducing the race.

The extension cannot inspect that internal store. “Verified” means the page shows the expected value, so the user still needs to review the completed form.

## Demonstrated functionality

The implementation includes local profile editing, reviewed resume imports, per-step proposals, platform-specific filling, skill selection, and scoped answer memory. Recorded live QA covers selected Workday and Greenhouse sites and an Ashby application. Redacted notes describe the findings; synthetic tests reproduce specific failures without using real applicant data.

Automated checks cover adapter contracts, protected fields, stale proposals, local storage, and browser workflows. Live findings informed the Workday dialog and Ashby state-update fixes. Those checks cover specific sites and failures; they do not establish compatibility with every employer.

## Limitations and lessons

The project is experimental and distributed from source. It has not been published to an extension store. Hosted Greenhouse boards are supported; forms embedded on employer websites are not. Employer-specific labels, controls, and rerenders can still require manual input.

PDF extraction targets text-based, one-column English resumes. Scanned documents and complex layouts need another input path or manual review. The extension never uploads the resume or clicks Next or Submit.

Data stays in `chrome.storage.local`, which is not encrypted. Anyone with access to the same computer account may be able to read it, and removing the extension deletes its stored data. Backup export and deletion controls are available in the dashboard.

The recurring challenge has been deciding whether a field is still the same field after a page update. Keeping those checks close to each write makes failures visible before the extension continues.

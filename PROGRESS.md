# IBM Full Stack Developer Capstone Progress

Last updated: 2026-11-17T14:28:00+00:00. Only verified work is marked DONE.

## Recovery checkpoint

- Active workspace: `C:/Users/dinht/Desktop/ABX/djangoapp-local`.
- Recovered project: `C:/Users/dinht/Desktop/ABX/djangoapp`.
- Neither folder is a Git repository. Recover the course template history, then overlay the existing project inside this workspace. Preserve the original folder and all existing files.
- GitHub CLI is authenticated as `shirmtry`, with repository and workflow scopes. Public repository name awaits the user's preference.
- Python 3.11.1 is installed at `C:/Users/dinht/AppData/Local/Programs/Python/Python311/python.exe`; the `python` PATH entry is a Windows Store alias. Node 24.19.0, npm 11.17.0, Git 2.52.0 and gh 2.102.0 are available.
- Docker and IBM Cloud CLI are absent. MongoDB 8.3 is already running as a Windows service on `127.0.0.1:27017`. Use the real Express/MongoDB backend with a dedicated capstone database; do not reset any existing database.
- Existing listeners: Django 8000 (PID 8612), React 3000 (PID 7464), Node mock 3030 (PID 24900), sentiment 5050 (PID 9364). Other applications also run on this computer; stop only confirmed capstone processes when replacing services.
- `mockdb/server.js` reads the recovered template JSON and serves dealers, cars and reviews; it includes Kansas dealer 8. Added reviews live only in memory. Routes differ from the Express template. Retain it as a legacy helper, not the preferred backend.
- `sentiment/app.py` runs Flask plus the separate `vaderSentiment` package on 5050. A live request for `Fantastic services` returned positive. Implement the required NLTK VADER service in the recovered template, preserving this helper.
- `capture/debug_admin.js` inspects admin login/logout using headless Chrome. `capture/debug_landing.js` inspects a local iframe wrapper. `capture/screens.js` captures headless pages and draws URL text in HTML wrappers, including an unverified cloud URL. These captures do not meet the address-bar or deployment evidence requirements. Keep legacy helpers and screenshots outside graded evidence; recapture directly from the real application.
- The old claimed deployment URL could not resolve during recovery. No public deployment is verified.
- The Django project currently has login/logout/register, dealer proxy views, CarMake/CarModel and admin registration. Registration does not establish a session; `get_cars` reads the mock instead of the models; `populate.py` is a stub; production React serving and deployment are incomplete.
- Existing evidence files have `.txt` extensions, contrary to the required names. Their contents and existing screenshots are unverified and cannot be submitted as completed tasks.

## Graded checklist (28 tasks, 50 points)

Status: **PENDING** = work or verification remains; **DONE** = verified deliverable; **BLOCKED** = a named external dependency prevents completion.

| Task | Required deliverable | Status | Verified evidence / remaining work |
| --- | --- | --- | --- |
| T1 | README.md | DONE | README contains the project name, description, real backend choice and setup instructions. |
| T2 | django_server | DONE | django_server records the fresh Django 5.2.19 run and required 127.0.0.1:8000 startup line. |
| T3 | server/frontend/static/About.html | PENDING | Page exists; verify layout, asset provenance and fictional people. |
| T4 | server/frontend/static/Contact.html | PENDING | Page exists; verify image, CSS, details and active navbar. |
| T5 | loginuser | PENDING | Capture a valid real JSON login with cookie jar and throwaway credentials. |
| T6 | logoutuser | PENDING | Capture real logout using the same cookie jar. |
| T7 | server/frontend/src/components/Register/Register.jsx | PENDING | Existing form has required fields; fix session behavior and verify through UI. |
| T8 | getdealerreviews | PENDING | Capture reviews through Django and the real backend. |
| T9 | getalldealers | PENDING | Capture all dealers through Django and the real backend. |
| T10 | getdealerbyid | PENDING | Capture a dealer through Django and the real backend. |
| T11 | getdealersbyState | PENDING | Kansas exists in template data; capture through the real backend. |
| T12 | screenshots/admin_login.png | PENDING | Recapture root logged into the real admin; inspect the image. |
| T13 | screenshots/admin_logout.png | PENDING | Recapture the real Logged out admin page; inspect the image. |
| T14 | getallcarmakes (makes) | PENDING | Seed ORM records and capture makes. |
| T15 | getallcarmakes (models) | PENDING | Populate CarModel records and capture linked makes and models. |
| T16 | analyzereview | PENDING | Implement NLTK VADER and capture positive sentiment from its live endpoint. |
| T17 | screenshots/get_dealers.png | PENDING | Recapture the logged-out dealers page directly. |
| T18 | screenshots/get_dealers_loggedin.png | PENDING | Real headed browser address bar, username and Review Dealer option required. |
| T19 | screenshots/dealersbystate.png | PENDING | Real headed browser address bar and state filtering required. |
| T20 | screenshots/dealer_id_reviews.png | PENDING | Real headed browser address bar, dealer details and reviews required. |
| T21 | screenshots/dealership_review_submission.png | PENDING | Fill a real review form through the UI and capture before submission. |
| T22 | screenshots/added_review.png | PENDING | Submit through the UI, persist in MongoDB and capture the visible review. |
| T23 | CICD | BLOCKED | Public repository selection/push needed for a real green GitHub Actions run. |
| T24 | deploymentURL | BLOCKED | Hosting account/login or free-host selection needed; no deployment verified. |
| T25 | screenshots/deployed_landingpage.png | BLOCKED | Requires T24 and a real public landing page. |
| T26 | screenshots/deployed_loggedin.png | BLOCKED | Requires T24 and a real public login session. |
| T27 | screenshots/deployed_dealer_detail.png | BLOCKED | Requires T24 and a reachable public dealer backend. |
| T28 | screenshots/deployed_add_review.png | BLOCKED | Requires T24 and a review actually posted on the public app. |

## Resume instructions

Current P0 checkpoint: the recovered code is in this workspace with upstream Git history. `.venv` and dependencies are installed; migrations pass. Real Express/MongoDB serves 50 dealers and 50 seed reviews on 3030. NLTK VADER serves 5050. The fresh Django process serves 8000, and `django_server` contains its real startup output. CarMake/CarModel have been seeded (5 makes, 58 models). Private throwaway credentials and process records are in ignored `.local/`. The task tool returned `No invocation context`; the checked-in PowerShell launcher was executed successfully through the terminal.

1. Read this file and `git status --short`; do not recreate completed work.
2. Use the configured interpreter or the repository `.venv`; never rely on the Store `python` alias.
3. Update this file and make a small English commit after each task. Push to the public repository regularly.
4. Save exact real cURL commands in standard bash form followed by raw output in extensionless files. Never include session cookies or secrets in commits.
5. View every screenshot before marking its task DONE. Never use a wrapper or altered image as an address bar.
6. Complete `submission/ANSWERS.md` with actual public GitHub links and verified deployment URL; label external blockers explicitly.

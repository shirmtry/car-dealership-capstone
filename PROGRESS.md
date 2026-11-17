# IBM Full Stack Developer Capstone Progress

Last updated: 2026-11-17T15:48:22+00:00. Only verified work is marked DONE.

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
| T3 | server/frontend/static/About.html | DONE | Live /about returns 200; CSS and inspected synthetic team portraits load. Fictional names, roles, bios and emails are present with source credits. |
| T4 | server/frontend/static/Contact.html | DONE | Live /contact returns 200; inspected contact image and CSS load; Contact Us is active with address, phone, email, sales and opening hours. |
| T5 | loginuser | DONE | loginuser contains a real successful POST with the throwaway capstonetester account and a cookie jar. |
| T6 | logoutuser | DONE | logoutuser contains a real POST logout using cookies.txt from T5, confirmed Logged out. |
| T7 | server/frontend/src/components/Register/Register.jsx | DONE | React registration form was submitted in headed Chrome; a new throwaway user has a verified Django session and visible username/Review Dealer links. Required fields compile and work. |
| T8 | getdealerreviews | DONE | Live Django proxy returns seeded dealer 15 reviews from Express/MongoDB with NLTK sentiment. |
| T9 | getalldealers | DONE | Live Django proxy returns all 50 dealers with the required template fields. |
| T10 | getdealerbyid | DONE | Live Django proxy returns the actual dealer 15 record from MongoDB. |
| T11 | getdealersbyState | DONE | Live Django proxy filters Kansas and returns Bytecard in Topeka, dealer 8. |
| T12 | screenshots/admin_login.png | DONE | Inspected native 1440x900 Chrome window: root is logged into /admin and Car makes/Car models are visible. |
| T13 | screenshots/admin_logout.png | DONE | Inspected native 1440x900 Chrome window: the real /admin/logout/ page displays Logged out. |
| T14 | getallcarmakes (makes) | DONE | getallcarmakes contains 5 real Django ORM CarMake records; admin registration and idempotent populate.py are present. |
| T15 | getallcarmakes (models) | DONE | The same live get_cars response includes 58 CarModel records linked to their makes. |
| T16 | analyzereview | DONE | Real NLTK VADER on 5050 returns positive for Fantastic services; analyzereview preserves the exact curl output. |
| T17 | screenshots/get_dealers.png | DONE | Inspected native Chrome capture of the logged-out dealers page; login/register visible and no review column. |
| T18 | screenshots/get_dealers_loggedin.png | DONE | Inspected native Chrome address bar, capstonetester username and Review Dealer options on /dealers. |
| T19 | screenshots/dealersbystate.png | DONE | Inspected native Chrome URL /dealers?state=Kansas and the actual Topeka/Bytecard filtered record. |
| T20 | screenshots/dealer_id_reviews.png | DONE | Inspected native Chrome /dealer/15 showing Tempsoft details, three real seed reviews and VADER sentiment. |
| T21 | screenshots/dealership_review_submission.png | DONE | Inspected actual /postreview/15 form before submission, filled with review text, Audi A6, 2021 and 2026-11-10. |
| T22 | screenshots/added_review.png | DONE | Review 51 was posted through React, saved in MongoDB and inspected in the native dealer page screenshot with positive sentiment. |
| T23 | CICD | DONE | Actions run 44113284822 succeeded for source commit 56519483de8d92962f059dd0a9f42d1335378844. CICD contains the exact gh command followed by unmodified real stdout. Flake8, JSHint/JSX lint, Django/NLTK/MongoDB tests, React build and container smoke checks passed; django_server retains the required startup line and live /health returns HTTP 200. |
| T24 | deploymentURL | BLOCKED | Hosting account/login or free-host selection needed; no deployment verified. |
| T25 | screenshots/deployed_landingpage.png | BLOCKED | Requires T24 and a real public landing page. |
| T26 | screenshots/deployed_loggedin.png | BLOCKED | Requires T24 and a real public login session. |
| T27 | screenshots/deployed_dealer_detail.png | BLOCKED | Requires T24 and a reachable public dealer backend. |
| T28 | screenshots/deployed_add_review.png | BLOCKED | Requires T24 and a review actually posted on the public app. |

## Resume instructions

Current checkpoint: public repository is https://github.com/shirmtry/car-dealership-capstone (main). T1-T22 are complete and pushed; T23 now has verified green CI evidence for the current source commit. `.venv` and dependencies are installed; migrations pass. Real Express/MongoDB serves 50 dealers and seed reviews on 3030. NLTK VADER serves 5050. Django serves the successfully compiled React build on 8000 with static files collected; `/health` verifies all three services. CarMake/CarModel have been seeded (5 makes, 58 models). Private throwaway credentials and process records are in ignored `.local/`. Fresh evidence is extensionless. `capture/real_screens.js` drives an isolated headed Chrome and captures its actual native window via PowerShell; it is ready for UI validation. The task tool returned `No invocation context` and the browser connector reported no access host, so the checked-in launch/capture scripts are used. Hosting selection/account access is still pending; no public deployment is claimed.

1. Read this file and `git status --short`; do not recreate completed work.
2. Use the configured interpreter or the repository `.venv`; never rely on the Store `python` alias.
3. Update this file and make a small English commit after each task. Push to the public repository regularly.
4. Save exact real cURL commands in standard bash form followed by raw output in extensionless files. Never include session cookies or secrets in commits.
5. View every screenshot before marking its task DONE. Never use a wrapper or altered image as an address bar.
6. Complete `submission/ANSWERS.md` with actual public GitHub links and verified deployment URL; label external blockers explicitly.

## T23 verification (2026-11-17)

- Latest run from `gh run list --repo shirmtry/car-dealership-capstone --limit 5`: completed/success, run **44113284822**, duration **2m33s**.
- Run URL: https://github.com/shirmtry/car-dealership-capstone/actions/runs/44113284822. Both jobs and all lint, test, build and real container checks succeeded for commit `56519483de8d92962f059dd0a9f42d1335378844`.
- [CICD](./CICD) preserves `gh run view 44113284822 --repo shirmtry/car-dealership-capstone --log` followed by the complete raw stdout, captured again during this task and verified against the saved file.
- [django_server](./django_server) still contains `Starting development server at http://127.0.0.1:8000/`. A live `curl.exe --max-time 15 -i http://127.0.0.1:8000/health` returned HTTP 200 with status `ok`, MongoDB backend `ok`, and NLTK VADER `ok`.
- The workflow ignores evidence/progress-only pushes; this T23 commit does not change the tested application source.
- Stop after T23 and await the user's next instruction. T24-T28 remain untouched.

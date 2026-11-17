# IBM Full Stack Developer Capstone Progress

Last updated: 2026-11-17T16:15:29+00:00. Only verified work is marked DONE.

## Recovery checkpoint (historical)

The following snapshot describes the project before T1; it is retained as recovery history, not current instructions.

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
| T24 | deploymentURL | DONE | https://openroad-car-dealerships.onrender.com is live on Render Free/Singapore using one Docker container with Django, Express, NLTK VADER and seeded MongoDB. Anonymous curl.exe checks returned HTTP 200 for /health, all 50 dealers, Kansas dealer 8, 5 makes/58 models and the React landing page. |
| T25 | screenshots/deployed_landingpage.png | DONE | Viewed and verified native 1440x900 Chrome screenshot at https://openroad-car-dealerships.onrender.com/, with the real address bar and the anonymous public landing page. |
| T26 | screenshots/deployed_loggedin.png | DONE | Viewed and verified native 1440x900 Chrome screenshot at https://openroad-car-dealerships.onrender.com/dealers, with the real address bar and a real registered Django session with visible username deploy_capstone_1794931790161. |
| T27 | screenshots/deployed_dealer_detail.png | DONE | Viewed and verified native 1440x900 Chrome screenshot at https://openroad-car-dealerships.onrender.com/dealer/15, with the real address bar and Tempsoft dealer 15 with real seeded reviews and sentiment. |
| T28 | screenshots/deployed_add_review.png | DONE | Viewed and verified native 1440x900 Chrome screenshot at https://openroad-car-dealerships.onrender.com/dealer/15?added=51, with the real address bar and the review actually submitted through the deployed React UI: Fantastic services on the deployed app. Friendly staff and a smooth car purchase. |

## Resume instructions

Current checkpoint: T1-T28 are verified DONE and committed to https://github.com/shirmtry/car-dealership-capstone (main). Public deployment: https://openroad-car-dealerships.onrender.com. One Render Free Docker service in Singapore runs Django, the Express dealer API, NLTK VADER and seeded MongoDB. All four deployed screenshots are inspected native 1440x900 Chrome captures. [submission/ANSWERS.md](./submission/ANSWERS.md) lists the upload/paste evidence for all 28 tasks. Anonymous checks confirm that public repository files and the deployment open without signing in. Local setup, original recovery files and private state under ignored `.local/` are preserved. Free container storage is ephemeral; evidence-only pushes do not trigger redeployment. The next step is submitting the verified artifacts using ANSWERS.md.

1. Read this file and `git status --short`; do not recreate completed work.
2. Use the configured interpreter or the repository `.venv`; never rely on the Store `python` alias.
3. Update this file and make a small English commit after each task. Push to the public repository regularly.
4. Save exact real cURL commands in standard bash form followed by raw output in extensionless files. Never include session cookies or secrets in commits.
5. View every screenshot before marking its task DONE. Never use a wrapper or altered image as an address bar.
6. Use [submission/ANSWERS.md](./submission/ANSWERS.md) to upload/paste the verified evidence for all 28 grading questions.

## T23 verification (2026-11-17)

- Latest run from `gh run list --repo shirmtry/car-dealership-capstone --limit 5`: completed/success, run **44113284822**, duration **2m33s**.
- Run URL: https://github.com/shirmtry/car-dealership-capstone/actions/runs/44113284822. Both jobs and all lint, test, build and real container checks succeeded for commit `56519483de8d92962f059dd0a9f42d1335378844`.
- [CICD](./CICD) preserves `gh run view 44113284822 --repo shirmtry/car-dealership-capstone --log` followed by the complete raw stdout, captured again during this task and verified against the saved file.
- [django_server](./django_server) still contains `Starting development server at http://127.0.0.1:8000/`. A live `curl.exe --max-time 15 -i http://127.0.0.1:8000/health` returned HTTP 200 with status `ok`, MongoDB backend `ok`, and NLTK VADER `ok`.
- The workflow ignores evidence/progress-only pushes; this T23 commit does not change the tested application source.
- At the T23 checkpoint, work stopped awaiting the user's next instruction. The later authorization and completion of T24-T28 are recorded below.

## T24 deployment preparation (2026-11-17)

- The user authorized continuing T24-T28 on Render with the existing [Dockerfile](./Dockerfile) and [render.yaml](./render.yaml), followed by public endpoint checks, native Chrome screenshots and submission answers.
- The current container starts Django/Gunicorn, Express, NLTK VADER and seeded MongoDB. The recorded green CI run exercised the container at 512 MiB and reported 239.7 MiB usage; an external Atlas database is not currently necessary.
- Render CLI v2.37.0 was downloaded from the official render-oss/cli GitHub release, with the published SHA256 checksum verified. The executable, auth configuration and helper scripts stay in ignored `.local/`.
- Browser connector inventory returned `The browser access host is unavailable`. Use the official Render CLI for deployment after the user signs in and authorizes it; use the already-requested headed scripts under [capture/](./capture/) for deployed evidence.
- T24-T28 remain incomplete. Do not write deploymentURL until the actual Render HTTPS service passes all required curl.exe checks. Inspect each screenshot before marking its task DONE and make a separate commit per completed task.
- User confirmed Render authorization with "Xong". CLI authentication and the sole workspace are verified. The blueprint validates successfully; evidence/progress paths now use buildFilter.ignoredPaths to prevent unnecessary redeploys on a free container with ephemeral storage. Existing unrelated Render services are preserved.

## T24 verified deployment

- Public URL: https://openroad-car-dealerships.onrender.com. Verified at 2026-11-17T16:08:27.789Z with anonymous curl.exe requests.
- One free Render Docker service in Singapore runs all four required services. The existing blueprint and Dockerfile are used; Atlas is unnecessary for this demo.
- Real response checks: 50 dealerships; Kansas contains Bytecard/Topeka, dealer 8; Django ORM returns 5 makes and 58 models; backend MongoDB and NLTK VADER health both report ok.
- Render Free has ephemeral filesystem storage: users and newly posted reviews can reset on a service restart or sleep. Seed records are restored automatically. Evidence/progress pushes are filtered to avoid needless redeploys.

## Final submission checkpoint

- T24-T28 each have their own committed and pushed evidence. All four deployed screenshots were viewed before marking DONE.
- [submission/ANSWERS.md](./submission/ANSWERS.md) contains the exact public repository/file links, deployment URL and upload/paste instructions for questions 1-28.
- Anonymous verification at 2026-11-17T16:14:11.727Z: repository and 30 required/source files return HTTP 200, as do the public app and required API endpoints. The session endpoint confirms isAuthenticated=false, and the public review API confirms review 51 is persisted with positive sentiment.
- Latest Actions run 44122585984 succeeded: https://github.com/shirmtry/car-dealership-capstone/actions/runs/44122585984. Render deployment dep-dbu7mv49v7es73dl91b0 remains live; evidence-only commits have not caused another deployment.
- All 28 graded tasks are DONE. No course submission has been made on the user's behalf; the prepared artifacts are ready to upload/paste.

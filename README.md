# OpenRoad Car Dealership Reviews

A full-stack car dealership application for the IBM Full Stack Developer Capstone. Buyers can browse dealerships by state, register and sign in, read reviews with sentiment labels, and post reviews for purchased cars.

## Architecture

| Component | Implementation | Local address |
| --- | --- | --- |
| Web application | Django 5.2, session authentication, admin, ORM car inventory | http://127.0.0.1:8000 |
| Frontend | React 18 and React Router, built and served through Django | Same origin as Django |
| Dealer/review backend | **Real Express + MongoDB**, not the legacy Node mock | http://127.0.0.1:3030 |
| Sentiment microservice | Flask + **NLTK VADER**, bundled lexicon | http://127.0.0.1:5050 |

The backend uses a dedicated `car_dealership_capstone` MongoDB database. Seed scripts insert missing course records without deleting existing reviews. The fixture contains 50 dealerships, including Bytecard in Topeka, Kansas, and 50 seed reviews. CarMake and CarModel are stored in Django's database and populated from the inventory fixture (5 makes and 58 models).

## Windows setup

Use PowerShell and `curl.exe`, since PowerShell's `curl` alias has different behavior. The Windows Store Python alias on this machine is not the installed interpreter.

```powershell
& 'C:/Users/dinht/AppData/Local/Programs/Python/Python311/python.exe' -m venv .venv
& ./.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
npm.cmd install --prefix server/database
npm.cmd install --prefix server/frontend
Copy-Item .env.example .env
# Replace DJANGO_SECRET_KEY with a random private value before starting.
cd server
& ../.venv/Scripts/python.exe manage.py migrate
& ../.venv/Scripts/python.exe manage.py populate_cars
& ../.venv/Scripts/python.exe manage.py createsuperuser --username root
cd ..
npm.cmd run build --prefix server/frontend
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-local.ps1
```

MongoDB must be running on 27017. Docker is optional for local development. The launcher starts only services on free ports and stores logs/process IDs under ignored `.local/`. Local test accounts use throwaway passwords; administrator credentials, cookies and `.env` must remain private.

On Linux or macOS, use `python3 -m venv .venv`, activate the environment, and run the same pip/npm/manage.py commands. Start `node app.js` in `server/database`, `python app.py` in `server/djangoapp/microservices`, and `python manage.py runserver` in `server`.

## Application routes

- Frontend: `/`, `/login`, `/register`, `/dealers`, `/dealer/<id>`, `/postreview/<id>`, `/about`, `/contact`.
- Django API: `/djangoapp/login`, `/djangoapp/logout` (POST), `/djangoapp/register`, `/djangoapp/session`, `/djangoapp/get_cars`, `/djangoapp/get_dealers`, `/djangoapp/get_dealers/<state>`, `/djangoapp/dealer/<id>`, `/djangoapp/reviews/dealer/<id>`, `/djangoapp/add_review`.
- Express API: `/fetchDealers`, `/fetchDealers/:state`, `/fetchDealer/:id`, `/fetchReviews/dealer/:id`, `/insert_review` (POST), `/health`.
- Sentiment: `/analyze/<text>` and `/health`. `Fantastic services` is positive. Sentiment uses VADER's standard compound thresholds (+0.05/-0.05).

Registration establishes a Django session. Review submission requires a real authenticated session and CSRF protection. The server derives the reviewer name from that session and confirms the backend actually saved the review. Service failures produce real error responses rather than empty successful data or invented sentiment.

## Evidence and progress

The required extensionless cURL files contain a standard bash command followed by actual unedited curl output. [scripts/capture-api.py](./scripts/capture-api.py) runs `curl.exe` on Windows and can refresh each file separately. Session cookies and capture metadata remain ignored.

[PROGRESS.md](./PROGRESS.md) tracks all 28 graded tasks and external blockers. Each completed task receives a small English Git commit. Screenshots must be captured directly from the running application and inspected; tasks requiring an address bar use a real headed browser window. Legacy iframe-wrapper screenshots from the previous attempt are excluded from submission.

Deployment, CI verification and submission links are recorded only after they are verified. The recovery source folder and original helper files have been preserved.

## Source and license

Based on [IBM's full-stack capstone template](https://github.com/ibm-developer-skills-network/xrwvm-fullstack_developer_capstone). See [LICENSE](./LICENSE).

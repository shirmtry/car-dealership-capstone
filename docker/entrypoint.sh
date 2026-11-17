#!/usr/bin/env bash
set -Eeuo pipefail
services=()
shutdown() {
  trap - EXIT INT TERM
  for service_pid in "${services[@]}"; do
    kill -TERM "$service_pid" 2>/dev/null || true
  done
  wait || true
}
trap shutdown EXIT INT TERM

mkdir -p /data
if [[ -z "${DJANGO_SECRET_KEY:-}" ]]; then
  export DJANGO_SECRET_KEY
  DJANGO_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(64))')"
fi
if [[ -z "${MONGODB_URI:-}" ]]; then
  mkdir -p /data/mongodb
  mongod --dbpath /data/mongodb --bind_ip 127.0.0.1 --port 27017 \
    --wiredTigerCacheSizeGB 0.25 --quiet --logpath /data/mongodb.log &
  services+=("$!")
  export MONGODB_URI=mongodb://127.0.0.1:27017/car_dealership_capstone
fi
export BACKEND_HOST=127.0.0.1 SENTIMENT_HOST=127.0.0.1

python manage.py migrate --noinput
python manage.py populate_cars
python manage.py bootstrap_demo
python manage.py collectstatic --noinput
node database/app.js &
services+=("$!")
gunicorn --chdir djangoapp/microservices --bind 127.0.0.1:5050 \
  --workers 1 --threads 2 --access-logfile - --error-logfile - app:app &
services+=("$!")
python /app/scripts/wait-services.py --timeout 60
gunicorn --bind "0.0.0.0:${PORT:-8000}" --workers 1 --threads 2 \
  --timeout 120 --access-logfile - --error-logfile - djangoproj.wsgi:application &
services+=("$!")
wait -n "${services[@]}"
echo 'A required service exited; stopping the container.' >&2
exit 1

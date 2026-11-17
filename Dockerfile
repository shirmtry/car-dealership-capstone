FROM node:22-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY server/frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY server/frontend/ ./
RUN CI=true GENERATE_SOURCEMAP=false npm run build

FROM node:22-bookworm-slim AS backend
WORKDIR /build/backend
COPY server/database/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM python:3.11-slim-bookworm AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg tini libstdc++6 \
    && curl -fsSL https://pgp.mongodb.com/server-8.0.asc \
       | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" \
       > /etc/apt/sources.list.d/mongodb-org-8.0.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends mongodb-org-server \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
COPY --from=backend /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
COPY server/ /app/server/
COPY --from=frontend /build/frontend/build /app/server/frontend/build
COPY --from=backend /build/backend/node_modules /app/server/database/node_modules
COPY docker/entrypoint.sh /app/entrypoint.sh
COPY scripts/wait-services.py /app/scripts/wait-services.py
RUN pip install --no-cache-dir -r server/requirements.txt \
    -r server/djangoapp/microservices/requirements.txt \
    && useradd --uid 10001 --create-home openroad \
    && mkdir -p /data \
    && chmod +x /app/entrypoint.sh \
    && chown -R openroad:openroad /app /data
ENV DJANGO_DEBUG=0 PORT=8000 SQLITE_PATH=/data/db.sqlite3 \
    BACKEND_URL=http://127.0.0.1:3030 SENTIMENT_URL=http://127.0.0.1:5050 \
    PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
USER openroad
WORKDIR /app/server
EXPOSE 8000
ENTRYPOINT ["/usr/bin/tini", "--", "/app/entrypoint.sh"]

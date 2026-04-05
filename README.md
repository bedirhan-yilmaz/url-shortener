# URL Shortener

A lightweight, async URL shortener built with **FastAPI** and **PostgreSQL**. Ships with Docker Compose for local development and Kubernetes manifests for production-like deployments.

## Features

- **Async everywhere** — FastAPI + asyncpg connection pool for high throughput
- **Short codes** — 6-character alphanumeric codes with collision retry
- **Auto-provisioned schema** — the database table is created on startup
- **Docker Compose** — one command to spin up the app + Postgres
- **Kubernetes ready** — manifests included under `k8s/`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [FastAPI](https://fastapi.tiangolo.com/) (async lifespan) |
| Database driver | [asyncpg](https://github.com/MagicStack/asyncpg) |
| Database | [PostgreSQL 16](https://www.postgresql.org/) |
| Validation | [Pydantic v2](https://docs.pydantic.dev/) |
| Container | Docker / Docker Compose |
| Orchestration | Kubernetes (kind-friendly) |

## Getting Started

### Prerequisites

- **Python 3.12+**
- **PostgreSQL 16** (or use Docker)
- **Docker & Docker Compose** (optional, for containerised setup)

### Option 1 — Docker Compose (fast)

The fastest way to get running. No local Python or Postgres install required.

```bash
git clone https://github.com/bedirhan-yilmaz/url-shortener.git
cd url-shortener
docker compose up --build
```

The app is available at **http://localhost:8000**.
Postgres runs alongside it with a named volume for persistence.

> **Tip:** Override defaults by setting environment variables before running:
> ```bash
> POSTGRES_USER=myuser POSTGRES_PASSWORD=secret POSTGRES_DB=mydb docker compose up --build
> ```

### Option 2 — Local development

1. **Start a Postgres instance** (skip if you already have one):

   ```bash
   docker run -d --name pg \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     postgres:16-alpine
   ```

2. **Set up the project:**

   ```bash
   git clone https://github.com/<your-username>/url-shortener.git
   cd url-shortener
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure the environment:**

   Create a `.env` file in the project root:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urlshortener
   ```

4. **Run:**

   ```bash
   cd url-shortener-service
   uvicorn main:app --reload
   ```

   Open **http://localhost:8000/docs** for the interactive API docs.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | *(required)* |
| `POSTGRES_USER` | Postgres user (Docker Compose only) | `postgres` |
| `POSTGRES_PASSWORD` | Postgres password (Docker Compose only) | `postgres` |
| `POSTGRES_DB` | Postgres database name (Docker Compose only) | `urlshortener` |

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/shorten` | Create a short link |
| `GET` | `/short/{code}` | Follow a short link (redirects with 307) |
| `GET` | `/docs` | Interactive Swagger UI |

### Create a short link

```bash
curl -X POST http://localhost:8000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/some/very/long/path"}'
```

```json
{
  "short_url": "short/a1B2c3",
  "code": "a1B2c3"
}
```

### Follow a short link

```bash
curl -L http://localhost:8000/short/a1B2c3
```

## Deploying to Kubernetes (kind)

These instructions use [kind](https://kind.sigs.k8s.io/) for a local Kubernetes cluster. Adapt as needed for other environments.

### Prerequisites

- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

### 1. Create the cluster

```bash
kind create cluster --name url-shortener-dev
```

### 2. Build & load the image

kind clusters cannot pull local Docker images directly — build and load the image first:

```bash
# Backend
docker build -t url-shortener-service:latest .
kind load docker-image url-shortener-service:latest --name url-shortener-dev

# Frontend
docker build -t url-shortener-web:latest ./url-shortener-web
kind load docker-image url-shortener-web:latest --name url-shortener-dev
```

### 3. Configure secrets

```bash
cp k8s/postgres-secret-template.yaml k8s/postgres-secret.yaml
```

Edit `k8s/postgres-secret.yaml` and replace the placeholder values with real credentials.

> **Note:** `postgres-secret.yaml` is git-ignored. Never commit real secrets.

### 4. Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/
```

### 5. Verify

```bash
kubectl get pods -n url-shortener
kubectl logs -n url-shortener deploy/url-shortener-service
```

### 6. Access the app

```bash
# Backend API
kubectl port-forward -n url-shortener svc/url-shortener-service-svc 8000:8000

# Frontend (in a second terminal)
kubectl port-forward -n url-shortener svc/url-shortener-web-service 5173:80
```

- **Frontend** → **http://localhost:5173**
- **API docs** → **http://localhost:8000/docs**

## Project Structure

```
├── url-shortener-service/  # FastAPI backend
│   ├── main.py             # FastAPI app & lifespan
│   ├── database.py         # asyncpg pool & schema init
│   ├── models.py           # Pydantic request/response models
│   ├── utils.py            # Short code generation
│   └── routes/
│       └── shortener.py    # API endpoints
├── url-shortener-web/      # React (Vite + MUI) web client
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── k8s/                    # Kubernetes manifests
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
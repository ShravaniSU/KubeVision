.PHONY: dev dev-backend dev-frontend \
        build build-backend build-frontend \
        up up-prod down logs \
        migrate migrate-prod seed studio \
        clean install help

# ─────────────────────────────────────────────────────────────────────────────
# Developer helpers
# ─────────────────────────────────────────────────────────────────────────────

## Start full dev stack (frontend + backend in watch mode)
dev:
	npm run dev

## Start backend dev server only (hot-reload via tsx watch)
dev-backend:
	cd backend && npm run dev

## Start frontend dev server only
dev-frontend:
	cd frontend && npm run dev

# ─────────────────────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────────────────────

## Build both frontend and backend for production
build: build-backend build-frontend

## Compile backend TypeScript
build-backend:
	cd backend && npm run build

## Bundle frontend with Vite
build-frontend:
	cd frontend && npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Docker — Development
# ─────────────────────────────────────────────────────────────────────────────

## Start dev docker-compose stack (builds if needed)
up:
	docker compose up -d

## Start dev stack and force rebuild
up-build:
	docker compose up -d --build

## Stop dev docker-compose stack
down:
	docker compose down

## Tail logs from all containers
logs:
	docker compose logs -f

## Tail logs from backend only
logs-backend:
	docker compose logs -f backend

# ─────────────────────────────────────────────────────────────────────────────
# Docker — Production
# ─────────────────────────────────────────────────────────────────────────────

## Start production docker-compose stack (requires .env.prod)
up-prod:
	docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

## Stop production stack
down-prod:
	docker compose -f docker-compose.prod.yml down

## Tail production logs
logs-prod:
	docker compose -f docker-compose.prod.yml logs -f

# ─────────────────────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────────────────────

## Run Prisma migrations (dev mode — creates migration files)
migrate:
	cd backend && npx prisma migrate dev

## Deploy migrations in production (no file creation)
migrate-prod:
	cd backend && npx prisma migrate deploy

## Seed the database with mock data
seed:
	cd backend && npm run db:seed

## Open Prisma Studio GUI
studio:
	cd backend && npx prisma studio

## Regenerate Prisma client (run after schema changes)
prisma-generate:
	cd backend && npx prisma generate

# ─────────────────────────────────────────────────────────────────────────────
# Type checking
# ─────────────────────────────────────────────────────────────────────────────

## Run TypeScript type-check on both workspaces
typecheck:
	cd backend && npx tsc --noEmit
	cd frontend && npx tsc --noEmit

## Type-check backend only
typecheck-backend:
	cd backend && npx tsc --noEmit

## Type-check frontend only
typecheck-frontend:
	cd frontend && npx tsc --noEmit

# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

## Install all workspace dependencies
install:
	npm install
	cd backend && npm install
	cd frontend && npm install

## Remove containers/volumes and compiled artifacts
clean:
	docker compose down -v --remove-orphans
	rm -rf frontend/dist backend/dist

## Verify docker builds compile cleanly
docker-verify:
	docker build --target production -t kubevision-backend:verify ./backend
	docker build --target production -t kubevision-frontend:verify ./frontend

## Show available make targets
help:
	@grep -E '^##' Makefile | sed 's/## /  /'

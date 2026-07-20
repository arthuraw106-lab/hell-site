.PHONY: help dev build prod down reset logs db-studio db-migrate db-seed lint

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start services in development mode
	docker compose up --build

build: ## Build all Docker images
	docker compose build

prod: ## Start services in production mode (detached)
	docker compose up --build -d

down: ## Stop & remove all containers
	docker compose down

clean: ## Nuclear reset — remove containers, volumes, images
	docker compose down -v --remove-orphans
	docker system prune -f

logs: ## Tail all container logs
	docker compose logs -f

logs-backend: ## Tail backend logs only
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs only
	docker compose logs -f frontend

restart-backend: ## Restart backend only
	docker compose restart backend

restart-frontend: ## Restart frontend only
	docker compose restart frontend

db-studio: ## Open Prisma Studio (requires backend running)
	docker compose exec backend npx prisma studio

db-migrate: ## Run Prisma migrations
	docker compose exec backend npx prisma migrate dev

db-seed: ## Seed database
	docker compose exec backend npm run prisma:seed

db-push: ## Push Prisma schema to DB (no migrations)
	docker compose exec backend npx prisma db push

db-reset: ## Reset database completely
	docker compose exec backend npx prisma migrate reset --force

shell-backend: ## Open interactive shell in backend container
	docker compose exec backend sh

shell-frontend: ## Open interactive shell in frontend container
	docker compose exec frontend sh

api-health: ## Check backend health endpoint
	curl -s http://localhost:4000/api/health | python3 -m json.tool

lint-backend: ## Lint backend
	docker compose exec backend npm run lint

lint-frontend: ## Lint frontend
	docker compose exec frontend npm run lint

status: ## Show running containers
	docker compose ps
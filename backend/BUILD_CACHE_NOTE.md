# Build سریع بک‌اند

برای build معمولی:

docker compose --progress=plain build backend

از این دستور فقط وقتی cache واقعاً خراب شد استفاده کن:

docker compose --progress=plain build backend --no-cache

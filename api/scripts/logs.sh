docker-compose --env-file env/$1/.env -f docker/$1/docker-compose.yaml -p api logs -f --tail 250

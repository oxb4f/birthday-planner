#!/bin/bash

sort -u -t '=' -k 1,1 env/local/.env env/"$1"/.env | grep -v '^$\|^\s*\#' > env/.env

docker-compose --env-file env/.env -f docker/"$1"/docker-compose.yaml -p api up --build -d

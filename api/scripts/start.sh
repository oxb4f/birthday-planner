#!/bin/bash

_ENV=$1

sort -u -t '=' -k 1,1 env/local/.env env/"$_ENV"/.env | grep -v '^$\|^\s*\#' > env/.env

docker-compose --env-file env/.env -f docker/"$_ENV"/docker-compose.yaml -p api up --build -d

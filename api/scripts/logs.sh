#!/bin/bash

docker-compose --env-file env/.env -f docker/"$1"/docker-compose.yaml -p api logs -f --tail 250

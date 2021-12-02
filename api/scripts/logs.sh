#!/bin/bash

run_from=$(pwd)
script_location="${run_from}${BASH_SOURCE[0]:1}"
cd "$(dirname $script_location)" && cd ..

source ./scripts/boot.sh

sudo docker-compose --env-file "$PATH_TO_MAIN_ENV" -f docker/"$RUNNING_ENV"/docker-compose.yaml -p "$PROJECT_NAME" logs -f --tail 250

cd "$run_from" || exit

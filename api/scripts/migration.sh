#!/bin/bash

run_from=$(pwd)
script_location="${run_from}${BASH_SOURCE[0]:1}"
cd "$(dirname $script_location)" && cd ..

args=$*

sudo docker exec -ti app /bin/bash -c "npx mikro-orm $args"

if [ "$args" = "migration:create" ]; then
    sudo chmod -R 777 src/migrations
fi

cd "$run_from" || exit

#!/bin/bash

run_from=$(pwd)
script_location="${run_from}${BASH_SOURCE[0]:1}"
cd "$(dirname $script_location)" && cd ..

args=$*

sudo docker exec -ti app /bin/bash -c "npm run $args"

cd "$run_from" || exit

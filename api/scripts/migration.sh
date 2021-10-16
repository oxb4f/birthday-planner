#!/bin/bash

_args=$*

docker exec -ti app /bin/bash -c "npx mikro-orm $_args"
sudo chmod -R 777 src/migrations

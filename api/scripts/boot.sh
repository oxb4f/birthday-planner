#!/bin/bash

export PROJECT_NAME="api"
export PATH_TO_MAIN_ENV="env/.env"
export ENVS=("dev" "production" "staging")

prepare_env() {
    sort -u -t '=' -k 1,1 env/local/.env env/"$RUNNING_ENV"/.env | grep -v '^$\|^\s*\#' >"$PATH_TO_MAIN_ENV"
}

validate_env() {
    for env in "${ENVS[@]}"; do
        if [ "$env" = "$RUNNING_ENV" ]; then
            return 0
        fi
    done

    return 1
}

if [ $# -eq 0 ]; then
    read -rp "Env: " RUNNING_ENV
elif [ $# -ge 1 ]; then
    RUNNING_ENV="$1"
fi

export RUNNING_ENV

validate_env

case "$?" in
"0")
    echo "Running env: ${RUNNING_ENV}"
    prepare_env
    ;;
*)
    echo "invalid env value :( please, consider using dev, production or staging"
    exit
    ;;
esac

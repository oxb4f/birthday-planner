FROM node:lts-alpine

ENV PROJECT_PATH=/opt/api/
ENV NODE_ENV=$NODE_ENV

RUN apk add --update \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

RUN mkdir $PROJECT_PATH
WORKDIR $PROJECT_PATH

COPY ./*.js $PROJECT_PATH
COPY ./*.json $PROJECT_PATH
COPY ./env/.env $PROJECT_PATH
COPY ./test $PROJECT_PATH/test
COPY ./src $PROJECT_PATH/src

RUN if [ "$NODE_ENV" != "dev" ]; then \
    npm ci ; \
 fi

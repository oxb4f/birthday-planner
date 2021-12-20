FROM node:lts-alpine

ARG PROJECT_PATH=/opt/api/

ENV PROJECT_PATH=${PROJECT_PATH}

ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}

RUN apk add --update \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

RUN npm install -g npm

RUN mkdir $PROJECT_PATH
WORKDIR $PROJECT_PATH

COPY ./*.json $PROJECT_PATH
COPY ./env/.env $PROJECT_PATH
COPY ./src $PROJECT_PATH/src

RUN if [ "$NODE_ENV" != "dev" ]; then \
    npm ci ; \
 fi

RUN if [ "$NODE_ENV" = "production" ]; then \
    npx nest build ; \
 fi

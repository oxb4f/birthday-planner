FROM redis:6.0-alpine

COPY ./docker/dev/redis/dev.conf /usr/local/etc/redis/redis.conf

ENTRYPOINT [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

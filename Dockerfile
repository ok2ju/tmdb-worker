FROM node:latest
LABEL maintainer "Alexey Vakulich <alexey.vakulich@gmail.com>"

ENV SRC_DIR=/usr/workspace/tmdb-worker

ADD . $SRC_DIR
WORKDIR $SRC_DIR

ENV APP_PORT=3000 \
    DB_URI=mongodb://db:27017 \
    TMDB_BASE_URL=https://api.themoviedb.org/3/ \
    TMDB_API_KEY= \
    NODE_ENV=production

CMD ["node", "./src/server.js"]

EXPOSE 3000

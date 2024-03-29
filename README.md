# tmdb-worker

TMDB database replenishment worker

## Running
Pull mongo docker image:
```sh
docker pull mongo
```

Start mongoDB:
```sh
make run-mongo
```
or
```sh
docker run --name mongodb -p 27017:27017 -d mongo
```

Install service dependencies:
```sh
yarn
```

Create `.env` file using `.env.example`. Add your [TMDB](https://www.themoviedb.org/) `API_KEY` into `.env`.

Start service:
```sh
yarn start
```

Start service as docker container:
```sh
make run-worker -e TMDB_API_KEY=yourapikey
```

## TODOs
1. Error handling;
2. Loggin;
3. ~~Docker image;~~
4. TravisCI;
5. ~~update README;~~
6. ~~Move logic into DB connection callback;~~
7. Code linting (standard);
8. ~~Move code into separate files.~~

## !
```sh
docker logs -f tmdb-worker
docker exec -it tmdb-worker bash
cat /etc/hosts
env
```

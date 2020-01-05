SHELL = /bin/bash
WORKDIR := $(PWD)

MODULE_NAME = tmdb-worker
IMAGE_VERSION = latest
IMAGE_URI = ok2ju

default: image-build
.PHONY: default

image-build:
	@ echo "---> Building Docker image ..."
	@ docker build -t $(IMAGE_URI)/$(MODULE_NAME):$(IMAGE_VERSION) $(WORKDIR)
.PHONY: image-build

image-publish:
	@ echo "---> Publishing Docker image ..."
	@ docker push $(IMAGE_URI)/$(MODULE_NAME):$(IMAGE_VERSION)
.PHONY: image-publish

run-worker:
	@ echo "---> Running Docker container ..."
	@ docker run -it -p 3000:3000 -d --rm --link mongodb:db --name $(MODULE_NAME) $(IMAGE_URI)/$(MODULE_NAME):$(IMAGE_VERSION)
.PHONY: run-worker

stop-worker:
	@ echo "---> Stopping Docker container ..."
	@ docker stop $(MODULE_NAME)
.PHONY: stop-worker

run-mongo:
	@ echo "---> Running MongoDB container ..."
	@ docker run --rm --name mongodb -p 27017:27017 -d mongo
.PHONY: run-mongo

stop-mongo:
	@ echo "---> Stopping MongoDB container ..."
	@ docker stop mongodb
.PHONY: stop-mongo

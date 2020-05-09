
###
# 1. Dependencies
###

FROM node:12-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

#Change Work Directory
WORKDIR /home/node/app

#Copy the package.json file
COPY package.json  ./

RUN apk update && apk upgrade && apk add ca-certificates && update-ca-certificates

RUN apk add --update tzdata

ENV TZ=Africa/Lagos

# Clean APK cache
RUN rm -rf /var/cache/apk/*

COPY --chown=node:node . .

#RUN NODE_ENV=staging.test yarn staging-test

EXPOSE 80

CMD npm run start-prod


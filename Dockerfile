FROM node:20-alpine3.18 AS build
WORKDIR /app

ARG VITE_GOOGLE_CLIENT_ID

COPY package*.json ./
# Alpine requires build tools for some native npm modules; install then remove them
RUN apk add --no-cache --virtual .build-deps python3 g++ make \
  && npm ci --no-audit --no-fund \
  && apk del .build-deps

COPY . .

RUN npm run build

CMD [ "npm", "run", "start" ]

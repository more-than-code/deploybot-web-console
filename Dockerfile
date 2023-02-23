FROM node:19-alpine AS build
WORKDIR /app

ARG VITE_PIPELINE_ENDPOINT

COPY . .

RUN \
  --mount=type=cache,target=./node_modules \
  npm install && npm run build

CMD [ "npm", "run", "start" ]

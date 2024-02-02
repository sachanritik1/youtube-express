
FROM node:20-alpine3.18 AS base
WORKDIR /usr/src/app
COPY package* .
RUN npm install

FROM base AS dev
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY . .
CMD [ "npm", "run", "start" ]


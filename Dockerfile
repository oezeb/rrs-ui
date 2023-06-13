FROM node:18-alpine AS build

WORKDIR /rrs-ui

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build
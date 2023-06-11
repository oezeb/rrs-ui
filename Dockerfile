FROM node:18-alpine AS build

WORKDIR /rrs-ui

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /rrs-ui/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

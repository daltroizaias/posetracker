# Estágio de desenvolvimento (com hot reload)
FROM node:18-alpine as dev

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]

# Estágio de construção (build)
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npm run build

# Estágio de produção
FROM nginx:alpine as prod

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
FROM node:18.14.2-alpine3.17 as build
WORKDIR /app
ENV REACT_APP_HOST_SERVER=192.168.1.212
ENV REACT_APP_PORT_SERVER=5003
ENV PORT = 3003
ADD ./package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.16.0-alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
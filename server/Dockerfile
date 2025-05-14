FROM node
WORKDIR /app
ENV PORT=5006
COPY . .
RUN npm install
RUN ls
EXPOSE ${PORT}
CMD ["npm","start"]

FROM node:12

RUN mkdir -p /usr/blockchain_udistrital
WORKDIR /usr/blockchain_udistrital

COPY package*.json ./
# COPY public/ ./

RUN npm install
COPY . .

EXPOSE 4002
EXPOSE 8545
CMD ["node","app.js"]
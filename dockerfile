FROM node:18

WORKDIR /Users/ritiksachan/Desktop/youtube-express

COPY package* .

RUN npm install

COPY . .

EXPOSE 5000

CMD npm run dev


FROM node:18

WORKDIR /Users/ritiksachan/Desktop/youtube-express

COPY . .

RUN npm install

EXPOSE 5000

CMD npm run dev


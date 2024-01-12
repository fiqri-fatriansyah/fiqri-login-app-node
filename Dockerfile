FROM node:20-alpine
#Create app directory
WORKDIR /usr/src/app
#Install app dependencies
#A
#w
COPY package*.json ./
RUN npm install
#If
#RUN
#Bundle
COPY . .
EXPOSE 3000
RUN npx prisma generate && npx prisma db seed
CMD ["npm", "run", "prod"]
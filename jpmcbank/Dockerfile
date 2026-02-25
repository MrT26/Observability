FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app sources
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]

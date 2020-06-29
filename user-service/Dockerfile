# Use NodeJS base image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source and config file(s)
COPY ./src ./src
COPY tsconfig*.json ./

# Compile typescript to javascript
RUN npm run tsc

# Bind the port that the image will run on
EXPOSE 8080

# Define the Docker image's behavior at runtime
CMD ["npm", "run", "dev"]
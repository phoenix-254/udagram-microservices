## Stage 1 : Build

# Use ionic base image
FROM beevelop/ionic AS ionic

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Bundle app source
COPY . .

# RUN ionic init
RUN ionic build


## Stage 2 : Run

# Use nginx base image
FROM nginx:alpine

# COPY deployable pacakge files - www to /usr/share/nginx/html
COPY --from=ionic  /usr/src/app/www /usr/share/nginx/html
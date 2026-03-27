# docker build --env-file .env --build-arg API_URL=$API_URL -t wastetrade-frontend .
#############
### build ###
#############

# base image
FROM node:20.19.1-alpine as build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci
RUN npm install -g @angular/cli@19.2.0

# add app
COPY . /app

# Define a build argument for the API URL
ARG API_URL

# Replace the environment variable in the Angular environment file
RUN sed -i "s|apiUrl: '.*'|apiUrl: '${API_URL}'|" src/environments/environment.prod.ts

# Generate build
RUN npm run build

############
### prod ###
############

FROM node:20.19.1-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 4000

CMD ["npm", "run", "serve:ssr:watse-trade"]

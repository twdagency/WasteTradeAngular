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
RUN sed -i "s|gaId: '.*'|gaId: '${GA_ID}'|" src/environments/environment.prod.ts

# Generate build
RUN npm run build

############
### prod ###
############

# base image
FROM nginx:1.27.5-alpine

# copy artifact build from the 'build environment'
COPY --from=build /app/dist/watse-trade/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]

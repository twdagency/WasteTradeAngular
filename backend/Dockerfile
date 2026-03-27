FROM node:22-slim

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

RUN corepack enable pnpm && corepack prepare pnpm@10.0.0 --activate

WORKDIR /home/node/app

# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1  \
#       --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

RUN npm i -g pm2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

# Bundle app source code
COPY . .

# Build the app and migrate the database
RUN pnpm build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

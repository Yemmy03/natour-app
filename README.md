# Natours Project

## Intro

This README guides you, step by step, from project files to a running Natours app in Docker (Node.js + MongoDB + Redis). Follow the steps in order. If something fails, check the Troubleshooting section at the end.

----------------------------------
## Prerequisites

1. Docker installed
2. Docker Compose available (modern Docker includes it as docker compose)
3. Project files in one folder containing at least: `Dockerfile`, `docker-compose.yml`, `config.env`, app source files (`index.js`, `app.js`, etc.)

----------------------------------
## Steps

### Step 1 —> Confirm you are in the project root

cd /path/to/Natour
ls -la

You should see `Dockerfile`, `docker-compose.yml`, `config.env` (or `example.env.txt`), and the server files.

### Step 2 —> Prepare environment file (config.env)

Create or edit `config.env` in the project root. Use plain KEY=VALUE lines:

NODE_ENV=development
PORT=3000
MONGO_DATABASE_LOCAL=mongodb://mongo:27017/natours
MONGO_USE_LOCAL=true
REDIS_SERVER_URL=redis://redis:6379
REDIS_DELETE_TIME=600000
JWT_SECRET=your-jwt-secret
JWT_EXPIRES=1d

Save and keep this file out of version control (add `config.env` to `.gitignore`).

### Step 3 —> Ensure the app binds to all interfaces

Find the server starter (where the app actually listens). Likely `index.js`. Confirm it uses `0.0.0.0`:


# search for the listen call and bind to 0.0.0.0 (runs in project root)

server.listen(config.appPort || 3000, '0.0.0.0', () => {
  console.log(`app is listening on port ${config.appPort || 3000}`);
});

Binding to `0.0.0.0` is necessary so Docker can forward host traffic into the container.

### Step 4 —> Dockerfile (multi-stage build)

Dockerfile
# builder
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache python3 make g++
RUN npm install
COPY . .

# runtime
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/src/app/ ./
EXPOSE 3000
ENTRYPOINT ["node", "index.js"]

### Step 5 —> docker-compose.yml (service orchestration)

# Yaml
services:
  app:
    build: .
    image: natours-app
    container_name: natours-app
    ports:
      - "3000:3000"
    env_file:
      - ./config.env
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6
    container_name: natours-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7
    container_name: natours-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:

### Step 6 —> Builds and run (compose)

Stops any old or unused container and start fresh:


a) docker compose down -v
docker compose up -d --build


b) Verify containers: docker ps

c) Check logs: docker compose logs -f app

d) Check env vars inside the running app container: 
docker exec -it natours-app sh -c 'printenv | grep -E "NODE_ENV|PORT|MONGO|REDIS"'


e) Check listening ports inside container:

docker exec -it natours-app sh
# inside container
netstat -tuln
You should see the app listening on `0.0.0.0:3000`.

### Step 7 —> Access the app

Open in browser or use curl on the host:
curl http://localhost:3000

If you see a connection error, check `docker compose logs -f app`.

------------------------------

## Notes

* Keep `config.env` out of Git. Use `example.env.txt` to document required keys.
* Use `env_file` in compose so services get the environment automatically.
* Use `0.0.0.0` for server binding so containers are reachable.

------------------------------

## Issues I faced and how each was solved (Troubleshooting Section)

1. Missing environment variables at runtime (ConfigurationError for NODE\_ENV)

   * Cause: container was started without envs (running `docker run` without `--env-file`) and config file format had inline comments.
   * Fix: use `env_file: ./config.env` in `docker-compose.yml` or run `docker run --env-file ./config.env ...`. Clean `config.env` formatting (no inline comments on the same line).

2. App listening only on internal loopback (connection reset)

   * Cause: server was bound to `127.0.0.1` or default internal address.
   * Fix: change `server.listen(..., '0.0.0.0', ...)` so Docker can forward host traffic.

3. `npm install` errors (node-gyp / deasync / native modules)

   * Cause: native modules need build tools (python, make, g++).
   * Fix: In Docker builder stage I discovered I needed to add `apk add --no-cache python3 make g++` before `npm install`.


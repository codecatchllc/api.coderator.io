# Demo Project

A REST+JSON API service

## Quickstart

1. Install required packages:

   ```
   yarn
   ```

2. Copy `env.example` to `.env` and edit it with your settings.
   At least `DATABASE_URL` must be specified.

3. Create initial database migration:

   ```
   npx prisma migrate dev --name initial
   ```

   When run the first time, it will also install
   `@prisma/client` and generate client code.

4. Run the tests:

   ```
   yarn test
   ```

## Development

To run the server in development mode, with log pretty-printing
and hot-reload:

```
yarn devstart
```

To run the tests, run the `test` script (`yarn test`). There are
also related `coverage` (run tests and measure test coverage) and `lint`
(run linter) scripts you can use. ESLint is used for linting and its
configuration is specified in `.eslintrc.json`.

The code can be automatically using `prettier`. To manually run
prettier, use `yarn prettier`. Better yet, integrate your editor
to run it on save.

### Development shell

Development shell runs nodejs shell with the application object (`app`),
database models (`models`) and the configuration object (`config`)
already imported. To run the shell:

```
yarn shell
```

The shell supports toplevel async/await (ie. you can use async/await
directly in the shell if needed).

### OpenAPI and Swagger docs

The project includes an OpenAPI spec and a Swagger UI for documentation and
interaction with API.

The Swagger UI is available at `/api/docs` path (`/` is redirected to it by
default) and the spec itself is available at `/api/docs/openapi.json`.

## Production

To run the app in production, run:

```
npm start
```

Logs will be sent to the standard output in JSON format.

## Background tasks with Bull

A simple task queue is built using `bull` and backed by Redis. Tasks are
defined and exported in `src/tasks.js`. Call proxies are created automatically
and tasks can be queued with:

```
import { tasks } from "./src/utils/queue.js";
const result = await tasks.someFunction(...);
```

To run the worker(s) that will execute the queued tasks, run:

```
yarn worker
```

## Using Docker

Build the docker image with:

        docker build -t demo-project .

The default command is to start the web server (gunicorn). Run the image
with `-P` docker option to expose the internal port (3000) and check the
exposed port with `docker ps`:

        docker run --env-file .env --P demo-project
        docker ps

Make sure you provide the correct path to the env file (this example assumes
it's located in the local directory).

To run a custom command using the image (for example, starting the Node
shell):

        docker run --env-file .env demo-project yarn shell

To run a Django shell inside the container:

        docker run --env-file .env -t demo-project

Note that any changes inside the container will be lost. If you want to use
SQLite with docker, mount a docker volume and place the SQLite database
inside it.

For more information on the docker build process, see the included
`Dockerfile`.

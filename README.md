# Coderator API

A REST+JSON API service

## Quickstart

1. Install required packages:

   ```
   yarn
   ```

2. Copy `env.example` to `.env` and edit it with your settings.

   The following enviroment variables must be set:

   - `DATABASE_URL`
   - `NODEMAILER_USER`
   - `NODEMAILER_PASS`
   - `RECAPTCHA_SECRET`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`

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
yarn dev
```

To run the tests, run the `test` script (`yarn test`). There are
also related `coverage` (run tests and measure test coverage) and `lint`
(run linter) scripts you can use. ESLint is used for linting and its
configuration is specified in `.eslintrc.json`.

The code can be automatically using `prettier`. To manually run
prettier, use `yarn prettier`. Better yet, integrate your editor
to run it on save.

### OpenAPI and Swagger docs

The project includes an OpenAPI spec and a Swagger UI for documentation and
interaction with API.

The Swagger UI is available at `/api/docs` path (`/` is redirected to it by
default) and the spec itself is available at `/api/docs/openapi.json`.

## Production

To run the app in production, run:

```
npm run start
```

Logs will be sent to the standard output in JSON format.

## Using Docker

Build the docker image with:

        docker build -t coderatorapi .

The default command is to start the web server (gunicorn). Run the image
with `-P` docker option to expose the internal port (3000) and check the
exposed port with `docker ps`:

        docker run --env-file .env --P coderatorapi
        docker ps

Make sure you provide the correct path to the env file (this example assumes
it's located in the local directory).

To run a custom command using the image (for example, starting the Node
shell):

        docker run --env-file .env coderatorapi yarn shell

To run a Django shell inside the container:

        docker run --env-file .env -t coderatorapi

Note that any changes inside the container will be lost. If you want to use
SQLite with docker, mount a docker volume and place the SQLite database
inside it.

For more information on the docker build process, see the included
`Dockerfile`.

# Aidd Syncoop app

This is an official Aidd Syncoop application with UI & API built with NextJS.

## Download NodeJS
Download NodeJS version v20.11.1 with NPM version 10.8.3
If NPM version is old one then it can be updated with below command
npm install -g npm@10.8.3

## Install PNPM
Run npm install pnpm

## Set your git username and email as below
git config --global user.email "<GITHUB_EMAIL_ID>"
git config --global user.name "<GITHUB_NAME>"

## What's inside?

This Aidd syncoop includes the following apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app for running UI
- `api`: another [Next.js](https://nextjs.org/) app for running NextJS APIs

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Environment file

Create a new .env file in web folder and below lines

AUTH_SECRET=[AUTH_SECRET]
API_HOST_URL=http://localhost:3001

To generage AUTH SECRET you can run below command
```
openssl rand -base64 32
```

## Package installation

To install all packages, run the following command:

```
cd aidd-syncoop
pnpm install
```

### Build

To build all apps, run the following command:

```
cd aidd-syncoop
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd aidd-syncoop
pnpm dev
```

### Postgres installation

To install postgres image first install docker or podman then run below command.
```
docker run postgres
```

To create docker container, run below command and replace text [PASSWORD] with your password value.

```
docker container create --name aidd_syncoop_pg -p 5433:5432 -h aidd_syncoop_pg -e POSTGRES_PASSWORD=[PASSWORD] postgres
```

To start container, run below command.

```
docker start aidd_syncoop_pg
```

To check logs for your container, run below command.

```
docker logs aidd_syncoop_pg
```

To execute postgres database server, run below command

```
docker exec -it aidd_syncoop_pg psql -U postgres
```

Create new database `aidd_syncoop` and connect to database as mentioned below

```
CREATE DATABASE aidd_syncoop;
\connect aidd_syncoop;
```

Now we need to update postgres credentials into .env file placed in apps\api folder

Update below line with correct password and connected database.
Replace [PASSWORD] with your postgres password and [Database] with your connected database

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@localhost:5433/[DATABASE]?schema=public"
```

Note: If you have installed podman instead of docker then replace docker text with podman in all above commands.


#### Prisma setup

If you are executing prisma schema first time, run below commands

```
mkdir apps\api\prisma\migrations\0_init
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
```

Apply migration file generated in 0_init folder

```
cd apps\api
npx prisma migrate resolve --applied 0_init
```
Note: 0_init can be replaced with any migration folder available in migrations directory


Generate prisma client so that application can easily connect Database.

```
cd apps\api
npx prisma generate
```

To migrate database, run below command

```
cd apps\api
npx prisma migrate dev
```


If you are not executing prisma schema first time, run below commands

First generate prisma client so that application can easily connect Database.

```
cd apps\api
npx prisma generate
```

To generate tables in database, run below command.

```
cd apps\api
npx prisma migrate dev
```

To pull database update from your postgres DB, run below command

```
npx prisma db pull
```

To push your schema changes to database, run below command

```
npx prisma db push
```
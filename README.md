# Aidd Syncoop app

This is an official Aidd Syncoop application with UI & API built with NextJS.

## Download NodeJS
Download NodeJS version v20.11.1 with NPM version 10.8.3
If NPM version is old one then it can be updated with below command
npm install -g npm@10.8.3

## Download Docker Postgres image
Run docker pull postgres

## Install PNPM
Run npm install pnpm

## Set your git username and email as below
git config --global user.email "<GITHUB_EMAIL_ID>"
git config --global user.name "<GITHUB_NAME>"

## What's inside?

This Aidd syncoop includes the following packages/apps:

### Apps and Packages

- `api`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/tailwind-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Update postgres credentials

```
cd aidd-syncoop\apps\api
Open .env file and update postgres credentials
```

## Package installation

To install all packages, run the following command:

```
cd aidd-syncoop
pnpm install
```

### Build

To build all apps and packages, run the following command:

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

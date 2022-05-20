![Doubtfire Logo](http://puu.sh/lyClF/fde5bfbbe7.png)

# Contributing to Doubtfire Web

We welcome additions and extensions to Doubtfire that help progress our goal of supporting student learning through frequent formative feedback and delayed summative assessment.

This guide provides high-level details on how to contribute to the Doubtfire Web repository.

Before continuing, **please read the [contributing document](https://github.com/doubtfire-lms/doubtfire-deploy/blob/development/CONTRIBUTING.md)**, as this outlines the Git workflow you should be following.

## Table of Contents

- [Contributing to Doubtfire Web](#contributing-to-doubtfire-web)
  - [Table of Contents](#table-of-contents)
  - [Project structure](#project-structure)
  - [Testing](#testing)
  - [Formatting](#formatting)
  - [Migrating components](#migrating-components)

## Project structure

Coming...

## Testing

After installing all the dependencies, to run the front-end Angular tests, run the following command:

```shell
npm test
```

### Formatting

- [ESLint](https://eslint.org/) is used in the project to enforce code style and should be
  configured in your [editor](https://eslint.org/docs/user-guide/integrations).
- [Prettier](https://prettier.io/) is also used and apply automatically by ESLint.

We also use a number of framework plugins:

- [TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)

You can check this manually by running:

```shell
npm run lint
```

You can ask ESLint to fix issues by running:

```shell
npm run lint:fix
```

Please note that not all issues can be fixed by ESLint and Prettier.

## Migrating components

See [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)

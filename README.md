# deftly

## Local Usage

### Ports

- 3000: `dashboard`
- 3003: `marketing`
- 3010: `megalith`

## Monorepo Stuff

### Running commands

Keep your workind directory at the monorepo root and use `yarn workspace <workspace name> <command>`.

For example, to add a dependency to megalith you'd do `yarn workspace megalith add leftpad`.
Or to run megalith locally you'd `yarn workspace megalith start:local`.

### Adding package dependencies

1. Add `tsconfig.json` reference
2. Add `package.json` dependency
3. Run `yarn` @ root

Note you made need to restart your editors typescript server after doing this.
In VSCode this is `cmd-shift-p Typescript: Restart TS Server` while a ts editor pane is active.

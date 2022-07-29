# decel

[![asciicast](https://asciinema.org/a/iTSgJOYEP6cp8Hd8A8cFE9l8u.svg)](https://asciinema.org/a/iTSgJOYEP6cp8Hd8A8cFE9l8u)

A CLI for Deno Deploy

Better UX feels like [vercel/cli](https://github.com/vercel/vercel)

## Guide

### Prerequisite

1. Install `decel` with Deno

  ```shell
  deno install -A --unstable --no-check https://deno.land/x/decel@v1.0.0/decel.ts
  ```

2. Get a Access Token from [Deno Deploy Dash](https://dash.deno.com/account#access-tokens)

3. Export the token to env `export DENO_DEPLOY_TOKEN=xxx` or use with `decel --token=xxx`

### Usage

```shell
$ decel -h

decel - a CLI for Deno Deploy

  Usage:
    deno <command> [options]

  Commands:
    ls | list - list all projects in Deno Deploy

  Options:
    -h, --help      Show help message
    
    --token         Deno Deploy Access Token
    --prod          Deploy in production mode
    --static        Deploy with static files

    [ls]
    --show-dev      Show dev domain in ls table


  Examples:

  - Deploy the current directory to Deno Deploy

    $ decel
  
  - Deploy the current directory with a custom name

    $ decel --name my-project

  - Deploy the current directory with entry file

    $ decel ./app.ts
```

## LICENSE

[MIT](./LICENSE)

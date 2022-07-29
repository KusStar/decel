// deno-lint-ignore-file ban-ts-comment
import { config, dayjs, relativeTime, colors } from './deps.ts'

dayjs.extend(relativeTime)

export const env = { ...config(), ...Deno.env.toObject() };

export const formatDate = (date: string) => {
  // @ts-expect-error
  return dayjs(date).fromNow()
}

export const APIS = {
  DASH_API: 'https://dash.deno.com',
  get INDEX_DATA() {
    return `${this.DASH_API}/projects/index?_data_`
  },
  get PROJECTS() {
    return `${this.DASH_API}/_api/projects`
  },
  get INFO() {
    return `${this.DASH_API}/_app?_data_`
  },
  ORG_DATA(orgId: string) {
    return `${this.DASH_API}/orgs/${orgId}?_data_`
  }
}

export const showHelp = () => {
  console.log(`decel - a CLI for Deno Deploy

  ${colors.gray('Usage')}:
    deno <command> [options]

  ${colors.gray('Commands:')}
    ls | list - list all projects in Deno Deploy

  ${colors.gray('Options:')}
    -h, --help      Show help message
    
    --token         Deno Deploy Access Token
    --prod          Deploy in production mode
    --static        Deploy with static files

    [ls]
    --show-dev      Show dev domain in ls table


  ${colors.gray('Examples:')}

  - Deploy the current directory to Deno Deploy

    ${colors.cyan('$ decel')}
  
  - Deploy the current directory with a custom name

    ${colors.cyan('$ decel --name my-project')}

  - Deploy the current directory with entry file

    ${colors.cyan('$ decel ./app.ts')}
`)
}

export const HEADERS = {
  'cookie': `token=${env.DENO_DEPLOY_TOKEN}`,
  'content-type': "application/json"
}
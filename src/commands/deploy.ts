import { Select, prompt, Input, Spinner, colors } from '../deps.ts'
import { APIS, env, HEADERS } from '../utils.ts';
import { InfoData, Organization } from '../types/info.ts';
import { OrgData } from '../types/org.ts';
import { deploy as denoDeploy, error, parseEntrypoint } from '../depolyctl/index.ts'
import { flags, unknown } from '../flags.ts'

interface OutOrg extends Organization {
  name: string;
}

const toTop = <T>(arr: T[], filter: (item: T) => boolean) => {
  const idx = arr.findIndex(filter)
  if (idx === -1) {
    return arr
  }
  const [top] = arr.splice(idx, 1)
  return [top, ...arr]
}

const getInfo = async () => {
  const spin = Spinner('Fetching user info...').start()
  const res = await fetch(APIS.INFO, {
    headers: HEADERS
  })
  const data: InfoData = await res.json()
  spin.stop()

  const { organizations, user } = data
  return toTop(organizations.map(org => {
    if (org.id === user.id) {
      org.name = user.name
    }
    return org as OutOrg
  }), org => org.name === user.name)
}

const createProject = async (name: string, orgId: string): Promise<string | undefined> => {
  const spin = Spinner('Creating project...').start()
  const data = await fetch(APIS.PROJECTS, {
    method: "POST",
    body: JSON.stringify({
      "name": name,
      "organizationId": orgId,
      "envVars": {}
    }),
    headers: HEADERS
  })
  spin.stop()

  if (data.ok) {
    console.log(colors.green(`   Project ${colors.bold(name)} created`))
    return name
  } else {
    const failed = await data.json()
    if (failed.code === 'projectNameInUse') {
      const randomName = `${name}-${crypto.randomUUID().slice(0, 6).toLowerCase()}`
      console.error(`${colors.yellow(`   Info: ${failed.message}`)}`)
      const result = await prompt([{
        name: "newName",
        message: "Type a new name",
        type: Input,
        default: randomName,
      }])
      return await createProject(result.newName as string, orgId)
    } else {
      throw new Error(`${colors.red(`   Error: ${failed.message}`)}`)
    }
  }
}

export const isProjectExist = async (name: string, orgId: string) => {
  const spin = Spinner(`Checking project ${colors.bold(name)} available...`).start()
  const res = await fetch(APIS.ORG_DATA(orgId), {
    headers: HEADERS
  })
  spin.stop()

  const data: OrgData = await res.json()
  const { projects } = data
  return projects.some(project => project.name === name)
}

const DEFAULT_ENTRIES = ["./main.ts", './index.ts', 'app.ts']

const getMaybeEntryFile = async () => {
  let entry
  for await (const dirEntry of Deno.readDir(Deno.cwd())) {
    if (DEFAULT_ENTRIES.concat(unknown[0]).includes(dirEntry.name) && dirEntry.isFile) {
      entry = dirEntry.name
    }
  }
  return entry
}

export const deploy = async () => {
  const info = await getInfo()

  const options = info.map(org => `${org.name}`)
  const result = await prompt([
    {
      name: "org",
      message: "Which organization do you want to deploy to?",
      type: Select,
      options,
      default: options[0],
    },
    {
      name: "name",
      message: "What is the name of the project?",
      type: Input,
      default: Deno.cwd().split('/').pop(),
    }
  ]);
  let { org, name } = result
  const orgId = info[options.indexOf(org || '')].id
  if (orgId && name) {
    if (await isProjectExist(name, orgId)) {
      console.log(colors.magenta(`   Project ${colors.bold(name)} already created`))
    } else {
      const createdName = await createProject(name, orgId)
      if (createdName) {
        name = createdName
      }
    }
    console.log('   Check on ' + colors.cyan(`https://dash.deno.com/projects/${name}`))
    const defaultEntry = await getMaybeEntryFile()
    const result = await prompt([{
      name: "entry",
      message: "Entry file",
      type: Input,
      default: defaultEntry,
    }])
    if (result.entry) {
      const opts = {
        entrypoint: await parseEntrypoint(result.entry).catch((e) => error(e)),
        importMapUrl: null,
        static: flags.static,
        prod: flags.prod,
        token: env.DENO_DEPLOY_TOKEN,
        project: name,
        dryRun: false,
      };
      await denoDeploy(opts)
    }
  }
}
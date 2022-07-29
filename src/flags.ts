import { parseFlags } from './deps.ts'

interface Flags {
  help: boolean
  prod: boolean
  showDev: boolean
  static: boolean
  token?: string
}

const { flags, unknown } = parseFlags<Flags>(Deno.args, {
  flags: [
    {
      name: 'help',
      aliases: ['h'],
      standalone: true
    },
    {
      name: 'prod',
      type: 'boolean',
      optionalValue: true,
      default: false,
    },
    {
      name: 'show-dev',
      type: 'boolean',
      optionalValue: true,
      default: false,
    },
    {
      name: 'token',
      type: 'string',
      optionalValue: true,
    },
    {
      name: 'static',
      default: true
    }
  ]
})

export { flags, unknown }

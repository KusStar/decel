import { ls } from './src/commands/ls.ts'
import { deploy } from './src/commands/deploy.ts';
import { showHelp, env } from './src/utils.ts';
import { flags, unknown } from './src/flags.ts';

if (flags.token) {
  env.DENO_DEPLOY_TOKEN = flags.token;
}

if (flags.help) {
  showHelp()
  Deno.exit(0)
} else {
  const [cmd] = unknown
  if (cmd === 'ls' || cmd === 'list') {
    await ls()
  } else {
    await deploy()
  }
}
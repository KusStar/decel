import { ls } from './src/commands/ls.ts'
import { deploy } from './src/commands/deploy.ts';
import { showHelp } from './src/utils.ts';
import { flags, unknown } from './src/flags.ts';

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
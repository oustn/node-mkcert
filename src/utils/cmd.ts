import { userInfo } from 'node:os';
import debug from 'debug';
import execa from 'execa';
import {lookpath} from "lookpath";

const sudoWarningOnce = (function() {
  let warned = false;
  return function once() {
    if (warned) return
    warned = true;
    console.warn(`Warning: "sudo" is not available, and mkcert is not running as root. The (un)install operation might fail. ⚠️`);
  }
})()

async function binaryExists(name:string): Promise<boolean> {
  return !!(await lookpath(name));
}

async function commandWithSudo(bin: string, ...commands: string[]) {
  const user = userInfo();
  if (user.uid === 0) {
    return execa(bin, commands);
  }

  if (!await binaryExists('sudo')) {
    sudoWarningOnce();
    return execa(bin, commands);
  }

  return execa('sudo', ["--prompt=Sudo password:", "--", bin, ...commands]);
}

async function command(bin: string, ...commands: string[]) {
  return execa(bin, commands);
}

async function silentCommand(bin: string, ...commands: string[]): Promise<boolean> {
  try {
    await execa(bin, commands, { stdio: 'ignore' });
    return true
  } catch (e) {
    return false
  }
}

export {
  command,
  silentCommand,
  commandWithSudo,
}

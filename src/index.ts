import { homedir } from 'node:os';
import { env } from 'node:process';
import { posix } from 'node:path';

import { ensureDirSync } from 'fs-extra';

import { config } from './config';
import { Options } from './types';
// import {pki} from "node-forge";

function getCARoot(): string {
  if (env && env.CAROOT) {
    return env.CAROOT
  }

  const home = homedir()
  return posix.join(home, config.base)
}

class Mkcert {
  private CAROOT: string = getCARoot()
  // private caCert: pki.Certificate;
  // private caKey: pki.rsa.PrivateKey;

  constructor(
    private readonly installMode: boolean,
    private readonly uninstallMode: boolean,
    private readonly csrPath: string,
    private readonly pkcs12: boolean,
    private readonly ecdsa: boolean,
    private readonly client: boolean,
    private readonly certFile: string,
    private readonly keyFile: string,
    private readonly p12File: string,
  ) {
    this.init()
  }

  private init() {
    if (!this.CAROOT) {
      throw new Error('ERROR: failed to find the default CA location, set one as the CAROOT env var');
    }

    ensureDirSync(this.CAROOT);
  }

  async sign(hosts: string[]) {}
}

function sign(hosts: string[], options: Options) {
  if (options.CAROOT && (options.install || options.uninstall)) {
    throw new Error('ERROR: you can\'t set -[un]install and -CAROOT at the same time')
  }
}

export {
  sign,
  getCARoot,
  Mkcert,
}

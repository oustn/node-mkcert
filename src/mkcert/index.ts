// eslint-disable-next-line @typescript-eslint/no-require-imports
import execa = require('execa');
import { chmod } from 'fs-extra';
import { MkcertBin } from './mkcert-bin';

class Mkcert {
  private readonly bin;

  constructor(binPath: string, version: string) {
    this.bin = new MkcertBin(binPath, version);
  }

  async exec(commands: string[], options: Record<string, any>) {
    const bin = await this.bin.getMkcertBin();

    await chmod(bin, 0o755);

    return execa(bin, commands, options);
  }
}

export { Mkcert };

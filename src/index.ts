import { homedir } from 'node:os';
import { join } from 'node:path';
import { ensureDir } from 'fs-extra';
import { Mkcert } from './mkcert';

type Option = {
  version?: string;
  binPath?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const BASE = '.node-mkcert';

class MkcertWrapper {
  private static resolveFileNames(hosts: string[]) {
    let defaultName = hosts[0].replace(/([:*])/g, (replace) =>
      replace === ':' ? '_' : '_wildcard',
    );
    if (hosts.length > 1) {
      defaultName = `${defaultName}+${hosts.length - 1}`;
    }

    // https://github.com/FiloSottile/mkcert/blob/2a46726cebac0ff4e1f133d90b4e4c42f1edf44a/cert.go#L176
    return {
      certFile: `${defaultName}.pem`,
      keyFile: `${defaultName}-key.pem`,
    };
  }

  private mkcert?: Mkcert;

  private readonly version;

  private readonly defaultPath = join(homedir(), BASE);
  private readonly binPath = this.defaultPath;

  constructor(option: Option = {}) {
    const { version, binPath } = option;

    this.version = version ? version : 'latest';

    if (binPath) {
      this.binPath = binPath;
    }
  }

  async getMkcert() {
    if (!this.mkcert) {
      this.mkcert = new Mkcert(this.binPath, this.version);
    }

    return this.mkcert;
  }

  async install(host: string | string[], certFile?: string, keyFile?: string) {
    const mkcert = await this.getMkcert();
    await ensureDir(this.defaultPath);

    const hosts = Array.isArray(host) ? host : [host];
    if (hosts.length <= 0) {
      return null;
    }

    const files = MkcertWrapper.resolveFileNames(hosts);

    const certFilePath = certFile ?? join(this.defaultPath, files.certFile);
    const keyFilePath = keyFile ?? join(this.defaultPath, files.keyFile);
    const commands = [
      '-install',
      `-cert-file=${certFilePath}`,
      `-key-file=${keyFilePath}`,
    ];

    commands.push(...hosts);

    try {
      const env = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CAROOT: this.defaultPath,
      };
      const result = await mkcert.exec(commands, { env });
      if (!result.failed) {
        return {
          certFile: certFilePath,
          keyFile: keyFilePath,
          caFile: join(this.defaultPath, 'rootCA.pem'),
        };
      }
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }

  async uninstall() {
    throw new Error('Not implemented');
  }
}

export { MkcertWrapper as Mkcert };

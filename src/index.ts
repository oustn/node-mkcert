import { homedir } from 'os'
import { join } from 'path'
import { ensureDir } from 'fs-extra'
import { Mkcert } from './mkcert';

interface Option {
  version?: string
  binPath?: string
}

const BASE = '.node-mkcert'

class MkcertWrapper {
  private mkcert?: Mkcert
  private version = 'latest'
  private defaultPath = join(homedir(), BASE)
  private binPath = this.defaultPath

  constructor(option: Option = {}) {
    const { version, binPath } = option
    if (version) {
      this.version = version
    }
    if (binPath) {
      this.binPath = binPath
    }
  }

  async getMkcert() {
    if (!this.mkcert) {
      this.mkcert = new Mkcert(this.binPath, this.version)
    }
    return this.mkcert
  }

  async install(host: string | Array<string>, certFile?:string, keyFile?:string) {
    const mkcert = await this.getMkcert()
    await ensureDir(this.defaultPath)

    const hosts = Array.isArray(host) ? host : [host]
    if (hosts.length <= 0) {
      return null
    }

    const files = MkcertWrapper.resolveFileNames(hosts)

    const certFilePath = certFile || join(this.defaultPath, files.certFile)
    const keyFilePath = keyFile || join(this.defaultPath, files.keyFile)
    const commands = [
      '-install',
      `-cert-file=${certFilePath}`,
      `-key-file=${keyFilePath}`,
    ]

    commands.push(...hosts)

    try {
      const env = {
        CAROOT: this.defaultPath,
      }
      const result = await mkcert.exec(commands, { env })
      if (!result.failed) {
        return {
          certFile: certFilePath,
          keyFile: keyFilePath,
          caFile: join(this.defaultPath, 'rootCA.pem'),
        }
      }
    } catch (e: unknown) {
      throw new Error((e as Error).message)
    }
  }

  async uninstall() {}

  private static resolveFileNames(hosts: Array<string>) {
    let defaultName = hosts[0].replace(/(:|\*)/g, replace => replace === ':' ? '_' : '_wildcard')
    if (hosts.length > 1) {
      defaultName = `${defaultName}+${hosts.length - 1}`
    }
    // todo
    // https://github.com/FiloSottile/mkcert/blob/2a46726cebac0ff4e1f133d90b4e4c42f1edf44a/cert.go#L176
    return {
      certFile: `${defaultName}.pem`,
      keyFile: `${defaultName}-key.pem`,
    }
  }
}

export {
  MkcertWrapper as Mkcert,
}

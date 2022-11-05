import {ensureDir, readdir, chmod} from 'fs-extra'
import { parse } from 'semver'
import { join } from 'path'

import {createSource, BaseSource} from './srouces'
import { Bin } from './base-bin'

class MkcertBin extends Bin{
  private readonly mkcertBinPath: string

  private readonly mkcertTargetName: string

  private readonly version: string

  private source: BaseSource

  constructor(mkcertBinPath: string, version: string = 'latest', source: string = 'github') {
    super()
    this.mkcertBinPath = mkcertBinPath
    this.version = version
    this.source = createSource(source)
    this.mkcertTargetName = this.resolveMkcertTargetName()
  }

  async getMkcertBin(): Promise<string> {
    await ensureDir(this.mkcertBinPath)

    const files = await readdir(this.mkcertBinPath)

    if (files.length > 0) {
      const versions = files.map(filename => {
        const cleanFilename = filename.replace(/mkcert-/, '')
          .replace(new RegExp(`-${this.mkcertTargetName}`), '')
        return {
          filename,
          version: parse(cleanFilename),
        }
      })
        .filter(d => d.version)
        .sort((a, b) => b.version!.compare(a.version!))

      console.log(this.version)
      if (this.version) {
        const satisfy = versions.find(d => d.version!.version === this.version)
        if (satisfy) {
          return join(this.mkcertBinPath, satisfy.filename)
        }
        if (this.version === 'latest') {
          return join(this.mkcertBinPath, versions[0].filename)
        }
      } else {
        return join(this.mkcertBinPath, versions[0].filename)
      }
    }

    const mkcert = await this.source.getRelease(this.version, this.mkcertTargetName)

    if (!mkcert) {
      throw new Error(`Failed to download mkcert binary for version '${this.version}' with target '${this.mkcertTargetName}'`)
    }

    await this.source.download(mkcert, this.mkcertBinPath)

    const file = join(this.mkcertBinPath, mkcert.name)

    await chmod(file, 755)

    return file
  }
}

export {
  MkcertBin,
}

import { join } from 'path'
import { DownloaderHelper } from 'node-downloader-helper';

interface Release {
  name: string
  version: string
  date: string
  url: string
}

abstract class BaseSource {
  private retryDownload = false
  
  abstract getRelease(version: string, target: string): Promise<Release | null>

  abstract getLatestRelease(target: string): Promise<Release | null>;

  async download(release: Release, installDir: string): Promise<any> {
    const {name, url} = release
    if (!name || !url) {
      throw new Error('Invalid release')
    }

    try {
      const dl = new DownloaderHelper(url, installDir, {
        fileName: name,
      })

      dl.on('error', () => {
        dl.stop()
        return this.retryDownloadWithCDN(release, installDir)
      })
      // github.bz2.club cdn

      return dl.start()
    } catch (e) {
      return this.retryDownloadWithCDN(release, installDir)
    }
  }
  
  private retryDownloadWithCDN(release: Release, installDir: string) {
    if (this.retryDownload) {
      throw new Error(`Download mkcert failed: ${release.url}
Maybe you can try to download it manually and put it in "${installDir}" or retry later.`)
    }
    this.retryDownload = true
    
    return this.download({
      ...release,
      url: `https://github.bz2.club/${release.url}`,
    }, installDir)
  }
}

export {
  BaseSource,
  Release,
}

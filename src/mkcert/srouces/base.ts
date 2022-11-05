import { join } from 'node:path';
import { DownloaderHelper } from 'node-downloader-helper';

type Release = {
  name: string;
  version: string;
  date: string;
  url: string;
};

abstract class BaseSource {
  private retryDownload = false;

  async download(release: Release, installDir: string): Promise<any> {
    const { name, url } = release;
    if (!name || !url) {
      throw new Error('Invalid release');
    }

    try {
      const dl = new DownloaderHelper(url, installDir, {
        fileName: name,
      });

      dl.on('error', async () => {
        await dl.stop();
        return this.retryDownloadWithCdn(release, installDir);
      });
      // Github.bz2.club cdn

      return await dl.start();
    } catch {
      return this.retryDownloadWithCdn(release, installDir);
    }
  }

  abstract getRelease(
    version: string,
    target: string,
  ): Promise<Release | undefined>;

  abstract getLatestRelease(target: string): Promise<Release | undefined>;

  private async retryDownloadWithCdn(release: Release, installDir: string) {
    if (this.retryDownload) {
      throw new Error(`Download mkcert failed: ${release.url}
Maybe you can try to download it manually and put it in "${installDir}" or retry later.`);
    }

    this.retryDownload = true;

    return this.download(
      {
        ...release,
        url: `https://github.bz2.club/${release.url}`,
      },
      installDir,
    );
  }
}

export { BaseSource, type Release };

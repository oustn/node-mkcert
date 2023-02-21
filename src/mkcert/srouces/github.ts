import { basename } from 'node:path';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import { Octokit } from '@octokit/rest';
import type { Release } from './base';
import { BaseSource } from './base';

class GithubSource extends BaseSource {
  private readonly octokit: Octokit;

  constructor() {
    super();
    this.octokit = new Octokit({
    });
  }

  async getRelease(
    version: string,
    target: string,
  ): Promise<Release | undefined> {
    if (!version || version === 'latest') {
      return this.getLatestRelease(target);
    }

    const formatVersion = version.startsWith('v') ? version : `v${version}`;
    try {
      const { data } = await this.octokit.repos.getReleaseByTag({
        owner: 'FiloSottile',
        repo: 'mkcert',
        tag: formatVersion,
      });

      if (!data) {
        return await this.getLatestRelease(target);
      }

      return this.genRelease(data, target);
    } catch (error: unknown) {
      const { status } = error as Response;
      if (status === 404) {
        return this.getLatestRelease(target);
      }

      throw new Error(`Failed to get release for version '${version}'`);
    }
  }

  async getLatestRelease(target: string): Promise<Release | undefined> {
    const { data } = await this.octokit.repos.getLatestRelease({
      owner: 'FiloSottile',
      repo: 'mkcert',
    });

    return this.genRelease(data, target);
  }

  private genRelease(
    data: RestEndpointMethodTypes['repos']['getLatestRelease']['response']['data'],
    target: string,
  ): Release | undefined {
    if (!data || !data.tag_name) return;

    const downloadUrl = data.assets.find((item: any) =>
      item.name.includes(target),
    )?.browser_download_url;

    if (!downloadUrl) {
      throw new Error(
        `Failed to download mkcert binary for latest version with target '${target}'`,
      );
    }

    return {
      name: basename(downloadUrl),
      version: data.tag_name,
      url: downloadUrl,
      date: data.published_at ?? '',
    };
  }
}

export { GithubSource };

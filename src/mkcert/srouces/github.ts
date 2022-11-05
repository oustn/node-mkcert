import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'
import { basename } from 'path'
import { BaseSource, Release} from './base'

class GithubSource extends BaseSource {
    private octokit: Octokit;

    constructor() {
        super()
        this.octokit = new Octokit({
            auth: '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'
        });
    }

    async getRelease(version: string, target: string): Promise<Release | null> {
        if (!version || version === 'latest') {
            return this.getLatestRelease(target)
        }

        const formatVersion = version.startsWith('v') ? version : `v${version}`
        try {
            const { data } = await this.octokit.repos.getReleaseByTag({
                owner: 'FiloSottile',
                repo: 'mkcert',
                tag: formatVersion,
            })

            if (!data) {
                return this.getLatestRelease(target)
            }

            return this.genRelease(data, target)
        } catch (e) {
            const { status } = e as Response
            if (status === 404) {
                return this.getLatestRelease(target)
            }
            throw new Error(`Failed to get release for version '${version}'`)
        }
    }

    async getLatestRelease(target: string): Promise<Release | null> {
        const { data } = await this.octokit.repos.getLatestRelease({
            owner: 'FiloSottile',
            repo: 'mkcert'
        })

        return this.genRelease(data, target)
    }

    private genRelease(data: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]["data"], target: string): Release | null {
        if (!data || !data.tag_name) return null

        const downloadUrl = data.assets.find(item =>
          item.name.includes(target)
        )?.browser_download_url

        if (!downloadUrl) {
            throw new Error()
            throw new Error(`Failed to download mkcert binary for latest version with target '${target}'`)
        }

        return {
            name: basename(downloadUrl),
            version: data.tag_name,
            url: downloadUrl,
            date: data.published_at || ''
        }
    }
}

export {
    GithubSource,
}

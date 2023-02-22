import {BaseSource, Release} from "./base";

class OssSource extends BaseSource {
  getLatestRelease(target: string): Promise<Release | undefined> {
    return Promise.resolve({
      name: `mkcert-v1.4.4-${target}`,
      version: '1.4.4',
      date: Date(),
      url: `https://pureui-static.oss-cn-hangzhou.aliyuncs.com/paas-component-custom/mkcerts/mkcert-v1.4.4-${target}`
    });
  }

  getRelease(version: string, target: string): Promise<Release | undefined> {
    return this.getLatestRelease(target)
  }
}

export { OssSource }

import { existsSync } from 'fs-extra';

export abstract class Truststore {
  protected verifyFile(file: string) {
    return existsSync(file)
  }

  async install(file: string) {
    if (this.verifyFile(file)) {
      return this.installPlatform(file);
    }
    return false;
  }

  async uninstall(file: string) {
    if (this.verifyFile(file)) {
      return this.uninstallPlatform(file);
    }
    return false;
  }

  async verifyTrusted(file: string) {
    if (this.verifyFile(file)) {
      return this.verifyTrustedPlatform(file);
    }
    return false;
  }

  abstract installPlatform(file: string): Promise<boolean>

  abstract uninstallPlatform(file: string): Promise<boolean>

  abstract verifyTrustedPlatform(file: string): Promise<boolean>
}

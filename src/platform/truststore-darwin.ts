import debug from 'debug';
import {Truststore} from "./truststore";
import {silentCommand, commandWithSudo} from '../utils/cmd';

export class TruststoreDarwin extends Truststore {
  async installPlatform(file: string): Promise<boolean> {
    try {
      const {stdout} = await commandWithSudo(
        "security", 'add-trusted-cert',
        '-d', '-r', 'trustRoot',
        '-k', '/Library/Keychains/System.keychain', file);

      debug('node-mkcert')('install root ca', stdout);
      return true
    } catch (e) {
      debug('node-mkcert')('install root ca', e);
      return false
    }
  }

  async uninstallPlatform(file: string): Promise<boolean> {
    try {
      const {stdout} = await commandWithSudo(
        "security", 'remove-trusted-cert',
        '-d', file,
      )
      debug('node-mkcert')('uninstall root ca', stdout);
      return true
    } catch (e) {
      debug('node-mkcert')('uninstall root ca', e);
      return false
    }
  }

  async verifyTrustedPlatform(file: string): Promise<boolean> {
    return silentCommand("security", 'verify-cert', '-c', file)
  }
}

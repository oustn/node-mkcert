import {env, platform} from "node:process";
import {homedir, userInfo, hostname} from "node:os";
import {posix} from "node:path";

import {pki, random, util, md} from 'node-forge';
import {config} from "./config";
import {ensureDir, existsSync, writeFile, readFile} from "fs-extra";
import {TruststoreDarwin} from "./platform";

class Cert {
  private CAROOT: string = Cert.getCAROOT();

  private caCert?: pki.Certificate;

  private caKey?: pki.rsa.PrivateKey;

  private ignoreCheckFailure?: boolean;

  private truststore = new TruststoreDarwin()

  private get CARootFile() {
    return posix.join(this.CAROOT, config.rootName);
  }

  private get CARootKeyFile() {
    return posix.join(this.CAROOT, config.rootKeyName);
  }

  constructor(
    private readonly installMode: boolean,
    private readonly uninstallMode: boolean,
    private readonly csrPath: string,
    private readonly pkcs12: boolean,
    private readonly ecdsa: boolean,
    private readonly client: boolean,
    private readonly certFile: string,
    private readonly keyFile: string,
    private readonly p12File: string,
  ) {
  }

  async run(hosts: string[] = []) {
    if (!this.CAROOT) {
      throw new Error('ERROR: failed to find the default CA location, set one as the CAROOT env var');
    }
    try {
      await ensureDir(this.CAROOT, 0o755);
    } catch (e) {
      throw new Error(`ERROR: failed to create the CAROOT: ${this.CAROOT}`);
    }

    await this.loadCA();

    if (this.installMode) {
      await this.install()
    }
  }

  private async loadCA() {
    if (!existsSync(this.CARootFile)) {
      await this.newCA()
      return
    }
    const pemCert = await readFile(this.CARootFile, 'utf-8');
    try {
      this.caCert = pki.certificateFromPem(pemCert);
    } catch (e) {
      throw new Error(`ERROR: failed to parse the CA certificate: ${this.CARootFile}`);
    }

    if (!existsSync(this.CARootKeyFile)) {
      return
    }
    const pemKey = await readFile(this.CARootKeyFile, 'utf-8');
    try {
      this.caKey = pki.privateKeyFromPem(pemKey);
    } catch (e) {
      throw new Error(`ERROR: failed to parse the CA key: ${this.CARootKeyFile}`);
    }
  }

  private async newCA() {
    let keypair
    try {
      keypair = await this.generateKeyPair(true);
    } catch (e) {
      throw new Error('ERROR: failed to generate the CA keypair');
    }

    const cert = pki.createCertificate();
    cert.publicKey = keypair.publicKey;
    cert.serialNumber = Cert.randomSerialNumber();

    const limitDate = Cert.getLimitDate();
    cert.validity.notBefore = limitDate.notBefore;
    cert.validity.notAfter = limitDate.notAfter;
    cert.setSubject(Cert.caAttrs);
    cert.setIssuer(Cert.caAttrs);
    cert.setExtensions(Cert.caExtensions);
    cert.sign(keypair.privateKey, md.sha256.create());

    await Promise.all([
      writeFile(this.CARootFile, pki.certificateToPem(cert)),
      writeFile(this.CARootKeyFile, pki.privateKeyToPem(keypair.privateKey)),
    ])
    this.caCert = cert;
    this.caKey = keypair.privateKey;
  }

  private async generateKeyPair(rootCA: boolean) {
    if (this.ecdsa) {
      throw new Error(`ERROR: ECDSA is not supported yet, see: https://github.com/digitalbazaar/forge/pull/925`);
    }

    const bits = rootCA ? 3072 : 2048;

    return new Promise<pki.rsa.KeyPair>((resolve, reject) => {
      pki.rsa.generateKeyPair({bits, workers: 2}, (err, keypair) => {
        if (err) {
          reject(err);
        } else {
          resolve(keypair);
        }
      });
    })
  }

  private async install() {
    if (Cert.storeEnabled('system')) {
      await this.installSystem();
    }
  }

  private async installSystem() {
    if (await this.checkPlatform()) {
      console.log('The local CA is already installed in the system trust store! 👍')
      return
    }
    if (await this.truststore.installPlatform(this.CARootFile)) {
      console.log('The local CA is now installed in the system trust store! ⚡️')
    }
    this.ignoreCheckFailure = true;
  }

  private checkPlatform() {
    if (this.ignoreCheckFailure) {
      return true
    }
    // verify certificate
    return this.truststore.verifyTrusted(this.CARootFile);
  }

  private static getCAROOT() {
    if (env && env.CAROOT) {
      return env.CAROOT
    }

    let dir = '';

    switch (platform) {
      case 'win32':
        dir = env.LOCALAPPDATA || env.LocalAppData || '';
        break;
      case 'darwin': {
        const home = env.HOME || '';
        if (home) {
          dir = posix.join(home, 'Library', 'Application Support');
        }
        break;
      }
      default: {
        const home = env.HOME || '';
        if (home) {
          dir = posix.join(home, '.local', 'share');
        }
      }
    }

    if (!dir && env.XDG_DATA_HOME) {
      dir = env.XDG_DATA_HOME;
    }

    if (!dir) {
      dir = homedir();
    }

    return posix.join(dir, config.base)
  }

  private static randomSerialNumber() {
    return util.bytesToHex(random.getBytesSync(16));
  }

  private static get userAndHostname() {
    const user = userInfo().username || 'node-mkcert';
    const host = hostname() || 'node-mkcert.org';
    return `${user}@${host}`;
  }

  private static get caAttrs(): pki.CertificateField[] {
    return [
      {
        name: 'commonName',
        value: `node-mkcert ${Cert.userAndHostname}`,
      },
      {
        name: 'organizationName',
        value: 'node-mkcert development CA'
      },
      {
        shortName: 'OU',
        value: Cert.userAndHostname,
      }
    ]
  }

  private static get caExtensions() {
    return [
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
      },
      {
        name: 'nsCertType',
        client: true,
        server: true,
        email: true,
        objsign: true,
        sslCA: true,
        emailCA: true,
        objCA: true
      },
      {
        name: 'subjectAltName',
        altNames: [{
          type: 6, // URI
          value: 'https://example.org/webid#me'
        }, {
          type: 7, // IP
          ip: '127.0.0.1'
        }]
      },
      {
        name: 'subjectKeyIdentifier'
      }
    ]
  }

  private static getLimitDate(shortPeriod = false) {
    const oneDay = 1000 * 60 * 60 * 24;
    const minDate = oneDay * 20;
    const date = new Date();
    const year = date.getFullYear();
    const notBefore = shortPeriod ? new Date(date.getTime() - minDate)
      : new Date(new Date().setFullYear(year - 1));
    const notAfter = new Date((new Date()).setFullYear(year + (shortPeriod ? 1 : 10)));

    return {
      notBefore,
      notAfter,
    }
  }

  private static storeEnabled(name: string) {
    const stores = env.TRUST_STORES || '';
    if (stores === '') {
      return true
    }
    return stores.split(',').includes(name);
  }
}

(async () => {
  const cert = new Cert(true, false, '', false, false, false, '', '', '',)
  await cert.run()
})()

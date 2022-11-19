import {pki, md} from 'node-forge';
import {Attributes, RootCA} from '@/types'

const bits = 2048;
const oneDay = 1000 * 60 * 60 * 24;
const minDate = oneDay * 20;

function getLimitDate(shortPeriod = false) {
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

function getRandom() {
  const random = Math.floor(Math.random() * 1000);
  if (random < 10) {
    return `00${random}`;
  }
  if (random < 100) {
    return `0${random}`;
  }
  return `${random}`;
}

function getAttrs(attributes: Attributes) {
  const random = getRandom()

  return [
    {
      name: 'commonName',
      value: attributes.commonName ?? `node-mkcert.${random}`
    }, {
      name: 'countryName',
      value: attributes.countryName ?? 'CN'
    }, {
      shortName: 'ST',
      value: attributes.ST ?? 'GZ'
    }, {
      name: 'localityName',
      value: attributes.localityName ?? 'SZ'
    }, {
      name: 'organizationName',
      value: attributes.organizationName ?? `${random}.node-mkcert.org`
    }, {
      shortName: 'OU',
      value: attributes.OU ?? 'node-mkcert.org'
    }
  ]
}

function createRootCa(
  attributes: Attributes = {},
  serialNumber = '01',
  shortPeriod = false
): RootCA {
  const cert = pki.createCertificate();
  const keys = pki.rsa.generateKeyPair(bits);
  cert.publicKey = keys.publicKey;
  cert.serialNumber = serialNumber;
  const {notAfter, notBefore} = getLimitDate(shortPeriod);
  cert.validity.notBefore = notBefore;
  cert.validity.notAfter = notAfter;

  const attrs = getAttrs(attributes)
  cert.setSubject(attrs)
  cert.setIssuer(attrs)

  cert.setExtensions([
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
      /* eslint-disable @typescript-eslint/naming-convention */
      sslCA: true,
      /* eslint-disable @typescript-eslint/naming-convention */
      emailCA: true,
      /* eslint-disable @typescript-eslint/naming-convention */
      objCA: true
    }
  ]);

  cert.sign(keys.privateKey, md.sha256.create());

  return {
    key: keys.privateKey,
    cert,
  }
}

export {
  createRootCa,
}

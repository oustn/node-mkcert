import {pki} from 'node-forge';

export type ObjectEntry<T> = [
  keyof T,
  T[keyof T]
];

type Required<T> = {
  [P in keyof T]-?: T[P]
}

export interface Options {
  install?: boolean;
  uninstall?: boolean;
  certFile?: string;
  keyFile?: string;
  p12File?: string;
  client?: boolean;
  ecdsa?: boolean;
  pkcs12?: boolean;
  csr?: string;
  CAROOT?: boolean;
}

export type OptionsRequired = Required<Options>;

export interface Attributes {
  commonName?: string;
  countryName?: string;
  ST?: string;
  localityName?: string;
  organizationName?: string;
  OU?: string;
}

export interface RootCA {
  key: pki.rsa.PrivateKey;
  cert: pki.Certificate;
}

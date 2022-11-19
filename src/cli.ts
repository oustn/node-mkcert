#!/usr/bin/env node

import { program } from 'commander';

import handler  from './handler-cli'

program.name('node-mkcert')
  .description(`A simple zero-config tool to make locally trusted development certificates with any names you'd like.`)
  .version('0.0.1')
  .argument('[host...]', 'Hosts to generate a certificate for')
  .option('--install', 'Install the local CA in the system trust store.')
  .option('--uninstall', 'Uninstall the local CA (but do not delete it).')
  .option('--cert-file <certFile>', 'Customize the output paths for the certificate file.')
  .option('--key-file <keyFile>', 'Customize the output paths for the private key file.')
  .option('--p12-file <p12File>', 'Customize the output paths for the PKCS#12 file.')
  .option('--client', 'Generate a certificate for client authentication.')
  .option('--ecdsa', 'Generate a certificate with an ECDSA key.')
  .option('--pkcs12', 'Generate a ".p12" PKCS #12 file, also know as a ".pfx" file,\ncontaining certificate and key for legacy applications.')
  .option('--csr <csr>', 'Generate a certificate based on the supplied CSR.\nConflicts with all other flags and arguments except -install and -cert-file.')
  .option('--CAROOT', 'Print the CA certificate and key storage location.')
  .action(handler);

program.addHelpText('afterAll', `
Example call:

$ node-mkcert --install
Install the local CA in the system trust store.

$ node-mkcert example.org
Generate "example.org.pem" and "example.org-key.pem".

$ node-mkcert example.com myapp.dev localhost 127.0.0.1 ::1
Generate "example.com+4.pem" and "example.com+4-key.pem".

$ node-mkcert "*.example.it"
Generate "_wildcard.example.it.pem" and "_wildcard.example.it-key.pem".

$ node-mkcert -uninstall
Uninstall the local CA (but do not delete it).
`)

program.parse();

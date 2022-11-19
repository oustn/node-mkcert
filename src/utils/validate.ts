import {Options} from "@/types";

function validate(hosts: string[], options: Options) {
  const {
    install,
    uninstall,
    CAROOT,
    csr,
    pkcs12,
    ecdsa,
    client,
  } = options

  if (CAROOT && (install ?? uninstall)) {
    throw new Error('ERROR: you can\'t set --[un]install and -CAROOT at the same time')
  }

  if (install && uninstall) {
    throw new Error('ERROR: you can\'t set --install and --uninstall at the same time');
  }

  if (csr !== '' && (pkcs12 ?? ecdsa ?? client)) {
    throw new Error('ERROR: can only combine --csr with --install and --cert-file')
  }

  if (csr !== '' && hosts.length) {
    throw new Error('ERROR: can\'t specify extra arguments when using --csr')
  }
}

export default validate

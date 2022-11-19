import {Options} from "./types";
import {getOption} from "./utils/get-option";
import {getCARoot, Mkcert} from './index'
import validate from "@/utils/validate";

export default async function (hosts: string[], options: Options) {
  const parsedOptions = getOption(options);

  try {
    validate(hosts, parsedOptions)
  } catch (e: unknown) {
    console.log((e as Error).message)
    process.exit(1)
  }

  // get ca root
  if (parsedOptions.CAROOT) {
    console.log(getCARoot())
    process.exit(0)
  }

  const mkcert = new Mkcert(
    parsedOptions.install,
    parsedOptions.uninstall,
    parsedOptions.csr,
    parsedOptions.pkcs12,
    parsedOptions.ecdsa,
    parsedOptions.client,
    parsedOptions.certFile,
    parsedOptions.keyFile,
    parsedOptions.p12File,
  )

  await mkcert.sign(hosts)
}

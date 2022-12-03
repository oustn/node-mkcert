import {validate} from 'schema-utils';
import {Options, ObjectEntry, OptionsRequired} from "../types";
import schema from './schema.json';
import {JSONSchema7} from "schema-utils/declarations/validate";

const defaultOptions: OptionsRequired = {
  install: false,
  uninstall: false,
  certFile: '',
  keyFile: '',
  p12File: '',
  client: false,
  ecdsa: false,
  pkcs12: false,
  csr: '',
  CAROOT: false,
}

function getOption(options: Options): OptionsRequired {
  validate(schema as unknown as JSONSchema7, options, {
    name: 'node-mkckert',
  });

  const entries = Object.entries(defaultOptions) as ObjectEntry<Options>[]

  return entries.reduce((acc: Options, [key, defaultValue]) => {
    return {
      ...acc,
      [key]: options[key] ?? defaultValue
    }
  }, {}) as OptionsRequired
}

export {
  getOption,
}

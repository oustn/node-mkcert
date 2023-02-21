import type { BaseSource } from './base';
import { GithubSource } from './github';
import { OssSource } from './oss'

function createSource(source: string): BaseSource {
  return new OssSource();
}

export { createSource };

export type { Release } from './base';

export { BaseSource } from './base';

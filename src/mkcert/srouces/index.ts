import type { BaseSource } from './base';
import { GithubSource } from './github';

function createSource(source: string): BaseSource {
  return new GithubSource();
}

export { createSource };

export type { Release } from './base';

export { BaseSource } from './base';

import {BaseSource, Release} from './base'
import {GithubSource} from './github'

function createSource(source: string): BaseSource {
  return new GithubSource()
}


export {
  createSource,
  BaseSource,
  Release,
}

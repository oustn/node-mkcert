import test from 'ava';

import { Mkcert } from '@/index';

test('Mkcert Create success', async (t) => {
  const mkcert = new Mkcert()
  await mkcert.install('localhost')
  t.pass()
})

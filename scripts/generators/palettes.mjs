/** The 28 palettes, extracted from the design canvas so nobody retypes a hex. */
import { palettes } from '../palettes.mjs';

export const name = 'palettes';

export const pkg = {
  exports: { './palettes.json': './palettes.json' },
  files: ['palettes.json'],
};

export async function artifacts() {
  return new Map([['palettes.json', JSON.stringify(await palettes(), null, 2) + '\n']]);
}

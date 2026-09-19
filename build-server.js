import * as esbuild from 'esbuild';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const externals = Object.keys(pkg.dependencies || {}).filter(dep => dep !== 'adhan');

await esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  external: externals,
  sourcemap: true,
  outfile: 'dist/server.cjs',
});

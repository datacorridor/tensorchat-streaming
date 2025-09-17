import typescript from 'rollup-plugin-typescript2';
import * as ts from 'typescript';

export default {
  input: 'src/index.ts',
  external: ['react'],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'es'
    }
  ],
  plugins: [
    typescript({
      typescript: ts,
      useTsconfigDeclarationDir: true
    })
  ]
};
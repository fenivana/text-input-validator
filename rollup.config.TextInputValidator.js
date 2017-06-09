import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/TextInputValidator.js',
  plugins: [
    babel()
  ],
  format: 'umd',
  moduleName: 'TextInputValidator',
  dest: 'TextInputValidator.js'
}

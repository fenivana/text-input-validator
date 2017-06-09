import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/Core.js',
  plugins: [
    babel()
  ],
  format: 'umd',
  moduleName: 'Core',
  dest: 'Core.js'
}

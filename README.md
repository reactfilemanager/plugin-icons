### usage

 Webpack loader rule
```javascript
{
  test: /\.jsx?$/,
  loader: 'babel-loader',
  query: {presets: ['@babel/react'], plugins: ['@babel/plugin-proposal-class-properties']},
  include: [fs.realpathSync(path.resolve(__dirname, './node_modules/@reactfilemanager'))],
}
```

const fs = require('fs');
const R = require('ramda');

module.exports = ({ config }) => {
  const mdxRule = R.pipe(
    R.find(r => `${r.test}` === '/\\.(mjs|jsx?)$/'),
    R.evolve({
      test: R.always(/\.mdx$/),
      use: R.append('@mdx-js/loader'),
    }),
    R.tap(console.log),
  )(config.module.rules);

  config.module.rules.push(
    {
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('awesome-typescript-loader'),
          // options: {
          //   errorsAsWarnings: true,
          // },
        },
        // Optional
        {
          loader: require.resolve('react-docgen-typescript-loader'),
        },
      ],
    },
    mdxRule,
  );

  config.resolve.extensions.push('.ts', '.tsx');

  fs.writeFileSync(
    '.storybook/webpack.config.debug.json',
    JSON.stringify(
      config,
      (key, value) => {
        if (value instanceof RegExp) {
          return `${value}`;
        }

        if (value === null) {
          return null;
        }

        if (['number', 'string', 'boolean', 'object'].includes(typeof value)) {
          return value;
        }

        if (typeof value === 'function') {
          return '(Function)';
        }

        return undefined;
      },
      2,
    ),
  );

  return config;
};

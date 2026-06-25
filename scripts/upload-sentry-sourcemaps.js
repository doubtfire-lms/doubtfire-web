const {execFileSync} = require('node:child_process');

const requiredEnvironment = [
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SENTRY_RELEASE',
  'SENTRY_DIST',
];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length > 0) {
  console.log(
    `Skipping Sentry sourcemap upload because ${missingEnvironment.join(', ')} ${
      missingEnvironment.length === 1 ? 'is' : 'are'
    } not set.`,
  );
  process.exit(0);
}

const sentryArgs = ['--org', process.env.SENTRY_ORG, '--project', process.env.SENTRY_PROJECT];
const releaseArgs = ['--release', process.env.SENTRY_RELEASE];
const distArgs = ['--dist', process.env.SENTRY_DIST];
const distPath = './dist/browser';

execFileSync('sentry-cli', ['sourcemaps', 'inject', ...sentryArgs, ...releaseArgs, distPath], {
  stdio: 'inherit',
});
execFileSync(
  'sentry-cli',
  ['sourcemaps', 'upload', ...sentryArgs, ...releaseArgs, ...distArgs, distPath],
  {
    stdio: 'inherit',
  },
);

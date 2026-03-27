module.exports = [
  {
    script: '.',
    name: 'api',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      IS_BACKGROUND: 'false',
    },
  },
  {
    script: '.',
    name: 'api',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      IS_BACKGROUND: 'true',
    },
  },
];

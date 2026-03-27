module.exports = {
  extends: '@loopback/eslint-config',
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/no-invalid-this': 'off',
    'no-empty': 'off',
  }
};

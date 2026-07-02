export default {
  // TypeScript/JavaScript 文件
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // JSON 文件
  '**/*.json': ['prettier --write'],

  // Markdown 文件
  '**/*.md': ['prettier --write'],

  // CSS/SCSS 文件
  '**/*.{css,scss,less}': ['prettier --write'],

  // YAML 文件
  '**/*.{yml,yaml}': ['prettier --write'],
};

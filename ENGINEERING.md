# Puff Monorepo 工程化配置文档

本项目已配置完整的前端工程化工具链，包括代码检查、格式化、Git Hooks 等。

## 📦 已安装的工具

### 1. ESLint - 代码检查

- ✅ 支持 TypeScript
- ✅ 支持 React/React Hooks
- ✅ 集成 Prettier 配置
- ✅ 自动修复功能

### 2. Prettier - 代码格式化

- ✅ 统一代码风格
- ✅ 支持多种文件类型
- ✅ 保存时自动格式化（VS Code）

### 3. Husky - Git Hooks

- ✅ pre-commit: 提交前代码检查和格式化
- ✅ commit-msg: 提交信息规范检查

### 4. Commitlint - 提交信息规范

- ✅ 基于 Conventional Commits 规范
- ✅ 自动验证提交信息格式

### 5. lint-staged - 暂存文件检查

- ✅ 只检查 Git 暂存区的文件
- ✅ 提高检查效率

### 6. Commitizen - 交互式提交

- ✅ 通过交互式命令生成规范的提交信息
- ✅ 支持 pnpm commit 命令

## 🚀 使用指南

### 代码检查

```bash
# 检查所有代码
pnpm lint

# 自动修复可修复的问题
pnpm lint:fix
```

### 代码格式化

```bash
# 格式化所有代码
pnpm format

# 检查格式是否符合规范（不修改文件）
pnpm format:check
```

### Git 提交

#### 方式 1: 使用交互式提交（推荐）

```bash
# 添加文件到暂存区
git add .

# 使用交互式命令提交
pnpm commit

# 按照提示选择：
# 1. 选择提交类型（feat, fix, docs 等）
# 2. 输入影响范围（可选）
# 3. 输入简短描述
# 4. 输入详细描述（可选）
# 5. 是否有 Breaking Changes（可选）
# 6. 是否关联 Issue（可选）
```

#### 方式 2: 直接提交

```bash
git add .
git commit -m "feat: 添加新功能"
```

### 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

| 类型     | 说明                   |
| -------- | ---------------------- |
| feat     | 新功能                 |
| fix      | 修复 bug               |
| docs     | 文档变更               |
| style    | 代码格式（不影响功能） |
| refactor | 重构                   |
| perf     | 性能优化               |
| test     | 增加测试               |
| build    | 构建系统或依赖变动     |
| ci       | CI 配置变动            |
| chore    | 其他改动               |
| revert   | 回退                   |

#### 示例

```bash
# 新功能
git commit -m "feat(auth): 添加用户登录功能"

# 修复 bug
git commit -m "fix(api): 修复接口超时问题"

# 文档更新
git commit -m "docs: 更新 README"

# 代码格式
git commit -m "style: 统一代码缩进"

# 重构
git commit -m "refactor(utils): 优化日期处理函数"

# 性能优化
git commit -m "perf: 优化列表渲染性能"

# 测试
git commit -m "test: 添加用户模块单元测试"
```

## 🔧 配置文件说明

### eslint.config.js

ESLint 9.x 的配置文件（新版扁平化配置）。

主要配置：

- JavaScript/TypeScript 规则
- React/React Hooks 规则
- 与 Prettier 集成
- 自定义规则

### commitlint.config.js

Commitlint 配置文件。

定义了：

- 提交类型枚举
- 提交信息格式规则
- 最大长度限制

### .lintstagedrc.js

lint-staged 配置文件。

定义了对不同文件类型的处理：

- `.ts/.tsx/.js/.jsx` → ESLint + Prettier
- `.json/.md/.css/.yml` → Prettier

### .husky/

Git Hooks 目录。

包含：

- `pre-commit`: 提交前运行 lint-staged
- `commit-msg`: 检查提交信息格式

### .prettierrc

Prettier 配置文件。

代码风格：

- 单引号
- 分号
- 2 空格缩进
- 100 字符换行

### .editorconfig

编辑器配置文件。

统一不同编辑器的行为：

- 字符集: UTF-8
- 换行符: LF
- 缩进: 2 空格
- 自动插入最终换行

### .vscode/

VS Code 配置目录。

- `settings.json`: 编辑器设置
  - 保存时自动格式化
  - ESLint 自动修复
- `extensions.json`: 推荐扩展
  - Prettier
  - ESLint
  - EditorConfig

## 🎯 工作流程

### 开发时

1. **编写代码**: VS Code 会自动提示 ESLint 错误
2. **保存文件**: 自动运行 Prettier 格式化
3. **手动检查**: 运行 `pnpm lint` 和 `pnpm format:check`

### 提交时

1. **暂存文件**: `git add .`
2. **pre-commit Hook 自动运行**:
   - 对暂存的文件运行 ESLint
   - 自动格式化代码
   - 如果有错误，提交会被中止
3. **使用交互式提交**: `pnpm commit`
4. **commit-msg Hook 自动运行**:
   - 验证提交信息格式
   - 如果不符合规范，提交会被中止

## 🛠️ 常见问题

### Q: ESLint 检查失败怎么办？

A:

1. 查看错误信息，了解具体问题
2. 运行 `pnpm lint:fix` 自动修复
3. 手动修复无法自动修复的问题

### Q: 提交信息不符合规范怎么办？

A:

1. 使用 `pnpm commit` 交互式提交
2. 或按照 Conventional Commits 规范手动编写
3. 提交信息必须是 `type: subject` 格式

### Q: 如何跳过 Git Hooks？

A:
**不推荐！** 但在紧急情况下可以使用：

```bash
git commit -m "fix: 紧急修复" --no-verify
```

### Q: 如何为特定文件禁用 ESLint？

A:

```javascript
/* eslint-disable */
// 你的代码
/* eslint-enable */

// 或禁用特定规则
/* eslint-disable-next-line no-console */
console.log('debug');
```

### Q: Prettier 和 ESLint 冲突怎么办？

A:
项目已配置 `eslint-config-prettier`，会自动禁用 ESLint 中与 Prettier 冲突的规则。

### Q: 如何修改代码风格？

A:

1. ESLint 规则: 修改 `eslint.config.js`
2. Prettier 规则: 修改 `.prettierrc`
3. 编辑器行为: 修改 `.editorconfig`

## 📚 参考资源

- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [Husky 官方文档](https://typicode.github.io/husky/)
- [Commitlint 官方文档](https://commitlint.js.org/)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [lint-staged 官方文档](https://github.com/okonet/lint-staged)

## 🎉 最佳实践

1. **定期运行检查**: 在推送前运行 `pnpm lint` 和 `pnpm format:check`
2. **使用交互式提交**: 使用 `pnpm commit` 确保提交信息规范
3. **不要跳过 Hooks**: Git Hooks 是为了保证代码质量
4. **保持一致**: 团队成员都应遵守相同的规范
5. **及时更新**: 定期更新工具和规则配置

## 🔄 持续改进

随着项目的发展，可以根据团队需求调整：

- ESLint 规则
- Prettier 配置
- 提交信息规范
- Git Hooks 行为

所有配置文件都在项目根目录，随时可以修改！

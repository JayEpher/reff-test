# 工程化配置快速参考

## 📋 常用命令

```bash
# 代码检查
pnpm lint              # 检查所有代码
pnpm lint:fix          # 自动修复问题

# 代码格式化
pnpm format            # 格式化所有代码
pnpm format:check      # 检查格式

# 类型检查
pnpm type-check        # TypeScript 类型检查

# 交互式提交
pnpm commit            # 使用向导创建提交

# 构建和开发
pnpm dev               # 启动开发服务器
pnpm build             # 构建生产版本
pnpm test              # 运行测试
```

## 🎯 提交信息格式

```
<type>(<scope>): <subject>
```

### 常用 Type

| Type         | 说明   | 示例                       |
| ------------ | ------ | -------------------------- |
| **feat**     | 新功能 | `feat(auth): 添加登录功能` |
| **fix**      | 修复   | `fix(api): 修复超时问题`   |
| **docs**     | 文档   | `docs: 更新 README`        |
| **style**    | 格式   | `style: 统一缩进`          |
| **refactor** | 重构   | `refactor: 优化工具函数`   |
| **perf**     | 性能   | `perf: 优化列表渲染`       |
| **test**     | 测试   | `test: 添加单元测试`       |
| **build**    | 构建   | `build: 升级依赖`          |
| **ci**       | CI     | `ci: 更新 workflow`        |
| **chore**    | 杂项   | `chore: 更新配置`          |

## 🔧 配置文件

| 文件                   | 用途         |
| ---------------------- | ------------ |
| `eslint.config.js`     | ESLint 规则  |
| `commitlint.config.js` | 提交信息规范 |
| `.lintstagedrc.js`     | 暂存文件检查 |
| `.prettierrc`          | 代码格式     |
| `.editorconfig`        | 编辑器配置   |
| `.husky/pre-commit`    | 提交前钩子   |
| `.husky/commit-msg`    | 提交信息钩子 |

## 🚦 工作流程

1. **写代码** → 编辑器自动提示错误
2. **保存** → 自动格式化
3. **git add .** → 暂存文件
4. **pnpm commit** → 交互式提交
5. **pre-commit** → 自动检查和修复
6. **commit-msg** → 验证提交信息

## 💡 提示

- 保存时自动格式化（VS Code）
- 提交前自动检查暂存文件
- 使用 `pnpm commit` 确保提交规范
- 不要使用 `--no-verify` 跳过检查

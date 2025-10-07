---
allowed-tools: Bash(gh:*), Bash(git:*), Bash(npm:*), Read, Edit, Write
description: Fix CI errors for a specific PR by URL or number
---

## Context

PRのURL or 番号を指定して、そのPRのCIエラーを修正します。

## Your task

指定されたPR URL or 番号のCIエラーを分析し、修正を行い、変更をコミット・プッシュします。

### Usage Examples:

- `/fix-pr-ci 123` - PR #123のCIエラーを修正
- `/fix-pr-ci https://github.com/tamtam-fitness/realtime-suggest-ai/pull/123` - PR URLでCIエラーを修正

### Process:

1. **PR番号の抽出**
   - URLが指定された場合は番号を抽出
   - 番号が直接指定された場合はそのまま使用

2. **PR情報の取得**
   - `gh pr view <PR_NUMBER>` でPR詳細を確認
   - `gh pr checks <PR_NUMBER>` でCI状況を確認

3. **ブランチの切り替え**
   - `gh pr checkout <PR_NUMBER>` でPRのブランチをチェックアウト
   - 最新の状態にpull

4. **CI失敗ログの分析**
   - `gh run view` でエラーログを取得・分析
   - エラーの種類を特定（lint, test, build, format等）

5. **エラーの修正**
   - **ESLint errors**: `npm run lint` で確認し、手動修正
   - **Prettier errors**: `npm run format:write` で自動修正
   - **TypeScript errors**: 型エラーの修正
   - **Test failures**: テストの修正
   - **Build errors**: ビルドエラーの修正

6. **修正の検証**
   - ローカルでCI相当のコマンドを実行
   - `npm run lint` でlintチェック
   - `npm run format` でフォーマットチェック
   - `npm test` でテスト実行
   - 必要に応じて `npm run package` でビルド確認

7. **変更のコミット・プッシュ**
   - 修正内容に応じた適切なコミットメッセージ
   - `git push` でリモートに反映

### Error Type Examples:

#### Prettier Format Errors:

```bash
npm run format:write
```

#### ESLint Errors:

- 手動でコードを修正
- `npm run lint` で確認

#### TypeScript Type Errors:

- `any` 型の使用を避ける
- 適切な型注釈を追加
- インターフェースの修正

#### Test Failures:

- テストケースの修正
- モックの設定
- 期待値の調整

### Commit Message Format:

```
fix: resolve CI errors for PR #<NUMBER>

- Fix specific error type 1
- Fix specific error type 2
- Ensure all CI checks pass

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Requirements:

1. エラーを完全に修正してCIを通す
2. 適切なコミットメッセージを作成
3. 修正内容を明確に説明
4. 副作用がないことを確認
5. コード品質を維持

**PR番号を指定してCIエラーを修正し、自動的にプッシュしてください。**

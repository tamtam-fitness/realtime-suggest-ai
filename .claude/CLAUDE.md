# realtime-suggest-ai - Project Guidelines

## 🎯 Project Overview

このプロジェクトは **Electron ベースのデスクトップアプリケーション** です。

### Tech Stack

- **Desktop Framework**: Electron 38
- **UI Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Routing**: TanStack Router
- **Build Tool**: Vite 7
- **Packaging**: Electron Forge

## 📁 Architecture & Directory Structure

### UI Components Base: `/src/components`

UIコンポーネントは **機能特化型** と **汎用型** に分類されます:

#### 🎨 汎用コンポーネント (`/src/components/ui/`)

shadcn/ui ベースの再利用可能なプリミティブコンポーネント

```
src/components/ui/
├── button.tsx              # 汎用ボタン
├── navigation-menu.tsx     # ナビゲーションメニュー
├── toggle.tsx              # トグルスイッチ
└── toggle-group.tsx        # トグルグループ
```

**設計原則**:

- プロジェクト全体で再利用可能
- ビジネスロジックを含まない
- shadcn/ui の規約に従う
- プロップスベースでカスタマイズ可能

#### ⚡ 機能特化コンポーネント (`/src/components/`)

アプリケーション固有の機能を持つコンポーネント

**現在の構造**:

```
src/components/
├── ui/                     # 汎用UIコンポーネント (shadcn/ui)
├── template/               # テンプレート用コンポーネント
│   ├── NavigationMenu.tsx
│   ├── InitialIcons.tsx
│   └── Footer.tsx
├── ToggleTheme.tsx         # テーマ切り替え機能
├── LangToggle.tsx          # 言語切り替え機能
└── DragWindowRegion.tsx    # Electronウィンドウドラッグ領域
```

**推奨：ドメイン駆動のディレクトリ構成**:

```
src/components/
├── ui/                     # 汎用UIコンポーネント (shadcn/ui)
├── common/                 # アプリ共通コンポーネント
│   ├── ToggleTheme.tsx     # テーマ切り替え
│   ├── LangToggle.tsx      # 言語切り替え
│   └── DragWindowRegion.tsx # ウィンドウドラッグ領域
├── {domain-1}/             # ドメイン別コンポーネント (例: auth/)
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── hooks/
│       └── useAuth.ts
├── {domain-2}/             # ドメイン別コンポーネント (例: editor/)
│   ├── EditorToolbar.tsx
│   ├── EditorCanvas.tsx
│   └── EditorSidebar.tsx
└── template/               # 削除可能なテンプレート
    └── ...
```

**設計原則**:

- **ドメインごとに分離**: 関連するコンポーネントを同じディレクトリに配置
- **コロケーション**: hooks, utils, types もドメインディレクトリ内に配置可能
- **明確な責務**: 各ドメインは独立した機能領域を表現
- **スケーラビリティ**: 機能追加時にドメインディレクトリを追加

### コンポーネント配置ガイドライン

```
新しいコンポーネントを作成する際:

✅ `/src/components/ui/` に配置する場合:
   - プロジェクト全体で再利用する汎用的なコンポーネント
   - shadcn/ui から追加したコンポーネント
   - ビジネスロジックを持たないUIプリミティブ
   例: Button, Input, Dialog, Card

✅ `/src/components/common/` に配置する場合:
   - アプリ全体で使用する共通機能コンポーネント
   - Electron固有の機能 (IPC通信、ウィンドウ操作等)
   - テーマ、言語切り替えなどグローバル設定系
   例: ToggleTheme, LangToggle, DragWindowRegion

✅ `/src/components/{domain}/` に配置する場合:
   - 特定のドメイン・機能に属するコンポーネント
   - ドメイン固有のビジネスロジックを持つ
   - 関連するhooks, utils, typesも同ディレクトリに配置
   例: auth/LoginForm.tsx, editor/EditorToolbar.tsx, settings/SettingsPanel.tsx

📁 ドメインディレクトリの構成例:
src/components/auth/
├── LoginForm.tsx           # コンポーネント
├── SignupForm.tsx
├── hooks/                  # ドメイン固有のhooks
│   ├── useAuth.ts
│   └── useLoginForm.ts
├── types.ts                # ドメイン固有の型定義
└── utils.ts                # ドメイン固有のユーティリティ
```

### ドメイン例

プロジェクトで想定されるドメイン:

- `auth/` - 認証・認可関連
- `editor/` - エディタ機能
- `settings/` - 設定画面
- `workspace/` - ワークスペース管理
- `file-explorer/` - ファイルエクスプローラー
- `preview/` - プレビュー機能

## 📚 External Documentation

`/external_docs/` ディレクトリ配下にドキュメントが格納されています:

例:

```
external_docs/
└── electron/               # Electron関連のドキュメント
```

**活用方法**:

- Electron APIの実装リファレンス
- ベストプラクティスの確認
- トラブルシューティング時の参照

## 🏗️ Electron-Specific Considerations

### IPC Communication

- **Helper Functions**: `/src/helpers/ipc/` に配置
- レンダラープロセスからメインプロセスへの通信に使用
- 既存実装: `theme`, `window` (カスタムタイトルバー用)

### Custom Title Bar

- `titleBarStyle`: hidden を使用
- `DragWindowRegion.tsx` でドラッグ可能領域を実装

### Context Isolation

- セキュリティのため Context Isolation を使用
- preload スクリプト経由で安全にAPIを公開

## 🎨 Design System

### Styling Approach

- **Tailwind CSS 4** for utility-first styling
- **shadcn/ui** for component primitives
- **Geist** as default font
- **Lucide** for icons

### Theme Support

- ダークモード/ライトモード対応
- `ToggleTheme.tsx` でテーマ切り替え実装済み

## 🌐 Internationalization (i18n)

- **Library**: i18next + react-i18next
- **Language Files**: `/src/localization/`
- **Component**: `LangToggle.tsx` で言語切り替え

## 🧪 Testing Strategy

### Unit Tests

- **Framework**: Vitest
- **Location**: `/src/tests/`
- **Run**: `npm run test:unit`

### E2E Tests

- **Framework**: Playwright
- **Run**: `npm run test:e2e`
- **Note**: ビルド後に実行が必要

### Testing Components

```typescript
// React Testing Library を使用
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

## 📝 Development Workflow

### Component Development

1. **汎用コンポーネント**の場合:
   - shadcn/ui でコンポーネント追加: `npx shadcn@latest add [component]`
   - `/src/components/ui/` に自動配置される

2. **アプリ共通コンポーネント**の場合:
   - `/src/components/common/` に新規作成
   - Electron固有機能やグローバル設定系
   - 必要に応じて IPC helper を `/src/helpers/ipc/` に追加

3. **ドメイン固有コンポーネント**の場合:
   - `/src/components/{domain}/` ディレクトリを作成
   - ドメイン内にコンポーネント、hooks、types、utilsを配置
   - 汎用コンポーネント (`ui/`, `common/`) を活用して構築

#### ドメイン新規作成の手順

```bash
# 1. ドメインディレクトリ作成
mkdir -p src/components/{domain-name}

# 2. 必要に応じてサブディレクトリ作成
mkdir -p src/components/{domain-name}/{hooks,utils}

# 3. コンポーネントファイル作成
touch src/components/{domain-name}/ComponentName.tsx

# 4. 型定義やユーティリティ追加
touch src/components/{domain-name}/types.ts
touch src/components/{domain-name}/utils/helper.ts
```

### Code Quality

- **Linting**: `npm run lint` (ESLint 9)
- **Formatting**: `npm run format:write` (Prettier)
- **React Compiler**: デフォルトで有効

## 🚀 Build & Distribution

### Development

```bash
npm run start              # 開発モードで起動
```

### Production

```bash
npm run package            # プラットフォーム固有の実行ファイル生成
npm run make               # 配布可能なインストーラー生成
npm run publish            # 配布サービスへ公開
```

## 💡 Best Practices

### Component Design

- **Single Responsibility**: 1つのコンポーネントは1つの責務
- **Composition over Inheritance**: コンポーネント合成を優先
- **Props Interface**: TypeScriptで明示的な型定義

### Electron Integration

- **Security First**: Context Isolation を維持
- **IPC Patterns**: helper経由で安全な通信
- **Process Separation**: メインとレンダラーの責務を明確に分離

### Performance

- **React Compiler**: 最適化は自動で適用される
- **Code Splitting**: TanStack Router で自動実装
- **Lazy Loading**: 必要に応じてコンポーネントを遅延ロード

## 📖 References

- [Electron Documentation](/external_docs/electron/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com)

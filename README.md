# Dify チャットボット (LINE風UI)

DifyのAPIを使用したLINE風UIのチャットボットアプリケーションです。

## 機能

- LINE風の洗練されたチャットUI
- Dify APIとの連携
- 会話の継続性（conversation_id）のサポート
- リアルタイムメッセージング
- レスポンシブデザイン

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を設定してください：

```env
# Dify API設定
DIFY_API_KEY=your_dify_api_key_here

# Dify APIのURL（オプション）
# デフォルト: https://api.dify.ai/v1
# セルフホスティングの場合は、適切なURLに変更してください
DIFY_API_URL=https://api.dify.ai/v1
```

#### Dify APIキーの取得方法

1. [Dify](https://dify.ai/)にアクセスしてアカウントを作成
2. アプリケーションを作成
3. API設定からAPIキーを取得

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## Vercelへのデプロイ

### 1. Vercelにプロジェクトをデプロイ

```bash
# Vercel CLIをインストール（未インストールの場合）
npm i -g vercel

# デプロイ
vercel
```

### 2. 環境変数の設定

Vercelのダッシュボードで以下の環境変数を設定：

1. プロジェクトダッシュボードにアクセス
2. Settings → Environment Variables に移動
3. 以下の環境変数を追加：
   - `DIFY_API_KEY`: DifyのAPIキー
   - `DIFY_API_URL`: DifyのAPIエンドポイント（オプション）

### 3. 再デプロイ

環境変数を設定後、再デプロイが必要です：

```bash
vercel --prod
```

## プロジェクト構造

```
├── src/
│   ├── components/
│   │   └── ChatBot.tsx      # メインチャットコンポーネント
│   ├── pages/
│   │   ├── api/
│   │   │   └── chat.ts      # Dify API連携エンドポイント
│   │   ├── _app.tsx         # Next.jsアプリケーション設定
│   │   └── index.tsx        # ホームページ
│   └── styles/
│       └── globals.css      # グローバルスタイル
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 技術スタック

- **Next.js 14** - Reactフレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - スタイリング
- **Axios** - HTTP通信
- **Dify API** - AI/チャットボット機能

## カスタマイズ

### UIのカスタマイズ

- `src/components/ChatBot.tsx` でUIコンポーネントを編集
- `tailwind.config.js` でカラーテーマを変更
- `src/styles/globals.css` でグローバルスタイルを調整

### APIの設定

- `src/pages/api/chat.ts` でDify APIの呼び出しロジックをカスタマイズ
- レスポンスの処理方法を変更可能

## トラブルシューティング

### APIキーエラー

- 環境変数 `DIFY_API_KEY` が正しく設定されているか確認
- Vercelの場合、環境変数設定後に再デプロイが必要

### CORS エラー

- Dify側でCORS設定を確認
- API URLが正しいか確認

### メッセージが送信されない

- ブラウザのコンソールでエラーを確認
- ネットワークタブでAPIレスポンスを確認

## ライセンス

MIT

## 📦 GitHubリポジトリ

- **リポジトリURL**: https://github.com/ai776/yamamoto-bot2
- **ブランチ**: master
- **最終更新**: 2025-08-20 11:17

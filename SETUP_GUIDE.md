# 🚨 重要：Dify APIキーの設定手順

## 現在のエラーについて
「Access token is invalid」エラーが発生しています。
これは、DifyのAPIキーが正しく設定されていないためです。

## 設定手順

### 1. DifyのAPIキーを取得

1. **Difyにログイン**: https://dify.ai/
2. **アプリケーションを選択**（または新規作成）
3. **APIタブを開く**
4. **「APIキー」セクションでキーをコピー**

### 2. ローカル環境の設定

ターミナルで以下のコマンドを実行（実際のAPIキーに置き換えてください）：

```bash
# .env.localファイルを編集
cat > .env.local << EOF
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_URL=https://api.dify.ai/v1
EOF
```

**注意**: `app-xxxxxxxxxxxxxxxxxxxxxxxxxx`を実際のAPIキーに置き換えてください

### 3. 開発サーバーを再起動

```bash
# 現在の開発サーバーを停止（Ctrl+C）
# その後、再起動
npm run dev
```

## APIキーの形式

DifyのAPIキーは通常以下の形式です：
- `app-` で始まる
- 32文字程度の英数字

## トラブルシューティング

もしまだエラーが出る場合：

1. APIキーが正しくコピーされているか確認
2. APIキーの前後に余分なスペースがないか確認
3. Difyのアプリが「公開」状態になっているか確認

## Vercel（本番環境）の設定

1. Vercel管理画面: https://vercel.com/ailaboteam-gmailcoms-projects/yamamoto-ai-chatbot
2. Settings → Environment Variables
3. 以下を追加：
   - Key: `DIFY_API_KEY`
   - Value: 実際のAPIキー
4. 保存後、再デプロイ

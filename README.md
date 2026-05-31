# Dot Click

画面内に現れる点を素早くクリックする反射神経ゲーム。

## ゲームモード

| モード | URL | 内容 |
|--------|-----|------|
| サバイバル | `/game?mode=survival` | 制限時間内にクリック。3ミスで GO。成功が続くほど加速 |
| 20点スピード | `/game?mode=speed100` | 20個タップのタイムアタック（右上に経過秒数） |

サバイバルモードのみログイン後にスコア保存・ランキング対象。

## 開発

```bash
npm install
npm run dev          # 開発（http://localhost:3000）
npm run build        # 本番ビルド（PWA 有効）
npm start            # 本番起動
```

## スマホでアプリ化（PWA）

1. `npm run build && npm start` または Vercel にデプロイ
2. スマホブラウザで URL を開く
3. 「ホーム画面に追加」

## Step 進捗

| Step | 内容 | 状態 |
|------|------|------|
| 1 | 環境構築・DB | ✅ |
| 2 | 点クリックゲーム | ✅ |
| 3 | ログイン・スコア・ランキング | ✅ |
| 4 | 見た目・PWA | ✅ |

設計書: [基本設計書.md](./基本設計書.md) / [詳細設計書.md](./詳細設計書.md)

## Git

```bash
git add .
git commit -m "変更内容"
git push
```

`.env.local` はコミットしない。

## 本番デプロイ

Supabase → GitHub → Vercel の手順は [DEPLOY.md](./DEPLOY.md) を参照。

## Supabase（スコア保存・任意）

1. Supabase でプロジェクト作成
2. `.env.local` に URL / KEY / DATABASE_URL を設定（`.env.example` 参照）
3. Auth → Redirect URLs に `http://localhost:3000/auth/callback` を追加
4. `npm run db:migrate`

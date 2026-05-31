# HitArrow

回転する的に矢を刺す Web カジュアルゲーム。

## 開発方針

- **当面:** ブラウザ（PC / スマホ）でプレイできれば OK
- **最終:** PWA でホーム画面追加（Step 4）

## セットアップ

```bash
npm install
cp .env.example .env.local   # Supabase / DATABASE_URL を設定
npm run db:migrate           # DB テーブル作成
npm run dev
```

http://localhost:3000 を PC / スマホブラウザで開く。

## Step 進捗

| Step | 内容 | 状態 |
|------|------|------|
| 1 | 環境構築・DB | ✅ |
| 2 | ゲーム本体（PC/スマホ操作） | ✅ |
| 3 | ログイン・スコア・ランキング | ✅ |
| 4 | 見た目・PWA | 未着手 |

設計書: [基本設計書.md](./基本設計書.md) / [詳細設計書.md](./詳細設計書.md)

## Git で保存する

```bash
git add .
git commit -m "変更内容のメモ"
git push                     # GitHub 等にアップロード（初回は remote 設定が必要）
```

詳しくは基本設計書「付録 F. Git でコードを保存する」を参照。

**注意:** `.env.local` は Git に含めない（秘密情報が入るため）。

## Supabase 設定（スコア保存を使う場合）

1. [Supabase](https://supabase.com) でプロジェクト作成
2. `.env.local` に URL / ANON KEY / DATABASE_URL を設定
3. Auth → URL Configuration に `http://localhost:3000/auth/callback` を追加
4. `npm run db:migrate`

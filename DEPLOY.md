# デプロイ手順（Supabase → GitHub → Vercel）

Dot Click を本番公開するためのチェックリストです。

## 前提

- Node.js 18+
- GitHub アカウント
- [Supabase](https://supabase.com) アカウント（無料枠で可）
- [Vercel](https://vercel.com) アカウント（無料枠で可）

---

## Step 1: Supabase プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. リージョンは **Northeast Asia (Tokyo)** を推奨
3. プロジェクト作成後、以下を控える:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Database URL**（Settings → Database → Connection string → URI）→ `DATABASE_URL`
     - `[YOUR-PASSWORD]` を実際の DB パスワードに置き換える

### Auth 設定

Dashboard → **Authentication** → **URL Configuration**

| 項目 | 値 |
|------|-----|
| Site URL | 本番 URL（後で Vercel の URL に更新可） |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| | `https://YOUR-APP.vercel.app/auth/callback` |

Dashboard → **Authentication** → **Providers** → **Email** を有効化（Magic Link）

### DB マイグレーション

ローカル `.env.local` に接続情報を設定したうえで:

```bash
npm run db:migrate
# 初回のみ。既にテーブルがある場合は prisma migrate deploy
npx prisma migrate deploy
```

---

## Step 2: ローカル環境変数

`.env.local`（git に含めない）:

```env
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

> **Tip:** Vercel 本番では `DATABASE_URL` に **Transaction pooler**（ポート 6543）を使うと接続数制限に強いです。ローカル開発は Direct connection（5432）でも可。

動作確認:

```bash
npm run dev
# ログイン → サバイバルで GO → スコア保存 → /leaderboard
```

---

## Step 3: GitHub に push

### 3-1. GitHub でリポジトリ作成

1. [github.com/new](https://github.com/new) → リポジトリ名例: `dot-click`
2. **Public** または **Private** を選択
3. README / .gitignore は **追加しない**（ローカルに既にあるため）

### 3-2. リモート追加 & push

```bash
cd /Users/ikegawasyodai/Documents/newApp
git remote add origin git@github.com:YOUR_USER/dot-click.git
git push -u origin main
```

SSH 未設定の場合は HTTPS:

```bash
git remote add origin https://github.com/YOUR_USER/dot-click.git
git push -u origin main
```

---

## Step 4: Vercel デプロイ

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. GitHub 連携 → `dot-click` を選択
3. **Framework Preset:** Next.js（自動検出）
4. **Environment Variables** に以下を追加:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Supabase の接続 URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |

5. **Deploy** をクリック

### リージョン

Project Settings → **Functions** → Region を **hnd1 (Tokyo)** にすると日本からのレイテンシが低くなります。

### デプロイ後

1. 表示された URL（例: `https://dot-click.vercel.app`）を Supabase の **Site URL** と **Redirect URLs** に追加
2. スマホで URL を開き → **ホーム画面に追加** で PWA 確認

---

## トラブルシュート

| 症状 | 対処 |
|------|------|
| スコア保存できない | ログイン済みか、Vercel の env が正しいか確認 |
| Magic Link が届かない | Supabase Auth の Redirect URL に本番 URL を追加 |
| ランキングが空 | `prisma migrate deploy` 済みか、スコア保存テスト |
| ビルド失敗 | ローカルで `npm run build` を先に通す |

---

## コマンド早見表

```bash
npm run dev              # 開発
npm run build            # 本番ビルド（PWA SW 生成）
npm run db:migrate       # ローカル DB マイグレーション
npx prisma migrate deploy  # 本番 DB マイグレーション
npm run generate:icons   # PWA アイコン再生成
```

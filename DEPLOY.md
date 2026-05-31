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

### Auth 設定（重要）

Dashboard → **Authentication** → **URL Configuration**

#### Dot Click 単体の場合

| 項目 | 値 |
|------|-----|
| Site URL | `https://dot-click.vercel.app` |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| | `https://dot-click.vercel.app/auth/callback` |

#### 複数アプリで同じ Supabase を使う場合（推奨）

**1つの Supabase プロジェクトで複数ゲームのログインが可能**です。Redirect URLs に各アプリの callback を登録するだけで、**追加課金は不要**（無料枠内）。

| 項目 | 値 |
|------|-----|
| Site URL | メインアプリの URL（例: `https://dot-click.vercel.app`） |
| Redirect URLs | `https://dot-click.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |
| | `https://tcc-team-condition-checker.vercel.app/auth/callback`（他アプリがあれば追加） |

> Magic Link は **Redirect URLs に登録された URL** へ飛ぶ。未登録だと Site URL（別アプリ）に飛んでしまうので注意。

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

## Step 5: SMTP 設定（友達に配る前に推奨）

Supabase 標準メールは **1時間に数通** しか送れません。  
Custom SMTP を設定すると Magic Link が安定します。

> **コード変更不要。** Supabase Dashboard だけで設定します。

**ドメインなしで手軽に:** → [Step 5B: Gmail SMTP](#step-5b-gmail-smtpドメイン不要・推奨)  
**本番・大量送信:** → [Step 5A: Resend SMTP](#step-5a-resend-smtp独自ドメインあり)

---

## Step 5B: Gmail SMTP（ドメイン不要・推奨）

Gmail アカウントがあれば **独自ドメイン不要** で Magic Link を送れます。

### 5B-1. Google アプリパスワードを取得（5分）

1. [Google アカウント](https://myaccount.google.com/) → **セキュリティ**
2. **2段階認証プロセス** を ON（未設定なら先に有効化）
3. 検索または **アプリパスワード** を開く  
   直接: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. アプリ名: `Supabase Dot Click` → **作成**
5. 表示された **16桁のパスワード**（例: `abcd efgh ijkl mnop`）をコピー  
   - スペースは入力時に除いて OK

### 5B-2. Supabase に Gmail SMTP を設定

1. Supabase → **Authentication** → **Emails** → **SMTP Settings**
2. **Enable Custom SMTP** を ON
3. 以下を入力（`kirutooo333@gmail.com` は自分の Gmail に置き換え）:

| Supabase の項目 | 入力する値 |
|----------------|-----------|
| **Sender email** | `kirutooo333@gmail.com` |
| **Sender name** | `Dot Click` |
| **Host** | `smtp.gmail.com` |
| **Port number** | `587` |
| **Username** | `kirutooo333@gmail.com`（Sender email と同じ） |
| **Password** | Google アプリパスワード（16桁） |

4. **Save**

> Port `587` で失敗する場合は `465` を試す。

### 5B-3. 送信上限を上げる

Supabase → **Authentication** → **Rate Limits** → **Email sent** を **100/時** 程度に → Save

### 5B-4. 動作確認

1. https://dot-click.vercel.app/auth/login
2. Magic Link 送信 → Gmail に届くか確認（迷惑メールも見る）
3. リンク → Dot Click に戻る

### 5B-注意

- Gmail の1日送信上限あり（個人利用・友達数人なら通常 OK）
- 送信元が `@gmail.com` と表示される
- 本格公開時は Resend + 独自ドメインの方が見た目・到達率で有利

---

## Step 5A: Resend SMTP（独自ドメインあり）

### 5-1. Resend アカウント作成（5分）

1. ブラウザで [https://resend.com/signup](https://resend.com/signup) を開く
2. **Continue with GitHub** またはメールで登録
3. ログイン後、左メニュー **API Keys**
4. **Create API Key**
   - Name: `supabase-dot-click`（任意）
   - Permission: **Sending access**
5. **Add** → 表示されたキー（`re_xxxxxxxx...`）を **コピーしてメモ**
   - ⚠️ この画面を閉じると二度と見れないので必ず保存

---

### 5-2. 送信元メール（Sender email）を決める

Resend は **送信元ドメインの確認** が必要です。

#### パターン A: 独自ドメインがある（本番向け・推奨）

1. Resend → 左メニュー **Domains** → **Add Domain**
2. 例: `yourdomain.com` を入力
3. 表示される **DNS レコード**（SPF / DKIM など）を、ドメイン管理（お名前.com / Cloudflare 等）に追加
4. Resend で **Verify** → 緑チェックになったら OK
5. Sender email 例: `noreply@yourdomain.com`

#### パターン B: ドメインがない（テストのみ）

- Resend 無料枠は **登録した自分のメールアドレスにしか送れない** 場合があります
- **友達全員に送る** なら、将来的にドメイン取得（年数百円〜）か、Gmail SMTP 等を検討
- まずは **自分のメールで Magic Link が届くか** テストする用途なら Resend だけでも可

---

### 5-3. Supabase に SMTP を設定（5分）

1. [Supabase Dashboard](https://supabase.com/dashboard) → **IGSD9's Project**
2. 左メニュー **Authentication**
3. 下の方 **SMTP Settings**（または **Email** → **SMTP Settings**）
4. **Enable Custom SMTP** を ON

以下を **そのままコピペ**:

| Supabase の項目 | 入力する値 |
|----------------|-----------|
| **Sender email** | Resend で使えるアドレス（例: `noreply@yourdomain.com`） |
| **Sender name** | `Dot Click` |
| **Host** | `smtp.resend.com` |
| **Port number** | `465` |
| **Username** | `resend` |
| **Password** | Resend の API Key（`re_...`） |

5. **Save**

---

### 5-4. 送信上限を上げる（推奨）

Custom SMTP 有効化後、Supabase のデフォルトは **30通/時** です。

1. Supabase → **Authentication** → **Rate Limits**
2. **Email sent** の上限を必要に応じて引き上げ（例: 100/時）
3. **Save**

---

### 5-5. 動作確認

1. https://dot-click.vercel.app/auth/login
2. メールアドレス入力 → **ログインリンクを送る**
3. メールが届く（送信元が Resend 経由になっている）
4. リンクを開く → **dot-click.vercel.app** に戻る
5. Resend Dashboard → **Emails** で送信ログを確認

---

### 5-6. うまくいかないとき

| 症状 | 対処 |
|------|------|
| Save できない | Sender email が Resend で未確認ドメイン |
| メールが届かない | Resend → Emails でエラー確認。スパムフォルダも見る |
| 友達に届かない | ドメイン未確認の可能性。パターン A で DNS 設定 |
| まだ rate limit | Authentication → Rate Limits を引き上げ |

---

## トラブルシュート

| 症状 | 対処 |
|------|------|
| スコア保存できない | ログイン済みか、Vercel の env が正しいか確認 |
| Magic Link が届かない | Supabase Auth の Redirect URL に本番 URL を追加 |
| **Magic Link で別アプリが開く** | Redirect URLs に `https://dot-click.vercel.app/auth/callback` を追加。古いメールは使わず再送信 |
| Vercel env が `next_public_supabase_url` になっている | Key 名を Value に入れている。正しい URL を設定して Redeploy |
| 接続確認 | `https://dot-click.vercel.app/api/health/supabase` が `"ok":true` なら Supabase 接続 OK |
| ランキングが空 | `prisma migrate deploy` 済みか、スコア保存テスト |
| ビルド失敗 | ローカルで `npm run build` を先に通す |
| `email rate limit exceeded` | 1時間待つか、[Step 5](#step-5-smtp-設定友達に配る前に推奨) で SMTP 設定 |
| `Error sending magic link email` | Sender email 未確認（Resend）→ [Gmail SMTP](#step-5b-gmail-smtpドメイン不要推奨) へ |

---

## コマンド早見表

```bash
npm run dev              # 開発
npm run build            # 本番ビルド（PWA SW 生成）
npm run db:migrate       # ローカル DB マイグレーション
npx prisma migrate deploy  # 本番 DB マイグレーション
npm run generate:icons   # PWA アイコン再生成
```

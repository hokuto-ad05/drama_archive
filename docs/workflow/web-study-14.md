# 第14章　GitHub Pagesへ公開する

## 目的

完成したNext.jsサイトを静的ファイルとして書き出し、GitHub Pagesへ自動公開します。

```text
自分のPCで変更
↓
GitHubへpush
↓
GitHub Actionsがbuild
↓
GitHub Pagesへ公開
```

公開後も、同じ流れで更新できます。

---

## 1. 公開URLとbasePath

GitHubのリポジトリ名が`drama_archive`の場合、公開URLは次の形になります。

```text
https://GitHubユーザー名.github.io/drama_archive/
```

このURLでは、サイトが`/`ではなく`/drama_archive`の下にあります。この部分を`basePath`としてNext.jsへ伝えます。

リポジトリ名が違う場合は、以下の`drama_archive`を実際の名前へ置き換えてください。

---

## 2. next.config.mjsを設定する

```js
// next.config.mjs
const repositoryName = "drama_archive";
const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? `/${repositoryName}` : "";

const nextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
```

```text
output: "export"
→ HTML、CSS、JavaScriptとして書き出す

basePath
→ GitHub Pages上のリポジトリ名を含むURLへ対応する

images.unoptimized
→ 画像最適化サーバーを使わず静的出力できるようにする
```

開発中は`basePath`が空なので、これまでどおり`http://localhost:3000`で確認できます。

---

## 3. public画像のパスを揃える

`basePath`を設定しても、通常の`/pict/...`という文字列へリポジトリ名が自動追加されるわけではありません。

画像パスを作る小さな関数を用意します。

```text
src/
└── lib/
    └── assetPath.js
```

```js
// src/lib/assetPath.js
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path) {
  return `${basePath}${path}`;
}
```

作品データでは次のように使います。

```js
// src/data/dramas.js
import { assetPath } from "@/lib/assetPath";

export const dramas = [
  {
    id: "true-detective",
    image: assetPath("/pict/truedetective.avif"),
    // ほかのデータ
  },
];
```

Heroでも使います。

```jsx
import { assetPath } from "@/lib/assetPath";

const heroImages = [
  { src: assetPath("/pict/hero01.avif"), alt: "" },
  { src: assetPath("/pict/hero02.avif"), alt: "" },
  { src: assetPath("/pict/hero03.avif"), alt: "" },
];
```

Headerのロゴも変更します。

```jsx
<img src={assetPath("/pict/logo.svg")} alt="" />
```

`public`内を参照しているほかの画像やファイルも、同じ方法へ揃えます。

外部URLや`#featured`のようなページ内リンクには`assetPath()`を使いません。

---

## 4. ローカルで公開用buildを確認する

```bash
npm run lint
npm run lint:styles
npm run build
```

成功すると、プロジェクト直下へ`out`フォルダが作成されます。

```text
drama_archive/
└── out/
    ├── index.html
    ├── _next/
    └── pict/
```

`out`はbuildのたびに作り直せるため、Gitへ登録しません。`.gitignore`へ次があることを確認します。

```text
/out/
```

---

## 5. GitHub Actionsを作る

次のファイルを作ります。

```text
.github/
└── workflows/
    └── deploy.yml
```

```yaml
# .github/workflows/deploy.yml
name: Deploy Next.js site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

`main`へpushされたとき、依存関係のインストール、build、公開が自動で行われます。

---

## 6. GitHub Pagesを有効にする

GitHubのリポジトリを開きます。

```text
Settings
↓
Pages
↓
Build and deployment
↓
Source: GitHub Actions
```

設定後、変更をGitへ記録します。

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push
```

GitHubの`Actions`タブで処理を確認します。緑色のチェックが付いたら、Pagesに表示されたURLを開きます。

---

## 7. 公開後に確認する

ローカルで動いていても、公開先のパスや大文字・小文字の違いで問題が出る場合があります。

次を確認してください。

- トップページが表示される
- ロゴ、Hero、作品画像が表示される
- CSSが適用されている
- PC・モバイルメニューが動く
- 作品Modalを開閉できる
- 絞り込みと並べ替えが動く
- ScrollRevealとSwiperが動く
- スライドを停止できる
- ブラウザを再読み込みしても表示される
- コンソールにエラーが出ていない

問題がある場合は、GitHub Actionsのログから最初のエラーを確認します。一度に複数箇所を変更せず、一つずつ原因を切り分けます。

---

## 8. 更新の流れ

公開後の更新も同じです。

```text
作業用branchを作る
↓
修正する
↓
lint・Stylelint・build
↓
Pull Requestで確認する
↓
mainへ統合する
↓
GitHub Pagesが自動更新される
```

作品を追加する場合は、基本的に`src/data/dramas.js`と画像を変更します。カードやModalのJSXを複製する必要はありません。

これで、データから表示を作り、共通部品と制作ルールを使い、チームで確認して公開するところまでつながりました。

---

## 今日の確認

- [ ] `output: "export"`を設定した
- [ ] 公開URLに合う`basePath`を設定した
- [ ] public画像へ`assetPath()`を使用した
- [ ] ローカルでbuildが成功した
- [ ] GitHub Actionsの公開処理が成功した
- [ ] 公開URLですべての画像とスタイルを確認した
- [ ] 公開後も主要な操作を確認した
- [ ] mainへの統合で自動更新される流れを説明できる

## Git

```bash
git add .
git commit -m "Publish Drama Archive with GitHub Pages"
git push
```

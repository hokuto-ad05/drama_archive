# 第4章　SCSSとコンポーネントの置き場所を整える

## 目的

第3章までに表示できるようになったDrama Archiveを、複数人でも修正場所を判断しやすい構成へ整理します。

この章では、次の三つを行います。

```text
サイト全体のスタイル
→ src/styles

一つのコンポーネントだけのスタイル
→ コンポーネントと同じ場所の .module.scss

ページ共通のHeaderとFooter
→ src/components/layout
```

見た目を作り直す章ではありません。移動前と同じ見た目を保ちながら、置き場所と責務を整理します。

---

## 1. Sassを追加する

```bash
npm install --save-dev sass
```

Next.jsは`sass`を追加すると、`.scss`と`.module.scss`をそのまま読み込めます。

---

## 2. このプロジェクトのスタイルルール

この教材では、次の基準に統一します。

| 種類 | 置き場所 | 例 |
|---|---|---|
| リセット | `src/styles/reset.css` | ブラウザ差の調整 |
| 要素の基本スタイル | `src/styles/_base.scss` | `body`、`a`、`img` |
| 共有値 | `src/styles/shared/_variables.scss` | 色、余白、重なり順 |
| 共有処理 | `src/styles/shared/_mixins.scss` | メディアクエリ |
| コンポーネント固有 | 各コンポーネントの`.module.scss` | Header、Card、Modal |
| ページ固有 | `src/app/page.module.scss` | トップページ全体の配置 |

判断に迷った場合は、次のように考えます。

```text
サイトのどこに置いても必要
→ global

その部品を表示するときだけ必要
→ CSS Module
```

コンポーネント固有のクラスを`globals.scss`へ増やし続けないことが重要です。

---

## 3. 共通スタイルの構成を作る

次の構成を作ります。

```text
src/
├── app/
│   ├── globals.scss
│   ├── layout.js
│   ├── page.js
│   └── page.module.scss
└── styles/
    ├── _index.scss
    ├── _base.scss
    ├── reset.css
    └── shared/
        ├── _index.scss
        ├── _variables.scss
        └── _mixins.scss
```

元サイトのreset CSSは`src/styles/reset.css`へ移します。

`src/styles/_index.scss`は、共通スタイルの入口です。

```scss
// src/styles/_index.scss
@forward "base";
```

共有値とmixinにも入口を作ります。

```scss
// src/styles/shared/_index.scss
@forward "variables";
@forward "mixins";
```

`@forward`は、別ファイルにある値や処理を入口から利用できるようにする指定です。

---

## 4. 共有値を決める

最初から大量の値を作る必要はありません。複数の場所で使うことが分かった値から追加します。

```scss
// src/styles/shared/_variables.scss
$color-background: #111;
$color-text: #fff;
$color-accent: #ffd800;

$content-width: 1200px;
$side-space: 20px;

$breakpoint-md: 768px;
$breakpoint-lg: 1024px;

$z-header: 20;
$z-modal: 100;
```

```scss
// src/styles/shared/_mixins.scss
@use "variables" as variables;

@mixin mq($size) {
  @if $size == md {
    @media (min-width: variables.$breakpoint-md) {
      @content;
    }
  } @else if $size == lg {
    @media (min-width: variables.$breakpoint-lg) {
      @content;
    }
  } @else {
    @error "Unknown breakpoint: #{$size}";
  }
}
```

共有ファイルを使う側では、どこから来た値か分かるように名前を付けて読み込みます。

```scss
@use "@/styles/shared" as shared;

.example {
  color: shared.$color-accent;

  @include shared.mq(md) {
    display: grid;
  }
}
```

この教材では、チーム内で名前の衝突が起きにくいように`as *`ではなく`as shared`を使用します。

---

## 5. グローバルスタイルの入口をlayout.jsに置く

`layout.js`からリセットと共通スタイルだけを読み込みます。

```jsx
// src/app/layout.js
import { Archivo, Cormorant_Garamond, Noto_Serif_JP } from "next/font/google";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "@/styles/reset.css";
import "./globals.scss";
```

`globals.scss`は共通スタイルの入口にします。

```scss
// src/app/globals.scss
@use "@/styles";
```

第3章まで使っていた`globals.css`のうち、`body`や`a`などサイト全体に必要な指定を`_base.scss`へ移します。

```scss
// src/styles/_base.scss
@use "shared" as shared;

:root {
  --sans-serif: var(--font-sans-en), sans-serif;
  --serif: var(--font-serif-en), var(--font-serif-ja), serif;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: shared.$color-text;
  background: shared.$color-background;
  font-family: var(--sans-serif);
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
}
```

移動後は`src/app/globals.css`を削除し、同じスタイルを二重に読み込まないようにします。

---

## 6. HeaderとFooterをlayoutへ整理する

第2章で作ったHeaderとFooterを、次の場所へ移します。

```text
src/components/layout/
├── Header/
│   ├── index.jsx
│   └── Header.module.scss
└── Footer/
    ├── index.jsx
    └── Footer.module.scss
```

```jsx
// src/components/layout/Header/index.jsx
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 第3章までに作ったHeaderの中身 */}
      </div>
    </header>
  );
}
```

```scss
// src/components/layout/Header/Header.module.scss
@use "@/styles/shared" as shared;

.header {
  position: relative;
  z-index: shared.$z-header;
}

.inner {
  width: min(100% - 40px, shared.$content-width);
  margin-inline: auto;
}
```

```jsx
// src/components/layout/Footer/index.jsx
import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© Yasuyuki Ishizaki</p>
    </footer>
  );
}
```

```scss
// src/components/layout/Footer/Footer.module.scss
.footer {
  padding-block: 40px;
  text-align: center;
}
```

元CSSにあるHeaderとFooterの指定も、それぞれの`.module.scss`へ移します。

CSS Modulesでは、JSXのクラス名を次のように対応させます。

```jsx
className={styles.menuButton}
```

```scss
.menuButton {
  /* このコンポーネントだけで使う指定 */
}
```

この教材では、CSS Modules内のクラス名を`camelCase`に統一します。

---

## 7. HeaderとFooterはlayout.jsだけに置く

HeaderとFooterは全ページ共通なので、`layout.js`にだけ置きます。

```jsx
// src/app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

`page.js`にはHeaderとFooterを書きません。

```jsx
// src/app/page.js
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* ページ固有の内容 */}
    </main>
  );
}
```

```scss
// src/app/page.module.scss
@use "@/styles/shared" as shared;

.main {
  width: min(100% - 40px, shared.$content-width);
  margin-inline: auto;
}
```

---

## 8. Stylelintを追加する

複数人でSCSSを書くときに、書き間違いや表記の揺れを見つけやすくします。

```bash
npm install --save-dev stylelint stylelint-config-standard-scss
```

```js
// stylelint.config.mjs
export default {
  extends: ["stylelint-config-standard-scss"],
};
```

`package.json`の`scripts`へ追加します。既存の`dev`や`build`は残してください。

```json
{
  "scripts": {
    "lint:styles": "stylelint \"src/**/*.{css,scss}\""
  }
}
```

確認します。

```bash
npm run lint
npm run lint:styles
```

エラーが出た場合は、内容を読んでから該当箇所を直します。

---

## 9. この章で決めた制作ルール

```text
Header・Footer
→ layoutだけに置く

全体へ影響するスタイル
→ stylesとglobals.scss

部品だけに影響するスタイル
→ CSS Modules

共有値
→ styles/shared

ファイルの移動
→ import先も同時に直す
```

READMEにも「スタイルの置き場所」としてこのルールを短く残してください。

---

## 今日の確認

- [ ] Sassを追加した
- [ ] reset、base、共有値、コンポーネント固有スタイルを分けた
- [ ] HeaderとFooterを`components/layout`へ移した
- [ ] HeaderとFooterを`layout.js`だけで表示している
- [ ] CSS ModulesのクラスをJSXから読み込めた
- [ ] `as shared`を使う理由を説明できる
- [ ] Stylelintを実行できた
- [ ] 移行前と同じ見た目を保てた

## Git

```bash
git add .
git commit -m "Organize components and styles"
```

# 第7章　共通データとuseStateでメニューを作る

## 目的

PC用とスマートフォン用のナビゲーションを一つのデータから作り、`useState`でモバイルメニューの開閉を管理します。

この章では、まだ共通Modalを使いません。

```text
第7章
→ stateによって表示が変わる仕組みを理解する

第8章
→ 表示部分を実用的なModalへ置き換える
```

---

## 1. 同じ内容を二度書く問題

PC用とスマートフォン用へリンクを直接書くと、一件追加するたびに二か所を修正する必要があります。

```text
PC Navigation
├── Featured
├── Dramas
└── About

Mobile Navigation
├── Featured
├── Dramas
└── About
```

見た目やHTML構造が違うことは問題ではありません。問題は、同じリンク情報を二か所で管理することです。

---

## 2. ナビゲーションの内容を配列にする

```jsx
const navigationLinks = [
  { href: "#featured", label: "Featured" },
  { href: "#dramas", label: "Dramas" },
  { href: "#about", label: "About" },
];
```

この配列には、リンク先と表示文字だけを入れます。PC用・スマートフォン用という見た目の情報は入れません。

---

## 3. PC用ナビゲーションをmapで作る

```jsx
<nav className={styles.desktopNav} aria-label="メインナビゲーション">
  <ul>
    {navigationLinks.map((item) => (
      <li key={item.href}>
        <a href={item.href}>{item.label}</a>
      </li>
    ))}
  </ul>
</nav>
```

第6章では作品データからカードを作りました。今回はリンクデータから`li`を作っています。

```text
配列
↓
map()
↓
必要な数だけ同じ構造を作る
```

という基本は同じです。

---

## 4. HeaderをClient Componentにする

メニューボタンを押した結果を画面へ反映するため、Headerで`useState`を使います。

```jsx
"use client";

import { useState } from "react";
```

`"use client"`は、このファイルをブラウザ上の操作に対応する境界にする指定です。サイト全体がブラウザだけで作られるという意味ではありません。

次の状態を作ります。

```jsx
const [isMenuOpen, setIsMenuOpen] = useState(false);
```

```text
false → 閉じている
true  → 開いている
```

状態を変更する関数も作ります。

```jsx
const toggleMenu = () => {
  setIsMenuOpen((current) => !current);
};

const closeMenu = () => {
  setIsMenuOpen(false);
};
```

```text
toggleMenu()
→ 現在の状態を反転する

closeMenu()
→ 必ず閉じる
```

---

## 5. MobileMenuを作る

```text
src/components/layout/MobileMenu/
├── index.jsx
└── MobileMenu.module.scss
```

```jsx
// src/components/layout/MobileMenu/index.jsx
import styles from "./MobileMenu.module.scss";

export default function MobileMenu({ isOpen, links, onClose }) {
  return (
    <div
      id="mobile-navigation"
      className={styles.menu}
      hidden={!isOpen}
    >
      <nav aria-label="モバイルナビゲーション">
        <ul className={styles.list}>
          {links.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={onClose}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
```

`MobileMenu`はstateを持ちません。

```text
isOpen
→ 表示するか

links
→ 何を表示するか

onClose
→ 閉じるとき何を呼ぶか
```

をHeaderからpropsで受け取ります。

```scss
// src/components/layout/MobileMenu/MobileMenu.module.scss
@use "@/styles/shared" as shared;

.menu {
  padding: 32px shared.$side-space;
  background: shared.$color-background;

  &[hidden] {
    display: none;
  }
}

.list {
  display: grid;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}
```

---

## 6. Header全体

```jsx
// src/components/layout/Header/index.jsx
"use client";

import { useState } from "react";

import MobileMenu from "@/components/layout/MobileMenu";
import styles from "./Header.module.scss";

const navigationLinks = [
  { href: "#featured", label: "Featured" },
  { href: "#dramas", label: "Dramas" },
  { href: "#about", label: "About" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a
          href="#featured"
          className={styles.logo}
          aria-label="Drama Archive トップへ"
        >
          <img src="/pict/logo.svg" alt="" />
        </a>

        <nav
          className={styles.desktopNav}
          aria-label="メインナビゲーション"
        >
          <ul>
            {navigationLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          Menu
        </button>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        links={navigationLinks}
        onClose={closeMenu}
      />
    </header>
  );
}
```

`aria-expanded`は開閉を実行する属性ではありません。現在の状態を支援技術へ伝える属性です。

HeaderのCSS Moduleでは、PC用ナビゲーションとメニューボタンの表示を画面幅で切り替えます。

```scss
// src/components/layout/Header/Header.module.scssへ追加
// 先頭の @use "@/styles/shared" as shared; は第4章で追加済みです。

.logo {
  display: block;
  width: 180px;
}

.desktopNav {
  display: none;
}

.menuButton {
  min-width: 44px;
  min-height: 44px;
}

@include shared.mq(md) {
  .desktopNav {
    display: block;
  }

  .menuButton {
    display: none;
  }
}
```

第4章ですでに同じセレクタを移している場合は重複して追加せず、既存の指定をこの方針へ合わせます。

---

## 7. stateを正として考える

静的JavaScriptでは、DOMのクラスを直接追加・削除することがあります。

```js
element.classList.toggle("is-open");
```

Reactでは、現在の状態を先に値として持ちます。

```text
ボタンを押す
↓
isMenuOpenが変わる
↓
Reactが新しいstateを見る
↓
MobileMenuのhiddenが変わる
```

DOMを見て現在の状態を判断するのではなく、**stateを正として表示を作る**ことが、この章の中心です。

---

## 8. 同じデータと同じ構造は別の話

PC用とスマートフォン用には、それぞれ`map()`があります。これは問題ありません。

```text
共通にするもの
→ href、label

別にするもの
→ HTML構造、スタイル、開閉動作
```

すべてを一つにまとめることが共通化ではありません。

**同じものは一つにし、違うものは分ける。**

その境界を考えることが重要です。

Header以外でも同じリンクを使うようになったら、`navigationLinks`を`src/data/navigation.js`へ移すことを検討します。今はHeaderだけで使うため、同じファイル内で構いません。

---

## 9. 確認する

配列へ次の項目を一件追加します。

```jsx
{ href: "#contact", label: "Contact" }
```

PC用とスマートフォン用の両方へ反映されることを確認します。

さらに、次も確認してください。

- ボタンを押すと開閉する
- `aria-expanded`が`true`と`false`に変わる
- モバイルメニューのリンクを押すと閉じる
- PC用ナビゲーションは影響を受けない

この段階では、Escapeキー、背景クリック、フォーカス移動、スクロール停止はまだありません。次章で共通Modalとして追加します。

---

## 今日の確認

- [ ] 一つの配列からPC用とスマートフォン用を生成した
- [ ] HeaderをClient Componentにした理由を説明できる
- [ ] `useState`の現在値と更新関数を区別できる
- [ ] stateから表示を決めた
- [ ] MobileMenuへデータと関数をpropsで渡した
- [ ] データと表示構造を分けて考えられる
- [ ] まだModalの機能を実装していないことを確認した

## Git

```bash
git add .
git commit -m "Manage mobile navigation with state"
```

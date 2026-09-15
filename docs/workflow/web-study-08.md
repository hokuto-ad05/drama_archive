# 第8章　再利用できるModalを作る

## 目的

第7章のモバイルメニューを、マウス以外でも扱える共通Modalへ置き換えます。

完成するModalは、次の機能を持ちます。

- Escapeキーで閉じる
- 背景をクリックすると閉じる
- 内側をクリックしても閉じない
- 開いたらModal内へフォーカスを移す
- Tabキーの移動をModal内に留める
- 閉じたら元の要素へフォーカスを戻す
- 開いている間は背景スクロールを止める
- 目に見える閉じるボタンを持つ
- `role="dialog"`と`aria-modal="true"`を持つ
- 中身を`children`で入れ替えられる

この章は、前半でModalの設計、後半で`useEffect`と`useRef`を扱います。一度に暗記せず、それぞれの機能が何のためにあるかを確認してください。

---

## 1. 親とModalの責務を分ける

Headerは、メニューが開いているかを管理します。

```text
Header
├── isMenuOpenを持つ
├── 開く・閉じるを決める
└── Modalへ中身を渡す
```

Modalは、開いた後の共通動作を担当します。

```text
Modal
├── 背景を表示する
├── キーボードを扱う
├── スクロールを止める
├── フォーカスを管理する
└── childrenを表示する
```

Modal自身は開閉用の`useState`を持ちません。

```jsx
<Modal isOpen={isMenuOpen} onClose={closeMenu}>
  {/* 表示したい中身 */}
</Modal>
```

このように外から状態を受け取る部品を、controlled componentとして考えます。

---

## 2. Modalのファイルを作る

```text
src/components/ui/Modal/
├── index.jsx
└── Modal.module.scss
```

まず最小の形を確認します。

```jsx
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div>
      <div role="dialog" aria-modal="true">
        <button type="button" onClick={onClose}>
          閉じる
        </button>
        {children}
      </div>
    </div>
  );
}
```

`children`は、開始タグと終了タグの間へ書いた内容です。

```jsx
<Modal>
  <nav>...</nav>
</Modal>
```

この`nav`がModal側の`{children}`へ入ります。

将来は同じ場所へ、次のような別の内容も渡せます。

```jsx
<Modal>
  <DramaDetail />
</Modal>
```

---

## 3. 背景クリックを区別する

背景に`onClick={onClose}`だけを書くと、Modal内部をクリックした場合もイベントが背景まで伝わって閉じます。

```jsx
const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    onClose();
  }
};
```

```text
event.target
→ 実際にクリックされた要素

event.currentTarget
→ onClickを書いた背景要素
```

両方が同じときだけ、背景そのものがクリックされたと判断します。

---

## 4. Portalでbody直下へ表示する

ModalはHeaderから呼び出しますが、見た目はページ全体を覆います。

```jsx
import { createPortal } from "react-dom";
```

```jsx
return createPortal(
  <div>{/* Modal */}</div>,
  document.body,
);
```

これにより、React上ではHeaderの子でも、実際のDOMでは`body`直下へ表示できます。親要素の`overflow`や重なり順の影響を受けにくくなります。

`document`はブラウザにしかないため、ブラウザで表示準備ができたかをstateで管理します。

```jsx
const [isReady, setIsReady] = useState(false);

useEffect(() => {
  setIsReady(true);
}, []);
```

---

## 5. useEffectの役割

`useEffect`は、Reactの表示結果をブラウザなど外部の仕組みと同期するときに使います。

今回のModalでは、次を行います。

```text
Modalが開いた
↓
bodyのスクロールを止める
キーボード操作を監視する
フォーカスをModal内へ移す

Modalが閉じた
↓
設定を元へ戻す
監視を解除する
元の要素へフォーカスを戻す
```

Effectの`return`で返す関数はcleanupです。JSXを返す`return`とは役割が違います。

```jsx
useEffect(() => {
  // 開いたときの設定

  return () => {
    // 閉じるとき・Effectをやり直す前の後始末
  };
}, [/* このEffectが反応する値 */]);
```

---

## 6. useRefの役割

このModalでは三つのrefを使います。

```jsx
const panelRef = useRef(null);
const previousFocusRef = useRef(null);
const onCloseRef = useRef(onClose);
```

```text
panelRef
→ 実際のModal要素を参照する

previousFocusRef
→ 開く前にフォーカスされていた要素を覚える

onCloseRef
→ 最新のonClose関数を覚える
```

`useState`は値が変わると表示を更新します。`useRef`は、表示更新を起こさずDOMや値を保持します。

親コンポーネントが再表示されると、親で宣言した関数は新しく作られる場合があります。キーボード監視をそのたびに付け直さないよう、最新の`onClose`をrefへ保存します。

```jsx
useEffect(() => {
  onCloseRef.current = onClose;
}, [onClose]);
```

---

## 7. フォーカスできる要素を探す

```jsx
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
```

Modal内から、この条件に合う表示中の要素を探します。

```jsx
const getFocusableItems = () =>
  Array.from(
    panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [],
  ).filter((element) => element.getClientRects().length > 0);
```

ページ全体ではなく、`panelRef.current`の中だけを検索することが重要です。

---

## 8. 完成したModal

```jsx
// src/components/ui/Modal/index.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./Modal.module.scss";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function Modal({
  isOpen,
  onClose,
  ariaLabel = "ダイアログ",
  children,
}) {
  const [isReady, setIsReady] = useState(false);
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isReady || !isOpen) return;

    previousFocusRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      const firstTarget = Array.from(
        panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [],
      ).find((element) => element.getClientRects().length > 0);

      firstTarget?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;

      const previousFocus = previousFocusRef.current;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [isOpen, isReady]);

  useEffect(() => {
    if (!isReady || !isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(
        panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [],
      ).filter((element) => element.getClientRects().length > 0);

      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const activeElement = document.activeElement;

      if (!panelRef.current?.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isReady]);

  if (!isReady || !isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="ダイアログを閉じる"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
```

最初のフォーカス対象は、Modal先頭の閉じるボタンです。そのため、キーボードだけでも必ず閉じられます。

---

## 9. ModalのSCSS

```scss
// src/components/ui/Modal/Modal.module.scss
@use "@/styles/shared" as shared;

.backdrop {
  position: fixed;
  z-index: shared.$z-modal;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 70%);
}

.panel {
  position: relative;
  width: min(100%, 960px);
  max-height: calc(100dvh - 40px);
  overflow: auto;
  color: shared.$color-text;
  background: shared.$color-background;
  border: 1px solid rgb(255 255 255 / 20%);
}

.closeButton {
  position: sticky;
  z-index: 1;
  top: 12px;
  display: grid;
  width: 44px;
  height: 44px;
  margin-inline: auto 12px;
  border: 1px solid currentcolor;
  color: inherit;
  background: shared.$color-background;
  cursor: pointer;
  place-items: center;
}

.closeButton:focus-visible {
  outline: 3px solid shared.$color-accent;
  outline-offset: 3px;
}

.content {
  padding: 24px;
}
```

`z-index`を直接大きな数字で書かず、第4章の共有値を使います。

---

## 10. MobileMenuをModalの中身にする

`MobileMenu`から表示・非表示の責務を外します。

```jsx
// src/components/layout/MobileMenu/index.jsx
import styles from "./MobileMenu.module.scss";

export default function MobileMenu({ links, onClose }) {
  return (
    <nav
      id="mobile-navigation"
      aria-label="モバイルナビゲーション"
    >
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
  );
}
```

`MobileMenu.module.scss`では、第7章の`.menu`を削除し、ナビゲーションの`.list`だけを残します。表示・非表示と背景はModalの責務になったためです。

Headerでは、次のように使います。

```jsx
import Modal from "@/components/ui/Modal";

<Modal
  isOpen={isMenuOpen}
  onClose={closeMenu}
  ariaLabel="メニュー"
>
  <MobileMenu
    links={navigationLinks}
    onClose={closeMenu}
  />
</Modal>
```

```text
Header
→ 開いているかを管理

Modal
→ ダイアログ共通の動作を管理

MobileMenu
→ ナビゲーションの内容を表示
```

三つの責務が分かれました。

---

## 11. マウスを使わず確認する

次の順番で確認します。

1. TabキーでMenuボタンへ移動する
2. Enterキーで開く
3. フォーカスが閉じるボタンへ移る
4. TabとShift + TabでModal内を移動する
5. Tabが背景へ抜けないことを確認する
6. Escapeキーで閉じる
7. Menuボタンへフォーカスが戻る
8. もう一度開き、背景クリックでも閉じる
9. Modal内部のクリックでは閉じない
10. 開いている間、背景をスクロールできない

ブラウザの見た目だけでなく、キーボード操作まで確認して完成です。

---

## 今日の確認

- [ ] Modalの状態は呼び出し側が持っている
- [ ] `children`で中身を入れ替えられる
- [ ] 背景と内部のクリックを区別できる
- [ ] `useEffect`とcleanupの役割を説明できる
- [ ] `useState`と`useRef`の違いを説明できる
- [ ] Escapeキーと閉じるボタンで閉じられる
- [ ] 背景スクロールが止まる
- [ ] フォーカスがModal内に留まる
- [ ] 閉じると呼び出し元へフォーカスが戻る
- [ ] ModalのSCSSがコンポーネントと同じ場所にある

## Git

```bash
git add .
git commit -m "Build reusable accessible modal"
```

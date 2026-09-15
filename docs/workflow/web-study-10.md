# 第10章　スクロールに合わせて要素を表示する

## 目的

元サイトの`IntersectionObserver`を、対象ごとに再利用できる`ScrollReveal`コンポーネントへ変更します。

```text
IntersectionObserver
↓
要素が表示範囲へ入る
↓
stateを更新する
↓
CSS Moduleのクラスが変わる
↓
transitionが動く
```

第8章で学んだ`useEffect`、cleanup、`useRef`の復習でもあります。

---

## 1. 元の実装との違い

元のJavaScriptでは、`querySelectorAll()`でページ全体から対象を探していました。

Reactでは、ScrollReveal自身が担当する一つの要素を`ref`で参照します。

```text
ページ全体から対象を探す
→ しない

コンポーネントが自分の要素をrefで参照する
→ 今回の方法
```

---

## 2. ファイルを作る

```text
src/components/ui/ScrollReveal/
├── index.jsx
└── ScrollReveal.module.scss
```

---

## 3. ScrollRevealを作る

```jsx
// src/components/ui/ScrollReveal/index.jsx
"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./ScrollReveal.module.scss";

const directionClasses = {
  up: styles.up,
  down: styles.down,
  left: styles.left,
  right: styles.right,
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  once = true,
  className = "",
}) {
  const elementRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -10%",
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  const classes = [
    styles.reveal,
    directionClasses[direction] ?? directionClasses.up,
    isInView ? styles.inView : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={elementRef}
      className={classes}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}
```

`directionClasses`によって、外から受け取った`up`などの値をCSS Modulesのクラスへ対応させています。

---

## 4. SCSSを作る

```scss
// src/components/ui/ScrollReveal/ScrollReveal.module.scss
.reveal {
  opacity: 0;
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}

.up {
  transform: translateY(24px);
}

.down {
  transform: translateY(-24px);
}

.left {
  transform: translateX(40px);
}

.right {
  transform: translateX(-40px);
}

.inView {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

動きを減らすOS設定を利用している場合は、アニメーションなしで最初から表示します。

---

## 5. DramaListへ適用する

`DramaList.jsx`で読み込みます。

```jsx
import ScrollReveal from "@/components/ui/ScrollReveal";
```

`map()`の中を次のように変更します。

```jsx
{dramas.map((drama, index) => (
  <ScrollReveal
    key={drama.id}
    direction="up"
    delay={(index % 3) * 100}
    className={styles.item}
  >
    <DramaCard
      drama={drama}
      number={index + 1}
      onSelect={onSelect}
    />
  </ScrollReveal>
))}
```

`key`は、`map()`が直接返す一番外側のScrollRevealへ移します。

`DramaList.module.scss`へ追加します。

```scss
.item {
  min-width: 0;
}
```

---

## 6. delayを増やし続けない

次の書き方では、作品数が多いほど待ち時間が増えます。

```jsx
delay={index * 100}
```

今回は3列の表示を想定し、列ごとに遅延を戻します。

```jsx
delay={(index % 3) * 100}
```

```text
1列目 → 0ms
2列目 → 100ms
3列目 → 200ms
4列目 → 0ms
```

演出のために、後ろの情報が長時間読めなくなる状態を避けます。

---

## 7. Effectとcleanupを確認する

```text
コンポーネントを表示
↓
observer.observe(element)

コンポーネントを外す
↓
observer.disconnect()
```

Modalではイベント監視を解除しました。ScrollRevealではObserverを解除します。

対象は違いますが、外部の仕組みと同期し、最後に片付ける考え方は同じです。

---

## 今日の確認

- [ ] ScrollRevealが自分の要素をrefで参照している
- [ ] 要素が表示範囲へ入るとstateが変わる
- [ ] CSS Modulesのクラスによって表示が変わる
- [ ] 一度表示した要素を監視から外した
- [ ] コンポーネント終了時にObserverを解除した
- [ ] `key`をmap直下の要素へ付けた
- [ ] `prefers-reduced-motion`へ対応した
- [ ] 遅延が増え続けないことを確認した

## Git

```bash
git add .
git commit -m "Add reusable scroll reveal animation"
```

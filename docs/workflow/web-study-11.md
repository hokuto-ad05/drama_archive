# 第11章　SwiperでHeroスライドを作る

## 目的

複数のHero画像を一定時間ごとに切り替えるスライドを、Swiperで実装します。

この章では、ライブラリへ任せる部分と、自分たちで管理する部分を分けます。

```text
Swiperへ任せる
→ スライド移動、タッチ操作、ループ、自動再生

自分たちで管理する
→ 画像データ、見た目、再生・停止ボタン、利用者への配慮
```

---

## 1. ライブラリを使う理由

スライドを一から作る場合、次の処理が必要です。

- 現在の画像を管理する
- 一定時間で次へ移動する
- 最後から最初へ戻る
- タッチ操作へ対応する
- アニメーションを管理する
- キーボードや支援技術へ対応する

一般的なUIは、実績のあるライブラリを利用する選択肢があります。ただし、導入しただけでアクセシビリティやデザインが完成するわけではありません。

---

## 2. Swiperをインストールする

```bash
npm install swiper
```

インストール後、`package.json`へSwiperが追加されたことを確認します。

---

## 3. Heroのファイルを作る

```text
src/components/contents/
├── Hero.jsx
└── Hero.module.scss
```

Swiperはブラウザ上で動くため、HeroをClient Componentにします。

```jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/a11y";

import styles from "./Hero.module.scss";
```

```text
Swiper
→ スライド全体

SwiperSlide
→ 一枚ずつのスライド

Autoplay
→ 自動再生

A11y
→ スライドの状態を支援技術へ伝える補助
```

---

## 4. 画像を配列にする

画像を`public/pict`へ置きます。

```text
public/pict/
├── hero01.avif
├── hero02.avif
└── hero03.avif
```

画像情報を配列にします。

```jsx
const heroImages = [
  { src: "/pict/hero01.avif", alt: "" },
  { src: "/pict/hero02.avif", alt: "" },
  { src: "/pict/hero03.avif", alt: "" },
];
```

背景演出として使い、画像内の情報をキャッチコピーでも伝えているため、ここでは`alt`を空にしています。画像自体に重要な情報がある場合は、その内容を`alt`へ書きます。

---

## 5. mapでスライドを作る

```jsx
{heroImages.map((image, index) => (
  <SwiperSlide key={image.src}>
    <div className={styles.image}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        preload={index === 0}
      />
    </div>
  </SwiperSlide>
))}
```

4枚目を追加するときは、JSXを複製せず配列へ一件追加します。

```text
画像データを追加
↓
map()がSwiperSlideを追加
```

第6章の作品カードと同じ考え方です。

---

## 6. 自動再生を止められるようにする

自動で動き続ける表示には、一時停止できるボタンを用意します。

Swiper本体をstateへ保存します。

```jsx
const [swiper, setSwiper] = useState(null);
const [isPlaying, setIsPlaying] = useState(true);
```

再生・停止を切り替えます。

```jsx
const toggleAutoplay = () => {
  if (!swiper) return;

  if (swiper.autoplay.running) {
    swiper.autoplay.stop();
    setIsPlaying(false);
  } else {
    swiper.autoplay.start();
    setIsPlaying(true);
  }
};
```

動きを減らすOS設定の場合は、最初の自動再生を止めます。

```jsx
useEffect(() => {
  if (!swiper) return;

  const mediaQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const stopWhenReduced = () => {
    if (mediaQuery.matches) {
      swiper.autoplay.stop();
      setIsPlaying(false);
    }
  };

  stopWhenReduced();
  mediaQuery.addEventListener("change", stopWhenReduced);

  return () => {
    mediaQuery.removeEventListener("change", stopWhenReduced);
  };
}, [swiper]);
```

OS設定によって停止した後でも、利用者が再生ボタンを押せば自分の意思で再開できます。

---

## 7. Heroの完成コード

```jsx
// src/components/contents/Hero.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/a11y";

import styles from "./Hero.module.scss";

const heroImages = [
  { src: "/pict/hero01.avif", alt: "" },
  { src: "/pict/hero02.avif", alt: "" },
  { src: "/pict/hero03.avif", alt: "" },
];

export default function Hero() {
  const [swiper, setSwiper] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!swiper) return;

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const stopWhenReduced = () => {
      if (mediaQuery.matches) {
        swiper.autoplay.stop();
        setIsPlaying(false);
      }
    };

    stopWhenReduced();
    mediaQuery.addEventListener("change", stopWhenReduced);

    return () => {
      mediaQuery.removeEventListener("change", stopWhenReduced);
    };
  }, [swiper]);

  const toggleAutoplay = () => {
    if (!swiper) return;

    if (swiper.autoplay.running) {
      swiper.autoplay.stop();
      setIsPlaying(false);
    } else {
      swiper.autoplay.start();
      setIsPlaying(true);
    }
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Swiper
        className={styles.slider}
        modules={[Autoplay, A11y]}
        loop
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        a11y={{
          enabled: true,
          containerMessage: "Drama Archive メインビジュアル",
        }}
        onSwiper={setSwiper}
        onAutoplayStart={() => setIsPlaying(true)}
        onAutoplayStop={() => setIsPlaying(false)}
      >
        {heroImages.map((image, index) => (
          <SwiperSlide key={image.src}>
            <div className={styles.image}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="100vw"
                preload={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={styles.copy}>
        <h1 id="hero-title">Drama Archive</h1>
        <p>Stories that stay with us.</p>
      </div>

      <button
        type="button"
        className={styles.autoplayButton}
        onClick={toggleAutoplay}
        disabled={!swiper}
      >
        {isPlaying ? "スライドを一時停止" : "スライドを再生"}
      </button>
    </section>
  );
}
```

ボタンの文字も現在の状態に合わせて変えるため、次に実行できる操作が分かります。

---

## 8. HeroのSCSS

```scss
// src/components/contents/Hero.module.scss
@use "@/styles/shared" as shared;

.hero {
  position: relative;
  width: 100%;
  height: 70svh;
  min-height: 500px;
  overflow: hidden;
}

.slider,
.image {
  width: 100%;
  height: 100%;
}

.image {
  position: relative;

  img {
    object-fit: cover;
  }
}

.copy {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  width: calc(100% - 40px);
  text-align: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.autoplayButton {
  position: absolute;
  z-index: 3;
  right: 20px;
  bottom: 20px;
  min-height: 44px;
  padding: 8px 16px;
  border: 1px solid currentcolor;
  color: shared.$color-text;
  background: rgb(0 0 0 / 70%);
  cursor: pointer;
}

.autoplayButton:focus-visible {
  outline: 3px solid shared.$color-accent;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .slider * {
    transition-duration: 0.01ms !important;
  }
}
```

キャッチコピーはSwiperの外側に置いているため、画像が変わっても同じ位置に残ります。

---

## 9. page.jsへ配置する

```jsx
// src/app/page.js
import Hero from "@/components/contents/Hero";
import DramaArchive from "@/components/contents/DramaArchive";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main>
      <Hero />

      <div className={styles.main}>
        <DramaArchive />
      </div>
    </main>
  );
}
```

Heroは画面幅いっぱい、DramaArchiveは第4章で決めたコンテンツ幅に収めています。

---

## 10. ライブラリの境界を確認する

Swiperへ渡している主な設定は次のとおりです。

```text
modules
→ 使う機能

loop
→ 最後から最初へ戻る

autoplay
→ 自動再生の間隔と動作

onSwiper
→ 作成されたSwiper本体を受け取る
```

一方、画像配列、キャッチコピー、停止ボタン、SCSSは自分たちの責務です。

パッケージを導入したときは、`package.json`と`package-lock.json`もGitへ記録します。将来更新するときは、表示と操作を確認してからバージョンを上げます。

---

## 今日の確認

- [ ] Swiperをインストールした
- [ ] HeroをClient Componentにした理由を説明できる
- [ ] 画像配列からスライドを生成した
- [ ] 最初の画像だけをpreloadした
- [ ] 自動再生をボタンで停止・再開できる
- [ ] 動きを減らすOS設定では最初に停止する
- [ ] A11yモジュールを追加した
- [ ] HeroのスタイルをCSS Moduleへ置いた
- [ ] ライブラリと自作部分の責務を区別できる

## Git

```bash
git add .
git commit -m "Add controllable hero slider with Swiper"
```

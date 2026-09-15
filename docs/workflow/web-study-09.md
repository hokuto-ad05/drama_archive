# 第9章　カードのModalを作る ― 応用問題と解答

## 目的

ここまでに作った仕組みを組み合わせ、選択した作品の詳細を共通Modalへ表示します。

```text
dramas
↓
map()でカードを表示
↓
カードを選択
↓
選択した作品をstateへ保存
↓
共通ModalへDramaDetailを渡す
```

新しいHookやModalを作る章ではありません。第5〜8章の応用です。

---

## 1. 完成コードを見る前に考える

次の問いを考えてください。

1. 「開いているか」だけでなく「どの作品か」を覚えるには、stateへ何を入れればよいか
2. `isModalOpen`という別のBoolean stateも必要か
3. DramaCardはModalの状態を持つべきか
4. DramaListは何を親から受け取り、子へ渡せばよいか
5. 共通Modalの中身を作品詳細へ変えるには何を使うか

自分の考えを短くメモしてから、次へ進んでください。

---

## 2. 選択作品をstateへ入れる

Headerでは、開閉だけを表すBooleanを使いました。

```jsx
const [isMenuOpen, setIsMenuOpen] = useState(false);
```

作品Modalでは、どの作品を表示するかも必要です。

```jsx
const [selectedDrama, setSelectedDrama] = useState(null);
```

```text
null
→ 何も選択されていない
→ Modalは閉じている

作品オブジェクト
→ その作品が選択されている
→ Modalは開いている
```

そのため、別の`isModalOpen`は必要ありません。

```jsx
isOpen={selectedDrama !== null}
```

一つの事実を二つのstateで管理すると、片方だけ更新される可能性があります。必要な状態を既存のstateから判断できる場合は、重複して持ちません。

---

## 3. DramaDetailを作る

```text
src/components/contents/
├── DramaDetail.jsx
└── DramaDetail.module.scss
```

```jsx
// src/components/contents/DramaDetail.jsx
import styles from "./DramaDetail.module.scss";

export default function DramaDetail({ drama }) {
  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Drama Review</p>
        <h2>{drama.title}</h2>
        <p>{drama.reviewTitle}</p>
      </header>

      <div className={styles.image}>
        <img src={drama.image} alt="" />
      </div>

      <div className={styles.review}>
        {drama.review.map((paragraph, index) => (
          <p key={`${drama.id}-review-${index}`}>
            {paragraph}
          </p>
        ))}
      </div>

      {drama.youtubeId && (
        <div className={styles.movie}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${drama.youtubeId}`}
            title={`${drama.title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </article>
  );
}
```

レビュー段落は内容が同じになる可能性があるため、本文そのものを`key`にはしません。作品IDと段落の位置を組み合わせます。

```scss
// src/components/contents/DramaDetail.module.scss
.detail {
  display: grid;
  gap: 32px;
}

.header,
.review {
  display: grid;
  gap: 12px;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
}

.image {
  overflow: hidden;
  aspect-ratio: 16 / 9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.movie {
  aspect-ratio: 16 / 9;

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
}
```

`DramaDetail`は表示だけを担当し、stateを持ちません。

---

## 4. DramaCardから選択を伝える

第6章のDramaCardへ、`onSelect`を追加します。

カード全体を無理にクリック要素にせず、操作のためのbuttonを用意します。

```jsx
// src/components/contents/DramaCard.jsx
import styles from "./DramaCard.module.scss";

export default function DramaCard({ drama, number, onSelect }) {
  const genres = drama.genres.join(" · ");

  return (
    <article className={styles.card}>
      <div className={styles.image}>
        <img src={drama.image} alt="" />
      </div>

      <div className={styles.heading}>
        <h3 className={styles.title}>
          <span className={styles.number}>
            {String(number).padStart(2, "0")}
          </span>
          {drama.title}
        </h3>
        <span className={styles.score}>{drama.score}/10</span>
      </div>

      <p className={styles.information}>
        {drama.seasons} seasons / {genres}
        <br />
        {drama.year} / {drama.platform}
      </p>

      <button
        type="button"
        className={styles.detailButton}
        onClick={() => onSelect(drama)}
        aria-haspopup="dialog"
      >
        レビューを見る
      </button>
    </article>
  );
}
```

buttonはTabキーで選択でき、Enter・Spaceキーでも実行できます。

```scss
// DramaCard.module.scssへ追加
.detailButton {
  min-height: 44px;
  padding: 8px 16px;
  cursor: pointer;
}
```

DramaCardの責務は、Modalを直接開くことではありません。

```text
自分が選ばれた
→ onSelect(drama)で親へ伝える
```

だけです。

---

## 5. DramaListは関数を子へ渡す

```jsx
// src/components/contents/DramaList.jsx
import DramaCard from "./DramaCard";
import styles from "./DramaList.module.scss";

export default function DramaList({ dramas, onSelect }) {
  return (
    <section id="dramas" aria-labelledby="dramas-title">
      <h2 id="dramas-title" className={styles.title}>
        Dramas
      </h2>

      <div className={styles.list}>
        {dramas.map((drama, index) => (
          <DramaCard
            key={drama.id}
            drama={drama}
            number={index + 1}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
```

DramaListも選択状態を持ちません。親から受け取った関数を、必要な子へ渡します。

```text
DramaArchive
    │ onSelect
    ↓
DramaList
    │ onSelect
    ↓
DramaCard
    │ onSelect(drama)
    ↓
DramaArchiveのstateが変わる
```

---

## 6. DramaArchiveでstateとModalを管理する

```jsx
// src/components/contents/DramaArchive.jsx
"use client";

import { useState } from "react";

import { dramas } from "@/data/dramas";
import Modal from "@/components/ui/Modal";

import FeaturedDrama from "./FeaturedDrama";
import DramaList from "./DramaList";
import DramaDetail from "./DramaDetail";
import styles from "./DramaArchive.module.scss";

export default function DramaArchive() {
  const [selectedDrama, setSelectedDrama] = useState(null);
  const featuredDrama = dramas.find((drama) => drama.featured);

  const closeModal = () => {
    setSelectedDrama(null);
  };

  return (
    <div className={styles.archive}>
      <FeaturedDrama drama={featuredDrama} />

      <DramaList
        dramas={dramas}
        onSelect={setSelectedDrama}
      />

      <Modal
        isOpen={selectedDrama !== null}
        onClose={closeModal}
        ariaLabel={
          selectedDrama
            ? `${selectedDrama.title}のレビュー`
            : "作品レビュー"
        }
      >
        {selectedDrama && (
          <DramaDetail drama={selectedDrama} />
        )}
      </Modal>
    </div>
  );
}
```

ここで初めてDramaArchiveをClient Componentへ変更します。

```text
第6章
表示するだけ
→ Server Component

第9章
利用者の選択をstateで管理する
→ Client Component
```

`"use client"`を書いたファイルから読み込むDramaList、DramaCard、DramaDetailも、同じClient Component側のまとまりとして動きます。それぞれのファイルへ`"use client"`を重ねて書く必要はありません。

---

## 7. 共通Modalは変更しない

Headerでは、Modalの中へMobileMenuを入れました。

```jsx
<Modal>
  <MobileMenu />
</Modal>
```

今回はDramaDetailを入れています。

```jsx
<Modal>
  <DramaDetail />
</Modal>
```

Modalが担当する動作は同じです。

- 背景
- 閉じるボタン
- Escapeキー
- 背景スクロール停止
- フォーカス管理
- Portal

中身だけを`children`で差し替えています。作品Modalを作るために、`Modal/index.jsx`へ作品固有のコードを追加してはいけません。

---

## 8. 解答

### 問題1

選択された作品オブジェクトをstateへ入れます。

```jsx
const [selectedDrama, setSelectedDrama] = useState(null);
```

### 問題2

別のBoolean stateは必要ありません。

```jsx
selectedDrama !== null
```

から開閉を判断できます。

### 問題3

DramaCardはstateを持ちません。`onSelect(drama)`によって選択を親へ伝えます。

### 問題4

DramaListは`onSelect`を受け取り、各DramaCardへ渡します。

### 問題5

`children`を使います。同じModalへDramaDetailを渡します。

---

## 9. 動作を確認する

マウスだけでなく、キーボードでも確認します。

1. Tabキーで各カードの「レビューを見る」へ移動する
2. Enterキーで作品を開く
3. 選択した作品の情報が表示される
4. Escapeキーで閉じる
5. 選択したカードのボタンへフォーカスが戻る
6. 別の作品を開き、内容が変わる
7. 閉じるボタンと背景クリックでも閉じる

---

## 今日の確認

- [ ] 選択作品をstateへ保存した
- [ ] Boolean以外もstateに持てることを理解した
- [ ] stateを重複して持たずModalの開閉を判断した
- [ ] `onSelect`を親から子へ渡した
- [ ] DramaCardの責務を「選択を伝える」に限定した
- [ ] DramaDetailを表示だけのコンポーネントにした
- [ ] 共通Modalを変更せず別用途へ再利用した
- [ ] Client Componentに変わった範囲を説明できる

## Git

```bash
git add .
git commit -m "Open drama details with reusable modal"
```

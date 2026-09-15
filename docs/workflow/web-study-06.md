# 第6章　mapとpropsで作品を表示する

## 目的

第5章で作ったデータから、作品カードと注目作品を生成します。

この章で作る流れは次のとおりです。

```text
dramas.js
↓
DramaArchive
├── FeaturedDrama
└── DramaList
    └── DramaCard × 作品数
```

この章では表示だけを作ります。カードのクリックとModalは、必要な仕組みを学んだ第9章で追加します。

---

## 1. コンポーネントを作る

```text
src/components/contents/
├── DramaArchive.jsx
├── DramaArchive.module.scss
├── FeaturedDrama.jsx
├── FeaturedDrama.module.scss
├── DramaList.jsx
├── DramaList.module.scss
├── DramaCard.jsx
└── DramaCard.module.scss
```

コンポーネントと、そのコンポーネントだけで使うSCSSを同じ場所に置きます。

---

## 2. DramaCardは一作品の表示を担当する

```jsx
// src/components/contents/DramaCard.jsx
import styles from "./DramaCard.module.scss";

export default function DramaCard({ drama, number }) {
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
    </article>
  );
}
```

`DramaCard`は、作品データを自分で探しません。

```jsx
function DramaCard({ drama, number })
```

として、親から`props`で受け取ります。

画像の`alt`を空にしているのは、すぐ下に同じ作品名があり、画像が装飾として使われているためです。

---

## 3. カードのスタイルを移す

元CSSにある作品カードの指定を`DramaCard.module.scss`へ移します。

```scss
// src/components/contents/DramaCard.module.scss
@use "@/styles/shared" as shared;

.card {
  display: grid;
  gap: 16px;
}

.image {
  overflow: hidden;
  aspect-ratio: 3 / 2;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.heading {
  display: flex;
  gap: 16px;
  align-items: baseline;
  justify-content: space-between;
}

.title,
.information {
  margin: 0;
}

.number,
.score {
  color: shared.$color-accent;
}
```

実際の見た目に必要な値は、元サイトと比較しながら移してください。

---

## 4. DramaListで一覧を生成する

```jsx
// src/components/contents/DramaList.jsx
import DramaCard from "./DramaCard";
import styles from "./DramaList.module.scss";

export default function DramaList({ dramas }) {
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
          />
        ))}
      </div>
    </section>
  );
}
```

```scss
// src/components/contents/DramaList.module.scss
@use "@/styles/shared" as shared;

.title {
  margin-block-end: 32px;
}

.list {
  display: grid;
  gap: 40px 24px;

  @include shared.mq(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include shared.mq(lg) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

`map()`は元の配列を順番に見て、各データから新しい表示を作ります。

```text
dramasに6作品ある
↓
map()が6回処理する
↓
DramaCardが6個表示される
```

`key={drama.id}`は画面には表示されません。Reactが各カードを安定して識別するために使います。

---

## 5. featuredから注目作品を選ぶ

第5章のデータには、次の値があります。

```js
featured: true
```

`find()`を使い、条件に合う最初の作品を取得します。

```jsx
const featuredDrama = dramas.find((drama) => drama.featured);
```

```text
map()
→ 配列の全件から表示を作る

find()
→ 条件に合う一件を取得する
```

Featured表示を作ります。

```jsx
// src/components/contents/FeaturedDrama.jsx
import styles from "./FeaturedDrama.module.scss";

export default function FeaturedDrama({ drama }) {
  if (!drama) return null;

  return (
    <section
      id="featured"
      className={styles.featured}
      aria-labelledby="featured-title"
    >
      <div className={styles.image}>
        <img src={drama.image} alt="" />
      </div>

      <div className={styles.content}>
        <p>Featured Drama</p>
        <h1 id="featured-title">{drama.title}</h1>
        <p>{drama.quote}</p>
        {drama.quoteBy && <p>— {drama.quoteBy}</p>}
      </div>
    </section>
  );
}
```

`if (!drama) return null;`があるため、`featured: true`の作品がなくてもエラーになりません。

```scss
// src/components/contents/FeaturedDrama.module.scss
@use "@/styles/shared" as shared;

.featured {
  display: grid;
  gap: 24px;

  @include shared.mq(md) {
    grid-template-columns: minmax(0, 3fr) minmax(280px, 2fr);
    align-items: center;
  }
}

.image {
  overflow: hidden;
  aspect-ratio: 3 / 2;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.content {
  display: grid;
  gap: 16px;
}
```

元サイトにFeatured固有の指定がある場合も、このファイルへ移します。

---

## 6. DramaArchiveで組み合わせる

```jsx
// src/components/contents/DramaArchive.jsx
import { dramas } from "@/data/dramas";

import FeaturedDrama from "./FeaturedDrama";
import DramaList from "./DramaList";
import styles from "./DramaArchive.module.scss";

export default function DramaArchive() {
  const featuredDrama = dramas.find((drama) => drama.featured);

  return (
    <div className={styles.archive}>
      <FeaturedDrama drama={featuredDrama} />
      <DramaList dramas={dramas} />
    </div>
  );
}
```

```scss
// src/components/contents/DramaArchive.module.scss
.archive {
  display: grid;
  gap: 96px;
}
```

`page.js`から呼び出します。

```jsx
// src/app/page.js
import DramaArchive from "@/components/contents/DramaArchive";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <DramaArchive />
    </main>
  );
}
```

`DramaArchive`は状態やイベントを持たないため、今はServer Componentのままです。`"use client"`は書きません。

---

## 7. データを変更して確かめる

次を一つずつ試してください。

1. `dramas`へ作品を一件追加する
2. 配列内の作品の順番を変える
3. `featured: true`を別の作品へ移す

JSXを複製しなくても、一覧、番号、Featured表示が変われば成功です。

---

## 今日の確認

- [ ] `map()`から作品カードを生成できた
- [ ] `key`に安定したIDを使用した
- [ ] 親から子へpropsで作品データを渡した
- [ ] `join()`でジャンルの配列を表示した
- [ ] `find()`で注目作品を取得した
- [ ] CSS Modulesへカードと一覧のスタイルを移した
- [ ] データ変更だけで一覧とFeatured表示が変わった
- [ ] この段階ではクリック処理を追加していない

## Git

```bash
git add .
git commit -m "Render drama content from structured data"
```

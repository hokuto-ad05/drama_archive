# 第12章　データを絞り込み・並べ替える

## 目的

作品データを表示するだけでなく、利用者が選んだ条件から表示内容を組み立てます。

```text
元のdramas
↓
filter()で絞り込む
↓
sort()で並べ替える
↓
map()で表示する
```

元データは変更せず、現在の条件から表示用の配列を作ることが重要です。

---

## 1. 絞り込み条件をstateで持つ

`DramaArchive.jsx`へ二つのstateを追加します。

```jsx
const [selectedGenre, setSelectedGenre] = useState("all");
const [sortOrder, setSortOrder] = useState("default");
```

```text
selectedGenre
→ どのジャンルを表示するか

sortOrder
→ どの順番で表示するか
```

これらは利用者の操作によって画面表示が変わるため、`useRef`ではなく`useState`を使います。

---

## 2. データからジャンル一覧を作る

選択肢も作品データから作ります。

```jsx
const genres = [
  ...new Set(dramas.flatMap((drama) => drama.genres)),
];
```

処理を分けて考えます。

```text
flatMap()
→ 全作品のgenresを一つの配列にする

new Set()
→ 重複を取り除く

[...]
→ 再び配列にする
```

ジャンルをコードへ直接二重管理しないため、新しいジャンルを作品データへ追加すると選択肢にも反映されます。

---

## 3. 表示用の配列を作る

```jsx
const filteredDramas =
  selectedGenre === "all"
    ? dramas
    : dramas.filter((drama) =>
        drama.genres.includes(selectedGenre),
      );
```

続いて、絞り込んだ結果を並べ替えます。

```jsx
const visibleDramas = [...filteredDramas].sort((a, b) => {
  if (sortOrder === "score-desc") {
    return b.score - a.score;
  }

  if (sortOrder === "year-desc") {
    return b.year - a.year;
  }

  return dramas.indexOf(a) - dramas.indexOf(b);
});
```

`[...filteredDramas]`で配列を複製してから`sort()`しています。元の`dramas`を直接並べ替えないためです。

`visibleDramas`は新しいstateではありません。既存のデータとstateから計算できる値です。

---

## 4. DramaControlsを作る

```text
src/components/contents/
├── DramaControls.jsx
└── DramaControls.module.scss
```

```jsx
// src/components/contents/DramaControls.jsx
import styles from "./DramaControls.module.scss";

export default function DramaControls({
  genres,
  selectedGenre,
  sortOrder,
  onGenreChange,
  onSortChange,
}) {
  return (
    <div className={styles.controls}>
      <label className={styles.field}>
        <span>ジャンル</span>
        <select
          value={selectedGenre}
          onChange={(event) => onGenreChange(event.target.value)}
        >
          <option value="all">すべて</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>並び順</span>
        <select
          value={sortOrder}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="default">登録順</option>
          <option value="score-desc">評価が高い順</option>
          <option value="year-desc">公開年が新しい順</option>
        </select>
      </label>
    </div>
  );
}
```

DramaControlsは、現在値をpropsで受け取り、変更を関数で親へ伝えます。作品データの絞り込みは担当しません。

```scss
// src/components/contents/DramaControls.module.scss
@use "@/styles/shared" as shared;

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-block-end: 32px;
}

.field {
  display: grid;
  gap: 8px;
}

.field select {
  min-height: 44px;
  padding-inline: 12px;
}

.field select:focus-visible {
  outline: 3px solid shared.$color-accent;
  outline-offset: 2px;
}
```

---

## 5. DramaListに該当件数を表示する

`DramaList`へ渡す配列を`visibleDramas`へ変更します。

```jsx
<DramaList
  dramas={visibleDramas}
  onSelect={setSelectedDrama}
/>
```

DramaListでは、0件の場合も説明します。

```jsx
<p aria-live="polite">
  {dramas.length}作品を表示しています
</p>

{dramas.length === 0 ? (
  <p>条件に合う作品はありません。</p>
) : (
  <div className={styles.list}>
    {/* これまでのmap() */}
  </div>
)}
```

`aria-live="polite"`により、操作後に件数が変わったことを支援技術へ伝えられます。

---

## 6. DramaArchiveへ組み込む

ファイルの先頭で読み込みます。

```jsx
import DramaControls from "./DramaControls";
```

`DramaArchive.jsx`の主要部分は次のようになります。

```jsx
const [selectedDrama, setSelectedDrama] = useState(null);
const [selectedGenre, setSelectedGenre] = useState("all");
const [sortOrder, setSortOrder] = useState("default");

const featuredDrama = dramas.find((drama) => drama.featured);

const genres = [
  ...new Set(dramas.flatMap((drama) => drama.genres)),
];

const filteredDramas =
  selectedGenre === "all"
    ? dramas
    : dramas.filter((drama) =>
        drama.genres.includes(selectedGenre),
      );

const visibleDramas = [...filteredDramas].sort((a, b) => {
  if (sortOrder === "score-desc") return b.score - a.score;
  if (sortOrder === "year-desc") return b.year - a.year;
  return dramas.indexOf(a) - dramas.indexOf(b);
});
```

JSXへ追加します。

```jsx
<DramaControls
  genres={genres}
  selectedGenre={selectedGenre}
  sortOrder={sortOrder}
  onGenreChange={setSelectedGenre}
  onSortChange={setSortOrder}
/>

<DramaList
  dramas={visibleDramas}
  onSelect={setSelectedDrama}
/>
```

---

## 7. データの流れを確認する

```text
利用者がジャンルを選ぶ
↓
selectedGenreが変わる
↓
filteredDramasを計算し直す
↓
visibleDramasが変わる
↓
DramaListが新しい配列をmap()する
```

DOMを直接削除・追加していません。データとstateから、その時点で必要な表示をReactに作ってもらっています。

---

## 今日の確認

- [ ] `filter()`で条件に合う作品を取得した
- [ ] 複製した配列を`sort()`した
- [ ] 元の`dramas`を直接変更していない
- [ ] ジャンル選択肢も作品データから生成した
- [ ] 計算できる値を重複したstateにしなかった
- [ ] 0件の場合の表示を用意した
- [ ] 操作から再表示までのデータの流れを説明できる

## Git

```bash
git add .
git commit -m "Filter and sort dramas from shared data"
```

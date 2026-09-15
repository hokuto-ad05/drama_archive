# 第5章　作品情報をデータへ分離する

## 目的

作品ごとにHTMLを複製する状態から、作品の内容を一つのデータとして管理する状態へ変更します。

```text
変更前
作品の内容 + HTML + 見た目

変更後
作品の内容 → data
画面の形   → component
見た目     → SCSS Module
```

この章では、まだ`map()`で表示しません。まず、画面から独立したデータを完成させます。

---

## 1. データファイルを作る

```text
src/
└── data/
    └── dramas.js
```

```js
// src/data/dramas.js
export const dramas = [
  {
    id: "true-detective",
    title: "True Detective",
    image: "/pict/truedetective.avif",
    score: 10,
    seasons: 4,
    genres: ["Crime", "Mystery"],
    year: 2014,
    platform: "HBO",
    featured: true,
    large: false,
    quote: "“The World needs bad men.”",
    quoteBy: "Rust Cohle",
    youtubeId: "jdu3hAAmFtk",
    reviewTitle: "マスターピース",
    review: [
      "1シーズン完結型。シーズンごとに内容が大きく異なる。",
      "どのシーズンも素晴らしいのだが、やはりシーズン1が別格。",
    ],
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    image: "/pict/strangerthings.avif",
    score: 9,
    seasons: 5,
    genres: ["SF", "Juvenile"],
    year: 2016,
    platform: "Netflix",
    featured: false,
    large: false,
    quote: "",
    quoteBy: "",
    youtubeId: "6HkQ5ys3vEY",
    reviewTitle: "三つ星レストランのジャンル全盛り丼",
    review: [
      "Netflixの看板ドラマの一つ。加入したらまず観てほしい名作。",
    ],
  },
];
```

元HTMLにある全作品を、同じプロパティ名で追加してください。

---

## 2. データの形を揃える

同じ種類のデータは、同じプロパティ名とデータ型を使います。

```text
title    → 文字列
score    → 数値
genres   → 文字列の配列
featured → true / false
review   → 文字列の配列
```

ある作品だけ`genre`、別の作品では`genres`としないようにします。

値がない場合の扱いも揃えます。この教材では、任意の短い文字列は空文字、複数の値は空配列を使います。

```js
quote: "",
review: [],
```

`undefined`、`null`、空文字を理由なく混在させないことが、チームでデータを扱うときの基本です。

---

## 3. IDの役割

`id`は、次の用途で使います。

- Reactが一覧の各項目を識別する
- 選択された作品を識別する
- 将来、作品ごとのURLを作る
- テストや管理画面から作品を探す

タイトルは将来変更される可能性があります。IDには、半角英数字とハイフンを使った、重複しない安定した値を付けます。

```js
id: "true-detective"
```

---

## 4. 段落を配列にする理由

レビュー全文を一つの長い文字列にせず、段落ごとの配列にします。

```js
review: [
  "一つ目の段落です。",
  "二つ目の段落です。",
]
```

この形なら、後の章で次のように一段落ずつ表示できます。

```jsx
{drama.review.map((paragraph) => (
  <p>{paragraph}</p>
))}
```

データの形は、表示するときの扱いやすさにも関係します。

---

## 5. データに入れないもの

次のような具体的な見た目は、データへ入れません。

```js
color: "yellow",
fontSize: "24px",
marginTop: "20px",
```

色や余白を変更するたびにデータを修正することになるためです。

一方、次の値は表示上の意味を表しているため、データとして持てます。

```js
featured: true,
large: false,
```

```text
何を表示するか、どんな意味か
→ data

どんな色・大きさ・配置にするか
→ SCSS
```

---

## 6. データだけを変更して確認する

この段階ではまだ新しい一覧表示を作っていません。次の点をファイルだけで確認します。

- 作品を一件追加できる
- 作品の順番を入れ替えられる
- すべての作品に重複しないIDがある
- すべての作品でプロパティ名が揃っている
- レビュー全文が失われていない

データ移行後も、元HTMLは比較用として`tmp`に残します。

---

## 今日の確認

- [ ] 全作品を`dramas`配列へ移した
- [ ] 各作品のデータの形が揃っている
- [ ] 全作品に重複しないIDがある
- [ ] レビューを段落の配列にした
- [ ] 内容と具体的な見た目を分けた
- [ ] データだけを見て作品情報を更新できる

## Git

```bash
git add .
git commit -m "Move drama content into structured data"
```

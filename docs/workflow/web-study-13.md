# 第13章　チームで確認できる制作基準を作る

## 目的

完成したサイトを「自分のPCでは動く」状態から、別の制作者が確認・修正・引き継ぎできる状態へ進めます。

チーム制作では、コードの書き方だけでなく、変更理由と確認方法を共有することが重要です。

---

## 1. 現在のファイル構成を確認する

```text
src/
├── app/
│   ├── globals.scss
│   ├── layout.js
│   ├── page.js
│   └── page.module.scss
├── components/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── MobileMenu/
│   ├── contents/
│   │   ├── Hero.jsx
│   │   ├── DramaArchive.jsx
│   │   ├── FeaturedDrama.jsx
│   │   ├── DramaControls.jsx
│   │   ├── DramaList.jsx
│   │   ├── DramaCard.jsx
│   │   ├── DramaDetail.jsx
│   │   └── 各コンポーネントの.module.scss
│   └── ui/
│       ├── Modal/
│       └── ScrollReveal/
├── data/
│   └── dramas.js
└── styles/
    ├── _base.scss
    ├── reset.css
    └── shared/
```

各フォルダの責務を説明できないファイルがあれば、置き場所を見直します。

---

## 2. READMEへ制作ルールを書く

READMEへ、少なくとも次を追加します。

````md
## 開発方法

```bash
npm install
npm run dev
```

## 確認コマンド

```bash
npm run lint
npm run lint:styles
npm run build
```

## ファイルの役割

- `app`: ページ、layout、全体スタイル
- `components/layout`: 全ページ共通の構造
- `components/contents`: Drama Archive固有の表示
- `components/ui`: 内容に依存しない再利用UI
- `data`: 表示する内容
- `styles/shared`: 複数のSCSSから使う値とmixin

## スタイルルール

- サイト全体の指定だけをglobalへ置く
- コンポーネント固有の指定はCSS Modulesへ置く
- CSS Modulesのクラス名はcamelCaseにする
- 色、ブレークポイント、z-indexは共有値を確認する
- 新しい共通値は、二か所以上で必要になってから追加を検討する
````

READMEは完成報告ではなく、次の人が作業を始めるための入口です。

---

## 3. 自動確認を実行する

```bash
npm run lint
npm run lint:styles
npm run build
```

役割は次のとおりです。

```text
lint
→ JavaScript・JSXの問題を確認

lint:styles
→ CSS・SCSSの問題を確認

build
→ 公開用データを最後まで作れるか確認
```

警告を数だけ減らすのではなく、メッセージを読み、どの制作ルールに反しているか確認します。

---

## 4. ブラウザで確認する

自動確認だけでは、見た目と操作のすべては確認できません。

### 画面幅

- 375px前後のスマートフォン
- 768px前後のタブレット
- 1280px以上のPC

### キーボード

- Tabの順番が自然か
- フォーカス位置が見えるか
- MenuをEnterで開けるか
- ModalをEscapeで閉じられるか
- Modalを閉じると元の要素へ戻るか
- スライドを停止できるか

### 内容

- 画像が欠けていないか
- 見出しの順番が自然か
- 絞り込みが0件のとき説明が出るか
- 作品を追加しても表示が壊れないか
- 長いタイトルやレビューでも崩れないか

### 動き

- `prefers-reduced-motion`で過度に動かないか
- ScrollRevealのために情報が長時間隠れないか
- Swiperを停止・再開できるか

---

## 5. 変更を小さく分ける

一つのcommitには、一つの説明可能な変更を入れます。

```text
良い例
Add genre filter to drama list

分かりにくい例
fix various things
```

スタイル整理、機能追加、文章変更を一つのcommitへ混ぜないようにすると、レビューと修正の取り消しがしやすくなります。

---

## 6. Pull Requestで共有する

チームで作業する場合は、作業用branchを作ります。

```bash
git switch -c feature/drama-filter
```

変更をcommitしてGitHubへ送ります。

```bash
git push -u origin feature/drama-filter
```

GitHubでPull Requestを作り、次を記載します。

```md
## 目的

何を解決する変更か

## 主な変更

- 変更点1
- 変更点2

## 確認方法

1. 確認手順1
2. 確認手順2

## 確認結果

- [ ] npm run lint
- [ ] npm run lint:styles
- [ ] npm run build
- [ ] スマートフォン表示
- [ ] PC表示
- [ ] キーボード操作
```

レビューする側がコードを推測しなくても、目的と確認方法が分かる状態を目指します。

---

## 7. コンポーネントをレビューする観点

### 責務

- 一つのコンポーネントが多くの役割を持ちすぎていないか
- 表示だけの子が不要なstateを持っていないか
- 共通UIに作品固有の処理が入っていないか

### データ

- 同じ内容を複数ファイルへ直接書いていないか
- 安定したIDをkeyに使っているか
- 元配列を直接変更していないか
- 計算できる値を重複したstateにしていないか

### スタイル

- コンポーネント固有スタイルがglobalへ漏れていないか
- 共有値を理由なく重複定義していないか
- クラス名から役割を判断できるか
- フォーカス表示を消していないか

### Next.js・React

- 操作が不要なコンポーネントまでClient Componentにしていないか
- Effectにcleanupが必要ではないか
- ブラウザAPIをServer Componentで使っていないか

---

## 8. 完成の基準

次のすべてを満たしたら、公開へ進みます。

- 必要な画面と機能が揃っている
- 元サイトの内容が失われていない
- データ追加だけで一覧へ反映される
- PCとモバイルのナビ情報が共通化されている
- Modalをマウスとキーボードで操作できる
- 自動再生を止められる
- lint、Stylelint、buildが成功する
- READMEだけで別の制作者が開発を始められる
- Pull Requestに目的と確認方法が書かれている

---

## 今日の確認

- [ ] READMEへ開発方法と制作ルールを記載した
- [ ] lint、Stylelint、buildを実行した
- [ ] 複数の画面幅で確認した
- [ ] マウスを使わず主要機能を操作した
- [ ] 一つの変更を一つの説明可能なcommitにした
- [ ] Pull Requestへ目的と確認方法を書いた
- [ ] 別の制作者が引き継げる状態になった

## Git

```bash
git add .
git commit -m "Document team workflow and quality checks"
```

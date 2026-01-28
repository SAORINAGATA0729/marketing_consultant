---
marp: true
theme: gaia
size: 16:9
paginate: true
backgroundColor: #fff
style: |
  section {
    font-family: 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
    font-size: 24px;
    padding: 40px;
  }
  h1 {
    color: #004085;
    font-size: 48px;
  }
  h2 {
    color: #0056b3;
    border-bottom: 2px solid #0056b3;
    padding-bottom: 10px;
    margin-bottom: 20px;
    font-size: 32px;
  }
  h3 {
    color: #333;
    font-size: 28px;
    margin-bottom: 15px;
  }
  strong {
    color: #d9534f;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
    color: #333;
  }
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .box {
    background-color: #f8f9fa;
    border-left: 5px solid #0056b3;
    padding: 15px;
    margin-bottom: 15px;
  }
  .alert {
    background-color: #fff3cd;
    border-left: 5px solid #ffc107;
    padding: 15px;
    margin-bottom: 15px;
  }
  .lead {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 100%;
    background-color: #f0f8ff;
  }
  .lead h1 {
    font-size: 60px;
    border: none;
  }
---

<!-- class: lead -->

# 広告戦略の現状整理と今後の方針

AeyeScan 週次定例資料
2026年1月23日

---

<!-- class: lead -->

# Part 1: 広告の現実ライン

---

## 1. ミッション：当初の計画

<div class="columns">
<div>

### 月間リード目標：58件

- **指名キーワード**：33件
- **一般キーワード**：25件

</div>
<div>

### 目標設定のロジック

1. 商談目標：18件/月
2. 商談遷移率：30%
3. **リード目標：58件/月**

</div>
</div>

<div class="box">

**計画時点の前提（楽観的予測）**
- 指名KWで33件獲得できる
- 一般KWでCVR 0.6%・CPC 495円が出る

</div>

---

## 1. ミッション：計画と現実のズレ

計画時点の前提が、実績と大きく乖離しています。

<div class="columns">
<div>

### 【指名KW】
- **計画**：33件/月
- **実績**：14〜27件/月
  （平均約19件）

<div class="alert">
計画時点で約14件分、
楽観的な見積もりでした。
</div>

</div>
<div>

### 【一般KW】
- **計画**：CVR 0.6% / CPC 495円
  → 25件獲得
- **実績**：**CVR 0%** / CPC 2,381円
  → **0件獲得**

<div class="alert">
前提が大きく外れました。
</div>

</div>
</div>

---

## 2. 現状（2026年1月時点）サマリー

目標58件に対し、実績14件。**▲44件（目標の76%）が未達**です。

<div class="columns">
<div>

### 指名キーワード
**実績：14件/月**

- 毎月14〜27件の範囲で安定的
- 目標未達だが、広告としては機能中

</div>
<div>

### 一般キーワード
**実績：0件/月**

- 12月以降、**2ヶ月連続でゼロ**
- 予算を5倍に増やしても獲得できず

</div>
</div>

---

## 3. 月次推移（2025年10月〜11月）

当初は一般KWでも獲得できていましたが、徐々に悪化しました。

| 月 | 実績サマリー | 状況 |
|---|---|---|
| **10月** | 指名:27 一般:5<br>**合計:32件**<br>CPA:4.0万円 | 一般KWでも5件獲得。<br>全体として健全な状態。 |
| **11月** | 指名:17 一般:2<br>**合計:19件**<br>CPA:6.9万円 | 一般KWが減少（5→2件）。<br>指名も減少。CPA悪化開始。 |

---

## 3. 月次推移（2025年12月〜2026年1月）

12月以降、一般KWからの獲得が完全に停止しました。

| 月 | 実績サマリー | 状況 |
|---|---|---|
| **12月** | 指名:19 **一般:0**<br>**合計:19件**<br>CPA:5.4万円 | 一般KW獲得ゼロに。<br>競合(GMO)の大量出稿が判明。<br>「予算不足？」の仮説浮上。 |
| **1月** | 指名:14 **一般:0**<br>**合計:14件**<br>**CPA:20.4万円** | **予算5倍（約200万円）投入実験**。<br>インプレッションシェア20%まで向上するも、**CVは0件**。 |

---

## 4. 検証実験の結果（2026年1月）

「予算を増やせば取れるのか？」を確認するため、約200万円を一般KWに投入しました。

<div class="columns">
<div>

### 投入リソース（一般KW）
- セキュリティ診断系：約90万円
- Webアプリ診断系：約114万円
- **合計：約200万円**

</div>
<div>

### 結果
- インプレッションシェア：20%達成
- CPC：2,381円（高騰）
- **CVR：0%**
- **品質スコア：1〜3（低評価）**

</div>
</div>

<div class="alert">
<strong>結論：予算を増やしてもCVは獲得できませんでした。</strong>
</div>

---

## 5. 一般KWでCVが獲得できない要因

全ての仮説を検証しましたが、効果が見られませんでした。

| 仮説 | 対応 | 結果 |
|---|---|---|
| 予算不足 | 5倍に増額（285万円） | **効果なし** |
| 表示シェア不足 | シェア20%まで引き上げ | **効果なし** |
| KW選定ミス | CV実績のあるKWに絞り込み | **効果なし** |
| LP(CVR)が悪い | フォーム改善を実施 | **効果なし** |
| **品質スコアが低い** | **（現状1〜3と判明）** | **★未実施** |

---

## 5. 現時点での見解：複合的な問題

品質スコアの低さと、LPのマッチング不足が根本原因です。

<div class="columns">
<div>

### 問題1：CPCの高騰
**原因：品質スコアが1〜3と低い**
- CPCが高騰（2,381円）
- 同じ予算でのクリック数が減少
- 表示順位も不利に

</div>
<div>

### 問題2：CVR 0%
**原因：検索意図とのミスマッチ**
- 479クリックでCVゼロ
- 「脆弱性診断」等の検索意図と、現在のAeyeScanの訴求が合っていない可能性

</div>
</div>

<div class="box">
競合環境：GMO社などは当社の3〜10倍の予算。
効率（品質スコア）を改善しても、物量差は埋まらない厳しい状況です。
</div>

---

## 6. 今後の判断：分岐点

現状を踏まえ、2つの選択肢があります。

<div class="columns">
<div>

### A：一般KWの改善を継続

- **To Do**：品質スコア改善（広告文・LP・アカウント構造）
- **期間**：2〜3ヶ月
- **リスク**：改善しても競合差は埋まらず、成果が出ない可能性あり。その間もコスト発生。

</div>
<div>

### B：一般KWから撤退

- **To Do**：一般KW停止、指名KWに集中
- **メリット**：確実な指名KWに集中し、浮いた予算を別チャネルへ。CPA安定。
- **デメリット**：一般KWでの新規獲得は見送り。

</div>
</div>

---

## 7. 撤退ラインの提案

「改善継続」を選択する場合でも、明確な撤退ラインを設けることを提案します。

| 期限 | 確認項目 | 達成基準 | 未達の場合 |
|---|---|---|---|
| **2月末** | 品質スコア | **5以上に改善** | **継続困難と判断** |
| **3月末** | CVR | **0.3%以上** | **一般KWは縮小** |

**判断ロジック**
1. まず2月末で「改善の兆候（品質スコア向上）」を確認
2. 兆候があれば3月末まで粘り、「実益（CVR向上）」を確認
3. 両方満たせなければ、別チャネルへ予算をシフト

---

<!-- class: lead -->

# Part 2: 広告以外の補完策
（次に作成）

---

<!-- class: lead -->

# Part 3: コミュニケーション再設計
（次に作成）

---

<!-- class: lead -->

# Part 4: 実行計画
（次に作成）

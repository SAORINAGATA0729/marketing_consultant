# GAS修正指示書：週次レポート自動生成スクリプト

**対象ファイル:** `generateWeeklyReport` スクリプト
**作成日:** 2026年1月26日
**問題:** スプレッドシートから取得する数値がずれている

---

## 修正箇所1: `getKPIData` 関数の列計算

**ファイル内の位置:** 約130行目付近

### 変更前
```javascript
if (currentYear === 2026) {
    // 2026年のKPIシート構造:
    // 列B: 2025年12月
    // 列C: 2026年1月
    // 列D: 2026年2月
    // 列E: 2026年3月
    // ... つまり、2026年N月 = 列(N+2)
    dataCol = currentMonth + 2; // 1月=列3, 2月=列4, ...
```

### 変更後
```javascript
if (currentYear === 2026) {
    // 2026年のKPIシート構造:
    // 列D: 2025年12月
    // 列E: 2026年1月
    // 列F: 2026年2月
    // ... つまり、2026年N月 = 列(N+4)
    dataCol = currentMonth + 4; // 1月=列5, 2月=列6, ...
```

---

## 修正箇所2: `getDeviceData` 関数の行番号

**ファイル内の位置:** 約200行目付近

### 変更前
```javascript
  // Desktop データ（行35-39）
  const desktopSS = formatNumber(sheet.getRange(35, dataCol).getValue());
  const desktopCTASS = formatNumber(sheet.getRange(36, dataCol).getValue());
  const desktopCV = formatNumber(sheet.getRange(37, dataCol).getValue());
  const desktopCTR = sheet.getRange(38, dataCol).getValue() || 0;
  const desktopCVR = sheet.getRange(39, dataCol).getValue() || 0;

  // Mobile データ（行42-46）
  const mobileSS = formatNumber(sheet.getRange(42, dataCol).getValue());
  const mobileCTASS = formatNumber(sheet.getRange(43, dataCol).getValue());
  const mobileCV = formatNumber(sheet.getRange(44, dataCol).getValue());
  const mobileCTR = sheet.getRange(45, dataCol).getValue() || 0;
  const mobileCVR = sheet.getRange(46, dataCol).getValue() || 0;
```

### 変更後
```javascript
  // Desktop データ（行4-8）
  const desktopSS = formatNumber(sheet.getRange(4, dataCol).getValue());
  const desktopCTASS = formatNumber(sheet.getRange(5, dataCol).getValue());
  const desktopCV = formatNumber(sheet.getRange(6, dataCol).getValue());
  const desktopCTR = sheet.getRange(7, dataCol).getValue() || 0;
  const desktopCVR = sheet.getRange(8, dataCol).getValue() || 0;

  // Mobile データ（行11-15）
  const mobileSS = formatNumber(sheet.getRange(11, dataCol).getValue());
  const mobileCTASS = formatNumber(sheet.getRange(12, dataCol).getValue());
  const mobileCV = formatNumber(sheet.getRange(13, dataCol).getValue());
  const mobileCTR = sheet.getRange(14, dataCol).getValue() || 0;
  const mobileCVR = sheet.getRange(15, dataCol).getValue() || 0;
```

---

## 原因

スプレッドシートの構造がコード内の想定と異なっていたため、行・列番号が実際のシートと一致していなかった。

### KPIシート（gid=1627271956）

| 項目 | コード上の値 | 実際の値 |
|------|-------------|---------|
| 2026年1月の列 | 列3 (C列) | **列5 (E列)** |

### デバイス別KPIシート（gid=557368040）

| 項目 | コード上の値 | 実際の値 |
|------|-------------|---------|
| Desktop SS | 行35 | **行4** |
| Desktop CTA_SS | 行36 | **行5** |
| Desktop CV | 行37 | **行6** |
| Desktop CTR | 行38 | **行7** |
| Desktop CVR | 行39 | **行8** |
| Mobile SS | 行42 | **行11** |
| Mobile CTA_SS | 行43 | **行12** |
| Mobile CV | 行44 | **行13** |
| Mobile CTR | 行45 | **行14** |
| Mobile CVR | 行46 | **行15** |

---

## 確認手順

1. GASエディタで上記2箇所を修正
2. `test()` 関数を実行
3. ログで数値が正しく取得されているか確認
4. 問題なければ `generateWeeklyReport()` を実行してSlackに送信

---

## 期待される正しい値（2026年1月）

| 項目 | 値 |
|------|-----|
| 全体SS | 89,064 |
| フォームSS | 404 |
| CV | 18 |
| Desktop SS | 19,380 |
| Desktop CV | 15 |
| Mobile SS | 67,575 |
| Mobile CV | 3 |

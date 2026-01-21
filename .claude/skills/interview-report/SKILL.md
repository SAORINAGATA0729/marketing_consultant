---
name: interview-report
description: 採用面談レポート自動生成。Firefliesから議事録を取得し、分析してSlackにスレッド形式で投稿。
---

# 採用面談レポート生成スキル

## 概要

Firefliesの議事録から採用面談レポートを生成し、Slackに投稿します。

**入力**: Fireflies議事録（自動取得 or 手動指定）
**出力**: Slackスレッド投稿（親: 候補者名、子: レポート本文）

---

## 実行トリガー

以下のキーワードで実行:
- 「採用レポート作って」
- 「面談レポート」
- 「最近の採用面談をSlackに投稿」

---

## 実行プロセス

### Step 1: 議事録検索
**Fireflies MCP**で最近の議事録を検索

```
fireflies_search: keyword:"面談" OR keyword:"採用" limit:10
```

**出力**: 面談・採用を含む議事録一覧

---

### Step 2: 対象選択
ユーザーに処理対象を確認

**選択肢**:
- 特定の議事録を選択
- 最新の未処理議事録を処理
- 全ての未処理議事録を処理

---

### Step 3: 議事録取得
**Fireflies MCP**で詳細を取得

```
fireflies_fetch: id:"[transcript_id]"
```

**取得項目**:
- タイトル
- 日時
- 参加者
- 発話内容（sentences）
- サマリー

---

### Step 4: レポート生成
以下のフォーマットで分析・生成

```markdown
### 📋 基本情報
- **氏名**:
- **現職/経歴**:
- **年齢**: （わかれば）

### 💼 スキル・経験
-
-
-

### 📊 評価サマリー
| 項目 | 評価 | コメント |
|------|------|----------|
| カルチャーフィット | ◎/○/△ | |
| スキルマッチ | ◎/○/△ | |
| 志望度 | ◎/○/△ | |
| コミュニケーション | ◎/○/△ | |

### ⚠️ 懸念点・確認事項
-

### 📝 ネクスト面談への引継ぎ
**候補者から出た質問・関心事項:**
-

**次回確認すべきポイント:**
-

### 🎯 推奨アクション
（例: 次回面談設定 / 見送り / 保留 など、理由も含めて）
```

---

### Step 5: Slack投稿
**Slack API**でスレッド形式投稿

**親メッセージ**:
```
【採用面談レポート】{候補者名}
```

**子メッセージ（スレッド）**:
```
@channel

{レポート本文}
```

**投稿先**: #03_kaaan_採用（C0A4C54EN2X）

---

## Slack認証情報

認証情報は `採用/KPI/採用面談レポート自動生成.gs` を参照。

**投稿先**: #03_kaaan_採用

**投稿コマンド（親）**:
```bash
curl -s -X POST 'https://slack.com/api/chat.postMessage' \
  -H 'Authorization: Bearer $SLACK_BOT_TOKEN' \
  -H 'Content-type: application/json; charset=utf-8' \
  -d '{"channel":"$CHANNEL_ID","text":"【採用面談レポート】候補者名"}'
```

**投稿コマンド（子: thread_ts使用）**:
```bash
curl -s -X POST 'https://slack.com/api/chat.postMessage' \
  -H 'Authorization: Bearer $SLACK_BOT_TOKEN' \
  -H 'Content-type: application/json; charset=utf-8' \
  -d '{"channel":"$CHANNEL_ID","thread_ts":"親のts","text":"<!channel>\n\nレポート本文"}'
```

---

## 候補者名抽出ルール

タイトルから候補者名を抽出:

1. パターン1: `XXX面談` → XXX
2. パターン2: `XXXさん面談` → XXX
3. パターン3: `【採用面談】XXX` → XXX
4. パターン4: 参加者名から面接官以外を抽出

---

## 処理済み管理

採用管理シートの「処理済み面談」タブで管理:
- シートID: `1Xs3__LaMXnMCMxEv6B6Qq9FgBI1cG0V6-l91XbhlYPE`
- カラム: ID, タイトル, 処理日時

---

## 使用ツール

- **Fireflies MCP**: 議事録検索・取得
- **Bash (curl)**: Slack投稿

---

## 実行例

```
ユーザー: 採用レポート作って

Claude: Firefliesから最近の面談議事録を検索します。

[検索結果]
1. 喜久川里香子さん面談（1/21 14:00）
2. 山田太郎さん面談（1/20 11:00）
3. 鈴木花子さん面談（1/19 15:00）

どの面談のレポートを作成しますか？

ユーザー: 1

Claude: 喜久川里香子さんの面談レポートを作成します。

[レポート生成中...]

Slackに投稿しました。
https://moltsinc.slack.com/archives/C0A4C54EN2X/p...
```

---

## 注意事項

- APIコスト: 0円（Claude Code内で処理するため）
- 自動化ではなく手動トリガー
- Slack Bot Tokenは定期的に確認（期限切れに注意）

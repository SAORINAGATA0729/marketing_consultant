# 寺倉ナレッジ同期

Firefliesから寺倉さんの会議を取得し、ナレッジフォルダに保存する。

## 寺倉さんのメールアドレス
`somehiko@moltsinc.co.jp`

## 実行手順

### 1. 直近の会議を取得
Fireflies MCPで直近の会議を取得：
```
mcp__fireflies__fireflies_get_transcripts
limit: 30
```

### 2. メールアドレスでフィルタリング
取得した会議から、participantsに `somehiko@moltsinc.co.jp` が含まれるものだけを抽出。

```bash
# jqでフィルタリング
jq '.transcripts[] | select(.participants | index("somehiko@moltsinc.co.jp"))'
```

### 3. 既存ファイルとの重複チェック
`寺倉ナレッジ/会議一覧/` 内の既存ファイルを確認し、未保存の会議のみを対象にする。

### 4. 会議詳細を取得して保存
未保存の会議ごとに詳細を取得：
```
mcp__fireflies__fireflies_get_transcript_details
transcript_id: [会議ID]
```

保存形式：
- ファイル名: `YYYY-MM-DD_会議名.md`
- 保存先: `寺倉ナレッジ/会議一覧/`

### 5. ファイル形式
```markdown
# [会議名]

**日時**: YYYY-MM-DD HH:MM
**参加者**: 参加者リスト
**時間**: XX分

## サマリー
（bullet_gistまたはoverviewの内容）

## キーワード
- keyword1
- keyword2
- ...

## アクションアイテム
（action_itemsの内容）

## 詳細
（会議の重要なポイントを整理）
```

## 注意事項
- Firefliesの検索APIはメールアドレス検索に対応していないため、全件取得→フィルタリングの流れで処理する
- 同じ日に複数会議がある場合は、ファイル名に識別子を追加（例: `2026-01-06_KAAAN記事FB_ターゲット設定.md`）

## 呼び出しキーワード
- 「寺倉MTG取得」
- 「寺倉ナレッジ同期」
- 「/terakura-sync」

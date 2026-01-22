# 寺倉ナレッジ同期

Firefliesから寺倉さん（somehiko@moltsinc.co.jp）の会議を取得し、ナレッジフォルダに保存する。

## 実行手順

### 1. 直近の会議を取得
Fireflies MCPを使って、寺倉さん参加の会議を検索：
```
mcp__fireflies__fireflies_search
query: "participants:somehiko@moltsinc.co.jp limit:20"
```

### 2. 会議一覧フォルダに保存
各会議を以下の形式で保存：
- ファイル名: `YYYY-MM-DD_会議名.md`
- 保存先: `寺倉ナレッジ/会議一覧/`

### 3. ファイル形式
```markdown
# [会議名]

**日時**: YYYY-MM-DD HH:MM
**参加者**: 参加者リスト
**時間**: XX分

## サマリー
（short_summaryの内容）

## キーワード
- keyword1
- keyword2
- ...

## アクションアイテム
（action_itemsの内容）
```

### 4. CLAUDE.md更新
`寺倉ナレッジ/CLAUDE.md`の「最近の会議」セクションを更新

## 呼び出しキーワード
- 「寺倉MTG取得」
- 「寺倉ナレッジ同期」

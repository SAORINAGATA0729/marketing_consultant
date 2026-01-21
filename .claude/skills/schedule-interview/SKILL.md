---
name: schedule-interview
description: 採用面談の日程調整。Googleカレンダーに面談予定を登録（Google Meet自動発行）。
---

# 採用面談日程調整スキル

## 概要

採用面談の日程をGoogleカレンダーに登録します。Google Meetリンクを自動発行し、面談レポートの内容を概要欄に記載します。

**入力**: 候補者名、日時、ポジション、面談レポート内容
**出力**: Googleカレンダーイベント（Meet付き）

---

## 実行トリガー

以下のキーワードで実行:
- 「面談日程組んで」
- 「カレンダー登録して」
- 「面談スケジュール」

---

## 面接官情報

| ポジション | 面接官 | メールアドレス |
|-----------|--------|---------------|
| PdM | そめひこ | somehiko@moltsinc.co.jp |
| コンサル | 田島 | tajima_kotaro@moltsinc.co.jp |

---

## 面談設定

- **所要時間**: 30分
- **会議**: Google Meet（自動発行）
- **タイトル形式**: 【採用面談】{候補者名}

---

## 実行プロセス

### Step 1: 日程確認（最初に必ず聞く）
**スキル発動時、まずユーザーに質問する:**

```
いつ面談を組みますか？
```

ユーザーの回答例:
- 「1/25 14:00」
- 「来週月曜の午後」
- 「明日の10時」

### Step 2: その他の情報収集
日程が決まったら、以下を確認:

1. **候補者名**: 必須
2. **ポジション**: PdM / コンサル
3. **レポート内容**: /interview-reportで生成したレポート（概要欄に記載）

---

### Step 3: カレンダーイベント作成
**GAS経由でGoogleカレンダーAPIを使用**

**イベント詳細**:
```
タイトル: 【採用面談】{候補者名}
開始: {指定日時}
終了: {開始 + 30分}
参加者: {面接官メールアドレス}
会議: Google Meet（自動発行）
概要: {面談レポート内容}
```

---

### Step 4: 完了報告
以下を出力:
- カレンダーイベントURL
- Google MeetリンクURL
- 登録内容サマリー

---

## GAS実装

`採用/KPI/採用面談日程調整.gs` に以下の関数を実装:

```javascript
/**
 * 採用面談をカレンダーに登録
 * @param {string} candidateName - 候補者名
 * @param {string} position - ポジション（PdM / コンサル）
 * @param {Date} startTime - 開始日時
 * @param {string} reportContent - 面談レポート内容
 * @return {object} - イベント情報
 */
function createInterviewEvent(candidateName, position, startTime, reportContent) {
  // 面接官マッピング
  const INTERVIEWERS = {
    'PdM': 'somehiko@moltsinc.co.jp',
    'コンサル': 'tajima_kotaro@moltsinc.co.jp'
  };

  const interviewer = INTERVIEWERS[position];
  if (!interviewer) {
    throw new Error('無効なポジション: ' + position);
  }

  // カレンダー取得
  const calendar = CalendarApp.getDefaultCalendar();

  // 終了時刻（30分後）
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  // イベント作成
  const event = calendar.createEvent(
    '【採用面談】' + candidateName,
    startTime,
    endTime,
    {
      description: reportContent,
      guests: interviewer,
      sendInvites: true
    }
  );

  // Google Meet追加
  const conferenceData = Calendar.Events.patch(
    {
      conferenceData: {
        createRequest: {
          requestId: Utilities.getUuid(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    },
    'primary',
    event.getId().replace('@google.com', ''),
    { conferenceDataVersion: 1 }
  );

  return {
    eventId: event.getId(),
    eventUrl: event.getUrl ? event.getUrl() : 'https://calendar.google.com',
    meetUrl: conferenceData.conferenceData?.entryPoints?.[0]?.uri || 'Meet URL取得中...',
    title: '【採用面談】' + candidateName,
    startTime: startTime,
    endTime: endTime,
    interviewer: interviewer
  };
}
```

---

## 手動実行フロー（Claude Code）

GASを使わず手動で実行する場合:

### 1. 日程確認（最初に必ず聞く）
```
Claude: いつ面談を組みますか？
```

### 2. その他の情報確認
```
Claude: 了解です。{日時}ですね。
以下も教えてください：
- 候補者名:
- ポジション: PdM / コンサル
- レポート内容: (/interview-reportで生成したもの)
```

### 3. Googleカレンダーで手動作成
ユーザーがGoogleカレンダーで以下を設定:
- タイトル: 【採用面談】{候補者名}
- 日時: 指定日時〜30分後
- ゲスト: 面接官メールアドレス
- Google Meet: 追加
- 概要: レポート内容をコピペ

### 4. 完了確認
```
Claude: カレンダー登録が完了しました。
- イベント: 【採用面談】{候補者名}
- 日時: {日時}
- 面接官: {面接官名}
- Meet: {自動発行されたURL}
```

---

## /interview-report との連携

**推奨フロー**:
1. `/interview-report` で面談レポートを生成
2. Slackに投稿完了
3. ユーザー: 「日程組んで」
4. `/schedule-interview` でカレンダー登録
5. レポート内容を概要欄に自動転記

**レポート内容の取得**:
- 直前の/interview-reportで生成したレポートを使用
- または、ユーザーがSlackからコピペで提供

---

## 使用ツール

- **GAS**: Googleカレンダー操作（Calendar API）
- **手動の場合**: ユーザーがGoogleカレンダーで直接作成

---

## 注意事項

- Google Calendar APIの権限が必要（GAS使用時）
- 面接官のカレンダー空き状況は自動確認しない（手動確認）
- 候補者へのメール送信は別途手動で行う

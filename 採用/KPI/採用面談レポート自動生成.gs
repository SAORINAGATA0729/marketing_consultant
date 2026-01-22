/**
 * 採用面談レポート自動生成システム
 *
 * Fireflies議事録 → Claude分析 → Slack投稿 を自動化
 *
 * 使い方：
 * 1. 採用管理シートのApps Scriptにこのコードを追加
 * 2. 各APIキーを設定
 * 3. setupTrigger() を1回実行してトリガー設定
 */

// ================================
// 設定（ここを編集）
// ================================

/**
 * 設定を取得する関数
 * PropertiesServiceから機密情報を取得し、CONFIGオブジェクトを返す
 *
 * 【初回セットアップ】
 * GASエディタで以下を1回実行してAPIキーを保存:
 *
 * function setupSecrets() {
 *   const props = PropertiesService.getScriptProperties();
 *   props.setProperties({
 *     'FIREFLIES_API_KEY': 'YOUR_FIREFLIES_API_KEY',
 *     'CLAUDE_API_KEY': 'YOUR_CLAUDE_API_KEY',
 *     'SLACK_BOT_TOKEN': 'xoxb-xxxx-xxxx-xxxx'  // 実際のトークンを設定
 *   });
 * }
 */
function getConfig() {
  const props = PropertiesService.getScriptProperties();

  return {
    // APIキー（PropertiesServiceから取得）
    FIREFLIES_API_KEY: props.getProperty('FIREFLIES_API_KEY') || 'YOUR_FIREFLIES_API_KEY',
    CLAUDE_API_KEY: props.getProperty('CLAUDE_API_KEY') || 'YOUR_CLAUDE_API_KEY',
    SLACK_BOT_TOKEN: props.getProperty('SLACK_BOT_TOKEN') || 'YOUR_SLACK_BOT_TOKEN',

    // Slack Channel ID（#03_kaaan_採用）
    SLACK_CHANNEL_ID: 'C0A4C54EN2X',

    // 採用管理シートID（処理済みID管理用）
    SPREADSHEET_ID: '1Xs3__LaMXnMCMxEv6B6Qq9FgBI1cG0V6-l91XbhlYPE',

    // 検知対象のキーワード（タイトルに含まれていたら処理）
    TITLE_KEYWORDS: ['面談', '採用'],

    // ポーリング間隔で取得する期間（時間）
    LOOKBACK_HOURS: 1,
  };
}

// グローバルCONFIG（各関数から参照）
const CONFIG = getConfig();

// ================================
// メイン処理
// ================================

/**
 * メイン関数：新規面談議事録をチェックして処理
 * トリガーで5分ごとに実行
 */
function checkNewInterviewTranscripts() {
  Logger.log('=== 採用面談レポート自動生成 開始 ===');

  try {
    // 1. Firefliesから最近の議事録を取得
    const transcripts = fetchRecentTranscripts();
    Logger.log(`取得した議事録数: ${transcripts.length}`);

    // 2. 面談関連の議事録をフィルタ
    const interviewTranscripts = transcripts.filter(t =>
      CONFIG.TITLE_KEYWORDS.some(keyword => t.title.includes(keyword))
    );
    Logger.log(`面談関連の議事録数: ${interviewTranscripts.length}`);

    // 3. 処理済みIDを取得
    const processedIds = getProcessedIds();

    // 4. 未処理の議事録を処理
    for (const transcript of interviewTranscripts) {
      if (processedIds.includes(transcript.id)) {
        Logger.log(`スキップ（処理済み）: ${transcript.title}`);
        continue;
      }

      Logger.log(`処理開始: ${transcript.title}`);

      // 4a. 議事録の詳細を取得
      const fullTranscript = fetchTranscriptDetail(transcript.id);

      // 4b. Claudeで分析
      const report = analyzeWithClaude(fullTranscript);

      // 4c. Slackに投稿
      postToSlack(transcript.title, report);

      // 4d. 処理済みとして記録
      markAsProcessed(transcript.id, transcript.title);

      Logger.log(`処理完了: ${transcript.title}`);
    }

    Logger.log('=== 採用面談レポート自動生成 完了 ===');

  } catch (error) {
    Logger.log(`エラー: ${error.message}`);
    // エラー時もSlackに通知（オプション）
    postErrorToSlack(error.message);
  }
}

// ================================
// Fireflies API
// ================================

/**
 * 最近の議事録一覧を取得
 */
function fetchRecentTranscripts() {
  const url = 'https://api.fireflies.ai/graphql';

  // 過去X時間分を取得
  const fromDate = new Date();
  fromDate.setHours(fromDate.getHours() - CONFIG.LOOKBACK_HOURS);

  const query = `
    query {
      transcripts(limit: 20) {
        id
        title
        date
        duration
      }
    }
  `;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.FIREFLIES_API_KEY}`
    },
    payload: JSON.stringify({ query }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (result.errors) {
    throw new Error(`Fireflies API エラー: ${JSON.stringify(result.errors)}`);
  }

  return result.data.transcripts || [];
}

/**
 * 議事録の詳細（全文）を取得
 */
function fetchTranscriptDetail(transcriptId) {
  const url = 'https://api.fireflies.ai/graphql';

  const query = `
    query {
      transcript(id: "${transcriptId}") {
        id
        title
        date
        duration
        sentences {
          speaker_name
          text
        }
        summary {
          overview
          keywords
          action_items
        }
      }
    }
  `;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.FIREFLIES_API_KEY}`
    },
    payload: JSON.stringify({ query }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (result.errors) {
    throw new Error(`Fireflies API エラー: ${JSON.stringify(result.errors)}`);
  }

  return result.data.transcript;
}

// ================================
// Claude API
// ================================

/**
 * Claudeで議事録を分析してレポート生成
 */
function analyzeWithClaude(transcript) {
  const url = 'https://api.anthropic.com/v1/messages';

  // 議事録テキストを整形
  const transcriptText = transcript.sentences
    .map(s => `${s.speaker_name}: ${s.text}`)
    .join('\n');

  const prompt = `
あなたは採用担当のアシスタントです。以下の採用面談の議事録を分析し、採用レポートを作成してください。

## 議事録
タイトル: ${transcript.title}
日時: ${transcript.date}
所要時間: ${Math.round(transcript.duration / 60)}分

${transcriptText}

## 出力フォーマット（必ずこの形式で）

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
`;

  const payload = {
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CONFIG.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (result.error) {
    throw new Error(`Claude API エラー: ${result.error.message}`);
  }

  return result.content[0].text;
}

// ================================
// Slack API
// ================================

/**
 * Slackにスレッド形式で投稿
 */
function postToSlack(title, report) {
  // 候補者名を抽出（タイトルから推測）
  const candidateName = extractCandidateName(title);

  // 親メッセージ（スレッドの見出し）
  const parentMessage = `【採用面談レポート】${candidateName || title}`;

  // 親メッセージを投稿してtsを取得
  const parentTs = postSlackMessage(parentMessage);

  // 子メッセージ（レポート本文）をスレッドに投稿
  const childMessage = `<!channel>\n\n${report}`;
  postSlackMessage(childMessage, parentTs);

  Logger.log('Slack投稿完了');
}

/**
 * Slackにメッセージを投稿（Bot Token + chat.postMessage API）
 * @param {string} text - メッセージ本文
 * @param {string} threadTs - スレッドの親メッセージのts（省略時は新規投稿）
 * @returns {string} - 投稿したメッセージのts
 */
function postSlackMessage(text, threadTs = null) {
  const url = 'https://slack.com/api/chat.postMessage';

  const payload = {
    channel: CONFIG.SLACK_CHANNEL_ID,
    text: text
  };

  if (threadTs) {
    payload.thread_ts = threadTs;
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.SLACK_BOT_TOKEN}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (!result.ok) {
    throw new Error(`Slack API エラー: ${result.error}`);
  }

  return result.ts;
}

/**
 * エラーをSlackに通知
 */
function postErrorToSlack(errorMessage) {
  const url = 'https://slack.com/api/chat.postMessage';
  const message = `⚠️ 採用面談レポート自動生成でエラーが発生しました\n\n${errorMessage}`;

  const payload = {
    channel: CONFIG.SLACK_CHANNEL_ID,
    text: message
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.SLACK_BOT_TOKEN}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log('Slackエラー通知失敗: ' + e.message);
  }
}

/**
 * タイトルから候補者名を抽出
 */
function extractCandidateName(title) {
  // パターン1: 「XXX面談」「XXXさん面談」
  const match1 = title.match(/(.+?)(さん)?面談/);
  if (match1) return match1[1];

  // パターン2: 「【採用面談】XXX」
  const match2 = title.match(/【採用面談】(.+)/);
  if (match2) return match2[1];

  return null;
}

// ================================
// 処理済みID管理
// ================================

/**
 * 処理済みIDを取得
 */
function getProcessedIds() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName('処理済み面談');

  if (!sheet) {
    // シートがなければ作成
    sheet = ss.insertSheet('処理済み面談');
    sheet.getRange('A1:C1').setValues([['ID', 'タイトル', '処理日時']]);
    return [];
  }

  const data = sheet.getDataRange().getValues();
  return data.slice(1).map(row => row[0]); // IDの列を返す
}

/**
 * 処理済みとして記録
 */
function markAsProcessed(id, title) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName('処理済み面談');

  if (!sheet) {
    sheet = ss.insertSheet('処理済み面談');
    sheet.getRange('A1:C1').setValues([['ID', 'タイトル', '処理日時']]);
  }

  const lastRow = sheet.getLastRow();
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  sheet.getRange(lastRow + 1, 1, 1, 3).setValues([[id, title, now]]);
}

// ================================
// トリガー設定
// ================================

/**
 * 5分ごとのトリガーを設定
 * 初回に1回だけ実行
 */
function setupTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkNewInterviewTranscripts') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 新しいトリガーを作成（5分ごと）
  ScriptApp.newTrigger('checkNewInterviewTranscripts')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('トリガー設定完了: 5分ごとに checkNewInterviewTranscripts を実行');
}

/**
 * トリガーを削除
 */
function removeTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkNewInterviewTranscripts') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  Logger.log('トリガー削除完了');
}

// ================================
// テスト用関数
// ================================

/**
 * 手動テスト: 特定の議事録IDでレポート生成
 */
function testWithTranscriptId() {
  const testId = 'YOUR_TEST_TRANSCRIPT_ID'; // テスト用IDを入れる

  const transcript = fetchTranscriptDetail(testId);
  Logger.log('議事録取得完了: ' + transcript.title);

  const report = analyzeWithClaude(transcript);
  Logger.log('レポート生成完了');
  Logger.log(report);

  // Slack投稿もテストする場合はコメント解除
  // postToSlack(transcript.title, report);
}

/**
 * 手動テスト: Fireflies API接続確認
 */
function testFirefliesConnection() {
  try {
    const transcripts = fetchRecentTranscripts();
    Logger.log('Fireflies接続成功');
    Logger.log(`取得した議事録: ${transcripts.length}件`);
    transcripts.forEach(t => Logger.log(`- ${t.title} (${t.date})`));
  } catch (e) {
    Logger.log('Fireflies接続失敗: ' + e.message);
  }
}

/**
 * 手動テスト: Claude API接続確認
 */
function testClaudeConnection() {
  const testTranscript = {
    title: 'テスト面談',
    date: new Date().toISOString(),
    duration: 1800,
    sentences: [
      { speaker_name: '面接官', text: 'よろしくお願いします' },
      { speaker_name: '候補者', text: 'よろしくお願いします。山田太郎と申します。' }
    ]
  };

  try {
    const report = analyzeWithClaude(testTranscript);
    Logger.log('Claude接続成功');
    Logger.log(report);
  } catch (e) {
    Logger.log('Claude接続失敗: ' + e.message);
  }
}

/**
 * 手動テスト: Slack投稿確認
 */
function testSlackPost() {
  postToSlack('テスト面談', 'これはテストレポートです。\n\n正常に動作しています。');
  Logger.log('Slack投稿テスト完了');
}

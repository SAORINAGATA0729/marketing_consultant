/**
 * 採用管理シートに「タスク進捗」タブを追加するスクリプト
 *
 * 使い方：
 * 1. 採用管理シートを開く
 * 2. 拡張機能 > Apps Script
 * 3. このコードをコピペ
 * 4. createTaskSheet() を実行
 */

// 採用管理シートのID
const SPREADSHEET_ID = '1Xs3__LaMXnMCMxEv6B6Qq9FgBI1cG0V6-l91XbhlYPE';

/**
 * タスク進捗シートを作成
 */
function createTaskSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 既存の「タスク進捗」シートがあれば削除
  const existingSheet = ss.getSheetByName('タスク進捗');
  if (existingSheet) {
    ss.deleteSheet(existingSheet);
  }

  // 新しいシートを作成
  const sheet = ss.insertSheet('タスク進捗');

  // ヘッダー設定
  const headers = ['タスク', '担当', '期限', 'ステータス', '今週やること', 'メモ'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // ヘッダーの書式設定
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // 初期タスクデータ（随時更新シートから移行）
  const initialTasks = [
    // 完了タスク
    ['Wantedlyページ作成・契約', '-', '1/19', '✅完了', '', ''],
    ['採用コミュニケーション設計', '-', '1/20', '✅完了', '', ''],
    ['KPIシート作成', '永田', '1/20', '✅完了', '', ''],
    ['ロードマップ作成', '永田', '1/21', '✅完了', '', ''],

    // === Wantedly自動化システム ===
    // フェーズ1（1月中）
    ['【自動化】スクリーニング→AIでOK判定→スプシ記入', '松原', '1/26', '🔄進行中', 'TRUE', '今週中に完成予定'],
    ['【自動化】永田チェック→メッセージ一括生成', '松原', '1/26', '🔄進行中', 'TRUE', ''],
    ['【自動化】松原最終確認→送付', '松原', '1/26', '🔄進行中', 'TRUE', '送付は人間がボタン押す'],
    ['【自動化】返信検知→AI提案→通知', '松原', '1/26', '🔄進行中', 'TRUE', ''],
    ['【自動化】面談希望検知→カレンダー確認→日程提案', '松原', '1/26', '🔄進行中', 'TRUE', '曽根彦or永田のカレンダー参照'],
    ['【自動化】精度チューニング', '松原', '1/31', '❌未着手', '', '永田確認後に調整'],
    // フェーズ2（2月以降）
    ['【自動化】採用MTG→Fireflies議事録→カレンダー連携', '松原', '2月', '❌未着手', '', '採用ワードで検知'],

    // === Wantedly撮影 ===
    ['撮影日程調整（若手全員集まれる日3候補）', '松原', '1/26', '❌未着手', 'TRUE', '1月後半〜2月初旬で'],
    ['撮影日コピー取り', '松原', '1/31', '❌未着手', '', 'Wantedly特典利用'],
    ['撮影実施（前半撮影・後半懇親会）', '全員', '2月初旬', '❌未着手', '', 'オフィスで'],

    // === コンテンツ ===
    ['コンテンツ計画策定', '松原', '1/31', '❌未着手', '', 'モルツコンテンツ+AI思想をミックス'],
    ['コンテンツ確認フロー設計', '永田', '1/31', '❌未着手', '', ''],
    ['コンテンツ作成', '松原', '2月', '❌未着手', '', '来週から着手'],

    // === その他 ===
    ['リファラル採用', '全員', '2/28', '🔄進行中', '', '2Qまで継続'],
    ['採用ページ作成', '永田', '2/28', '❌未着手', '', 'KAAAN採用ページ'],
    ['3月以降の別施策決定', '永田', '2/28', '❌未着手', '', 'YOUTRUST、Green、エージェント等'],
    ['費用対効果トラッキング開始', '-', '3月〜', '❌未着手', '', ''],
  ];

  if (initialTasks.length > 0) {
    sheet.getRange(2, 1, initialTasks.length, headers.length).setValues(initialTasks);
  }

  // ステータス列にデータ入力規則（ドロップダウン）
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['❌未着手', '🔄進行中', '✅完了'], true)
    .build();
  sheet.getRange(2, 4, 100, 1).setDataValidation(statusRule);

  // 今週やること列にチェックボックス
  sheet.getRange(2, 5, 100, 1).insertCheckboxes();

  // 列幅調整
  sheet.setColumnWidth(1, 250); // タスク
  sheet.setColumnWidth(2, 80);  // 担当
  sheet.setColumnWidth(3, 80);  // 期限
  sheet.setColumnWidth(4, 100); // ステータス
  sheet.setColumnWidth(5, 100); // 今週やること
  sheet.setColumnWidth(6, 200); // メモ

  // 条件付き書式（ステータスによる行の色分け）
  const dataRange = sheet.getRange(2, 1, 100, headers.length);

  // 完了 → 緑
  const completedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D2="✅完了"')
    .setBackground('#d9ead3')
    .setRanges([dataRange])
    .build();

  // 進行中 → 黄色
  const inProgressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D2="🔄進行中"')
    .setBackground('#fff2cc')
    .setRanges([dataRange])
    .build();

  // 未着手 → 赤
  const notStartedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D2="❌未着手"')
    .setBackground('#f4cccc')
    .setRanges([dataRange])
    .build();

  sheet.setConditionalFormatRules([completedRule, inProgressRule, notStartedRule]);

  // 行固定
  sheet.setFrozenRows(1);

  Logger.log('=== タスク進捗シートを作成しました ===');
  Logger.log('シート名: タスク進捗');
  Logger.log('URL: ' + ss.getUrl() + '#gid=' + sheet.getSheetId());
}

/**
 * 毎週月曜11:30にSlack通知を送る
 * トリガー設定: 編集 > 現在のプロジェクトのトリガー > トリガーを追加
 */
function sendWeeklySlackNotification() {
  const SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL'; // ここにWebhook URLを入れる

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('タスク進捗');

  if (!sheet) {
    Logger.log('タスク進捗シートが見つかりません');
    return;
  }

  // データ取得
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const tasks = data.slice(1);

  // 今週やることにチェックが入っているタスクを抽出
  const thisWeekTasks = tasks.filter(row => row[4] === true); // 5列目（今週やること）

  if (thisWeekTasks.length === 0) {
    Logger.log('今週のタスクがありません');
    return;
  }

  // Slack用メッセージ作成
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'M/d');
  let message = `*【採用】週次定例まとめ（${today}）*\n\n`;
  message += '*今週やること:*\n';

  thisWeekTasks.forEach(task => {
    const taskName = task[0];
    const assignee = task[1];
    const deadline = task[2];
    const status = task[3];
    message += `• ${taskName}（${assignee}・${deadline}まで）${status}\n`;
  });

  message += '\n';
  message += `<https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}|📊 タスク管理シートを開く>`;

  // Slack送信
  const payload = {
    text: message
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
    Logger.log('Slack通知を送信しました');
  } catch (e) {
    Logger.log('Slack送信エラー: ' + e.message);
  }
}

/**
 * Slack通知のテスト（手動実行用）
 */
function testSlackNotification() {
  sendWeeklySlackNotification();
}

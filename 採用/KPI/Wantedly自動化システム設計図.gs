/**
 * Wantedly自動化システム 設計図
 *
 * 用途：松原さんが開発中の自動化システムの全体像を可視化
 *
 * 使い方：
 * 1. 採用管理シートを開く
 * 2. 拡張機能 > Apps Script
 * 3. このコードをコピペ
 * 4. createSystemOverviewSheet() を実行
 */

// 採用管理シートのID
const SPREADSHEET_ID = '1Xs3__LaMXnMCMxEv6B6Qq9FgBI1cG0V6-l91XbhlYPE';

/**
 * システム全体像シートを作成（フローチャート風）
 */
function createSystemOverviewSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 既存シートがあれば削除
  const existingSheet = ss.getSheetByName('システム全体像');
  if (existingSheet) {
    ss.deleteSheet(existingSheet);
  }

  const sheet = ss.insertSheet('システム全体像');

  // 背景を白に
  sheet.getRange('A1:G50').setBackground('#ffffff');

  // 列幅設定
  sheet.setColumnWidth(1, 30);   // 余白
  sheet.setColumnWidth(2, 200);  // メイン
  sheet.setColumnWidth(3, 50);   // 矢印
  sheet.setColumnWidth(4, 200);  // サブ
  sheet.setColumnWidth(5, 50);   // 矢印
  sheet.setColumnWidth(6, 200);  // 担当者
  sheet.setColumnWidth(7, 30);   // 余白

  // 行の高さ
  for (let i = 1; i <= 50; i++) {
    sheet.setRowHeight(i, 25);
  }

  // 色定義
  const colors = {
    title: '#1a73e8',      // 青
    ai: '#34a853',         // 緑（AI処理）
    human: '#fbbc04',      // 黄（人間作業）
    arrow: '#5f6368',      // グレー
    phase: '#e8eaed',      // 薄グレー
  };

  // === タイトル ===
  sheet.getRange('B1:F1').merge().setValue('Wantedly自動化システム 全体像').setBackground(colors.title).setFontColor('#ffffff').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');

  // === フェーズ1 ===
  sheet.getRange('B3:F3').merge().setValue('【フェーズ1】スカウト〜面談設定（1月中）').setBackground(colors.phase).setFontWeight('bold');

  // STEP 1: スクリーニング
  sheet.getRange('B5').setValue('Wantedly候補者').setBackground('#e3f2fd').setHorizontalAlignment('center');
  sheet.getRange('C5').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D5').setValue('🤖 AIスクリーニング').setBackground(colors.ai).setFontColor('#ffffff').setHorizontalAlignment('center');
  sheet.getRange('E5').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('F5').setValue('スプシに記入').setBackground('#e3f2fd').setHorizontalAlignment('center');

  // STEP 2: チェック
  sheet.getRange('B7').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('B8').setValue('👤 永田チェック').setBackground(colors.human).setHorizontalAlignment('center');
  sheet.getRange('C8').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D8').setValue('🤖 メッセージ一括生成').setBackground(colors.ai).setFontColor('#ffffff').setHorizontalAlignment('center');

  // STEP 3: 送付
  sheet.getRange('D9').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D10').setValue('👤 松原最終確認').setBackground(colors.human).setHorizontalAlignment('center');
  sheet.getRange('E10').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('F10').setValue('📤 送付（人間がボタン押す）').setBackground(colors.human).setHorizontalAlignment('center');

  // STEP 4: 返信対応
  sheet.getRange('B12').setValue('応募者から返信').setBackground('#e3f2fd').setHorizontalAlignment('center');
  sheet.getRange('C12').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D12').setValue('🤖 AI検知・提案').setBackground(colors.ai).setFontColor('#ffffff').setHorizontalAlignment('center');
  sheet.getRange('E12').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('F12').setValue('👤 担当者に通知').setBackground(colors.human).setHorizontalAlignment('center');

  // STEP 5: 面談設定（分岐）
  sheet.getRange('B14').setValue('「面談したい」返信').setBackground('#e3f2fd').setHorizontalAlignment('center');
  sheet.getRange('C14').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D14').setValue('🤖 ポジション判定').setBackground(colors.ai).setFontColor('#ffffff').setHorizontalAlignment('center');

  // 分岐
  sheet.getRange('D15').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('B16').setValue('コンサル').setBackground('#fff3e0').setHorizontalAlignment('center');
  sheet.getRange('C16').setValue('←').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D16').setValue('ポジション').setBackground('#e3f2fd').setHorizontalAlignment('center');
  sheet.getRange('E16').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('F16').setValue('PdM').setBackground('#e8f5e9').setHorizontalAlignment('center');

  // 担当者
  sheet.getRange('B17').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('F17').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('B18').setValue('👤 田島 / 永田').setBackground(colors.human).setHorizontalAlignment('center');
  sheet.getRange('F18').setValue('👤 そめひこ').setBackground(colors.human).setHorizontalAlignment('center');

  // カレンダー確認
  sheet.getRange('B19').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('F19').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('B20:F20').merge().setValue('🤖 カレンダー確認 → 日程候補ピックアップ → 返信案作成').setBackground(colors.ai).setFontColor('#ffffff').setHorizontalAlignment('center');

  // 最終返信
  sheet.getRange('D21').setValue('↓').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D22').setValue('👤 担当者が最終返信').setBackground(colors.human).setHorizontalAlignment('center');

  // === フェーズ2 ===
  sheet.getRange('B25:F25').merge().setValue('【フェーズ2】面談後の議事録連携（2月以降）').setBackground(colors.phase).setFontWeight('bold');

  sheet.getRange('B27').setValue('採用面談を実施').setBackground('#e3f2fd').setHorizontalAlignment('center');
  sheet.getRange('C27').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('D27').setValue('🤖 Fireflies議事録').setBackground(colors.ai).setFontColor('#ffffff').setHorizontalAlignment('center');
  sheet.getRange('E27').setValue('→').setHorizontalAlignment('center').setFontColor(colors.arrow);
  sheet.getRange('F27').setValue('カレンダー連携').setBackground('#e3f2fd').setHorizontalAlignment('center');

  sheet.getRange('F28').setValue('（採用ワードで検知）').setFontSize(9).setFontColor('#666666').setHorizontalAlignment('center');

  // === 凡例 ===
  sheet.getRange('B31').setValue('【凡例】').setFontWeight('bold');
  sheet.getRange('B32').setValue('🤖 AI処理').setBackground(colors.ai).setFontColor('#ffffff');
  sheet.getRange('C32').setValue('👤 人間作業').setBackground(colors.human);
  sheet.getRange('D32').setValue('データ/状態').setBackground('#e3f2fd');

  // 行固定
  sheet.setFrozenRows(1);

  Logger.log('=== システム全体像シートを作成しました ===');
  Logger.log('URL: ' + ss.getUrl() + '#gid=' + sheet.getSheetId());
}

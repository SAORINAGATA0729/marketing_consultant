/**
 * KAAAN 採用定例をGoogleカレンダーに登録するスクリプト
 *
 * 使い方：
 * 1. Google Apps Script（script.google.com）で新規プロジェクト作成
 * 2. このコードをコピペ
 * 3. createRecurringMeeting() を実行
 * 4. 初回は権限承認が必要
 */

function createRecurringMeeting() {
  // 設定
  const config = {
    title: '【採用】週次定例',
    attendees: ['matsubara_saya@moltsinc.co.jp', 'nagata_saori@moltsinc.co.jp'],
    dayOfWeek: CalendarApp.Weekday.MONDAY,
    startHour: 11,
    startMinute: 0,
    durationMinutes: 30,
    weeksToCreate: 12, // 12週間分（約3ヶ月）
  };

  // アジェンダ
  const description = `
【採用週次定例】

■ アジェンダ
1. 今週の進捗確認（5分）
2. 来週やること（5分）
3. ブロッカー・相談事項（5分）

■ 確認シート
・KPIシート
https://docs.google.com/spreadsheets/d/1jLGK_qUW-89YUOMDW_QuNWBanmHTT7U_72UBcB_11Fo/edit?gid=1064940847#gid=1064940847

・採用管理シート（Wantedly / リファラル）
https://docs.google.com/spreadsheets/d/1Xs3__LaMXnMCMxEv6B6Qq9FgBI1cG0V6-l91XbhlYPE/edit?gid=0#gid=0

■ 確認項目
□ Wantedly自動化システム進捗
□ Wantedly撮影手配
□ その他タスクのステータス更新

■ 参考
- 目標：2月末までに準備完了、3月から本格運用開始
- KGI：月50件面談（Wantedly 40件 + 別施策 10件）
`.trim();

  // カレンダー取得
  const calendar = CalendarApp.getDefaultCalendar();

  // 次の月曜日を取得
  let startDate = getNextDayOfWeek(new Date(), config.dayOfWeek);

  // 繰り返し予定を作成
  const createdEvents = [];

  for (let i = 0; i < config.weeksToCreate; i++) {
    const eventDate = new Date(startDate);
    eventDate.setDate(eventDate.getDate() + (i * 7));

    const startTime = new Date(eventDate);
    startTime.setHours(config.startHour, config.startMinute, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + config.durationMinutes);

    // イベント作成
    const event = calendar.createEvent(config.title, startTime, endTime, {
      description: description,
      guests: config.attendees.join(','),
      sendInvites: true
    });

    createdEvents.push({
      date: Utilities.formatDate(startTime, 'Asia/Tokyo', 'yyyy/MM/dd (E)'),
      time: Utilities.formatDate(startTime, 'Asia/Tokyo', 'HH:mm') + '-' + Utilities.formatDate(endTime, 'Asia/Tokyo', 'HH:mm')
    });
  }

  // 結果をログ出力
  Logger.log('=== 採用定例を登録しました ===');
  Logger.log('登録件数: ' + createdEvents.length + '件');
  Logger.log('');
  createdEvents.forEach(function(e) {
    Logger.log(e.date + ' ' + e.time);
  });
  Logger.log('');
  Logger.log('招待メール送信先: ' + config.attendees.join(', '));
}

/**
 * 次の指定曜日を取得
 */
function getNextDayOfWeek(date, dayOfWeek) {
  const resultDate = new Date(date);
  const currentDay = resultDate.getDay();

  // 曜日の数値変換（CalendarApp.Weekday → 0-6）
  const targetDay = {
    [CalendarApp.Weekday.SUNDAY]: 0,
    [CalendarApp.Weekday.MONDAY]: 1,
    [CalendarApp.Weekday.TUESDAY]: 2,
    [CalendarApp.Weekday.WEDNESDAY]: 3,
    [CalendarApp.Weekday.THURSDAY]: 4,
    [CalendarApp.Weekday.FRIDAY]: 5,
    [CalendarApp.Weekday.SATURDAY]: 6,
  }[dayOfWeek];

  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }

  resultDate.setDate(resultDate.getDate() + daysUntilTarget);
  return resultDate;
}

/**
 * 予定を削除したい場合（テスト用）
 * タイトルが一致する今後の予定を全削除
 */
function deleteRecurringMeetings() {
  const calendar = CalendarApp.getDefaultCalendar();
  const title = '【採用】週次定例';

  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 6);

  const events = calendar.getEvents(now, endDate);
  let deleteCount = 0;

  events.forEach(function(event) {
    if (event.getTitle() === title) {
      event.deleteEvent();
      deleteCount++;
    }
  });

  Logger.log('削除件数: ' + deleteCount + '件');
}

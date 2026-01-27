#!/usr/bin/env python3
"""
Firefliesから議事録を取得し、適切なフォルダに保存するスクリプト
GitHub Actionsで毎日自動実行される
"""

import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Fireflies API設定
FIREFLIES_API_URL = "https://api.fireflies.ai/graphql"
FIREFLIES_API_KEY = os.environ.get("FIREFLIES_API_KEY")

# クライアント判定マッピング
CLIENT_MAPPING = {
    # キーワード: (フォルダ名, 優先度)
    "SHE": ("クライアント/SHE/議事録", 1),
    "シーライクス": ("クライアント/SHE/議事録", 1),
    "giftee": ("クライアント/giftee/議事録", 1),
    "ギフティ": ("クライアント/giftee/議事録", 1),
    "AeyeScan": ("クライアント/AeyeScan/議事録", 1),
    "エーアイスキャン": ("クライアント/AeyeScan/議事録", 1),
    "Dsmart": ("クライアント/Dsmart/議事録", 1),
    "ディースマート": ("クライアント/Dsmart/議事録", 1),
    "ミズテック": ("クライアント/ミズテック/議事録", 1),
    "Mizutec": ("クライアント/ミズテック/議事録", 1),
    "nikkenhomes": ("クライアント/nikkenhomes/議事録", 1),
    "日建ホームズ": ("クライアント/nikkenhomes/議事録", 1),
    "tantan": ("クライアント/tantan/議事録", 1),
    "寺倉": ("寺倉ナレッジ/会議一覧", 2),
    "KAAAN": ("社内/議事録", 3),
    "カーン": ("社内/議事録", 3),
    "採用": ("採用/議事録", 3),
    "面談": ("採用/議事録", 3),
    "面接": ("採用/議事録", 3),
}

def get_recent_transcripts(days=1):
    """過去N日間の議事録を取得"""
    query = """
    query Transcripts($fromDate: DateTime) {
        transcripts(fromDate: $fromDate) {
            id
            title
            date
            duration
            participants
            summary {
                overview
                action_items
            }
        }
    }
    """

    from_date = (datetime.now() - timedelta(days=days)).isoformat()

    headers = {
        "Authorization": f"Bearer {FIREFLIES_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        FIREFLIES_API_URL,
        headers=headers,
        json={"query": query, "variables": {"fromDate": from_date}}
    )

    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        return []

    data = response.json()
    return data.get("data", {}).get("transcripts", [])


def get_transcript_details(transcript_id):
    """議事録の詳細を取得"""
    query = """
    query Transcript($id: String!) {
        transcript(id: $id) {
            id
            title
            date
            duration
            participants
            transcript_url
            summary {
                overview
                action_items
                keywords
            }
            sentences {
                speaker_name
                text
            }
        }
    }
    """

    headers = {
        "Authorization": f"Bearer {FIREFLIES_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        FIREFLIES_API_URL,
        headers=headers,
        json={"query": query, "variables": {"id": transcript_id}}
    )

    if response.status_code != 200:
        return None

    data = response.json()
    return data.get("data", {}).get("transcript")


def detect_client(title):
    """会議タイトルからクライアントを判定"""
    best_match = None
    best_priority = 999

    for keyword, (folder, priority) in CLIENT_MAPPING.items():
        if keyword.lower() in title.lower():
            if priority < best_priority:
                best_match = folder
                best_priority = priority

    return best_match or "その他/議事録"


def format_date(date_str):
    """日付をYYMMDD形式に変換"""
    dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    return dt.strftime("%y%m%d")


def create_markdown(transcript):
    """議事録をMarkdown形式に整形"""
    title = transcript.get("title", "無題")
    date = transcript.get("date", "")
    participants = transcript.get("participants", [])
    url = transcript.get("transcript_url", "")
    summary = transcript.get("summary", {})
    sentences = transcript.get("sentences", [])

    # 参加者リスト
    participants_str = ", ".join(participants) if participants else "不明"

    # サマリー
    overview = summary.get("overview", "サマリーなし")
    action_items = summary.get("action_items", [])

    # 本文
    transcript_text = ""
    current_speaker = None
    for sentence in sentences:
        speaker = sentence.get("speaker_name", "不明")
        text = sentence.get("text", "")
        if speaker != current_speaker:
            transcript_text += f"\n\n**{speaker}**: "
            current_speaker = speaker
        transcript_text += text + " "

    # Markdown生成
    md = f"""# {title}

**日時**: {date}
**参加者**: {participants_str}
**Fireflies URL**: {url}

---

## サマリー
{overview}

## 議事録
{transcript_text.strip()}

---

## アクションアイテム
"""

    if action_items:
        for item in action_items:
            md += f"- {item}\n"
    else:
        md += "なし\n"

    return md


def save_transcript(transcript):
    """議事録をファイルに保存"""
    title = transcript.get("title", "無題")
    date = transcript.get("date", "")

    # クライアント判定
    folder = detect_client(title)

    # ファイル名生成
    date_str = format_date(date)
    safe_title = "".join(c for c in title if c.isalnum() or c in "_ -").strip()[:30]
    filename = f"{date_str}_{safe_title}.md"

    # フォルダ作成
    folder_path = Path(folder)
    folder_path.mkdir(parents=True, exist_ok=True)

    # ファイル保存
    file_path = folder_path / filename

    # 既存ファイルチェック
    if file_path.exists():
        print(f"Skip (already exists): {file_path}")
        return None

    # Markdown生成・保存
    md_content = create_markdown(transcript)
    file_path.write_text(md_content, encoding="utf-8")

    print(f"Saved: {file_path}")
    return str(file_path)


def main():
    if not FIREFLIES_API_KEY:
        print("Error: FIREFLIES_API_KEY not set")
        return

    print("Fetching recent transcripts...")
    # 2日分チェック（週末・祝日対応、重複は自動スキップ）
    transcripts = get_recent_transcripts(days=2)

    if not transcripts:
        print("No new transcripts found")
        return

    print(f"Found {len(transcripts)} transcript(s)")

    saved_files = []
    for t in transcripts:
        print(f"Processing: {t.get('title')}")
        details = get_transcript_details(t.get("id"))
        if details:
            saved = save_transcript(details)
            if saved:
                saved_files.append(saved)

    print(f"\nSaved {len(saved_files)} file(s)")


if __name__ == "__main__":
    main()

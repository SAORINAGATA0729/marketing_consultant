#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wantedlyスナップショットファイルからテキスト情報を抽出してまとめる
"""

import re
import json
from pathlib import Path
from collections import defaultdict

# 企業情報
COMPANIES = [
    {"name": "NOVEL株式会社", "url": "https://www.wantedly.com/companies/company_1207250"},
    {"name": "株式会社メディアファースト", "url": "https://www.wantedly.com/companies/media1st"},
    {"name": "株式会社リーヴオン", "url": "https://www.wantedly.com/companies/company_525282"},
    {"name": "株式会社エアークローゼット", "url": "https://www.wantedly.com/companies/airCloset"},
    {"name": "PROJECT GROUP株式会社", "url": "https://www.wantedly.com/companies/project-lc2012"},
    {"name": "ジャッグジャパン株式会社", "url": "https://www.wantedly.com/companies/jagjapan"},
    {"name": "株式会社AINEXT", "url": "https://www.wantedly.com/companies/company_686692"},
    {"name": "株式会社エスコプロモーション", "url": "https://www.wantedly.com/companies/company_2055615"},
    {"name": "株式会社 サン・クレア", "url": "https://www.wantedly.com/companies/sun-crea"},
    {"name": "株式会社LiNew", "url": "https://www.wantedly.com/companies/company_513077"},
]

def extract_text_from_snapshot(snapshot_file):
    """スナップショットファイルからテキスト情報を抽出"""
    try:
        with open(snapshot_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {"home": f"エラー: {e}", "about": f"エラー: {e}"}
    
    # name属性からテキストを抽出
    name_pattern = r'name:\s*([^\n]+)'
    all_names = re.findall(name_pattern, content)
    
    # 意味のあるテキストをフィルタリング（短すぎるものやUI要素を除外）
    meaningful_texts = []
    skip_patterns = [
        r'^\s*$',  # 空文字
        r'^[0-9]+$',  # 数字のみ
        r'^[a-zA-Z]+$',  # アルファベットのみ（短い）
        r'^[あ-ん]{1,2}$',  # ひらがな1-2文字
        r'^[ア-ン]{1,2}$',  # カタカナ1-2文字
        r'^[一-龯]{1,2}$',  # 漢字1-2文字
        r'^http',  # URL
        r'^メンバーと話せる',  # UI要素
        r'^最新順で表示',  # UI要素
        r'^もっと見る',  # UI要素
        r'^フォロー',  # UI要素
        r'^採用担当者の方はこちら',  # UI要素
        r'^ウォンテッドリーのロゴ',  # UI要素
    ]
    
    for text in all_names:
        text = text.strip()
        if len(text) < 3:  # 3文字未満は除外
            continue
        
        # スキップパターンに一致するかチェック
        should_skip = False
        for pattern in skip_patterns:
            if re.match(pattern, text):
                should_skip = True
                break
        
        if not should_skip:
            meaningful_texts.append(text)
    
    # 「ホーム」と「私たちについて」のセクションを特定
    home_texts = []
    about_texts = []
    
    lines = content.split('\n')
    current_section = None
    in_home = False
    in_about = False
    
    for i, line in enumerate(lines):
        # セクションの開始を検出
        if 'ホーム' in line or ('link' in line.lower() and 'name: ホーム' in line):
            in_home = True
            in_about = False
        elif '私たちについて' in line or 'about' in line.lower() or ('link' in line.lower() and 'name: 私たちについて' in line):
            in_about = True
            in_home = False
        
        # name属性からテキストを抽出
        if 'name:' in line:
            text = line.split('name:')[1].strip()
            if text and len(text) >= 3:
                # スキップパターンチェック
                should_skip = False
                for pattern in skip_patterns:
                    if re.match(pattern, text):
                        should_skip = True
                        break
                
                if not should_skip:
                    if in_home:
                        home_texts.append(text)
                    elif in_about:
                        about_texts.append(text)
    
    # 重複を削除し、順序を保持
    home_unique = []
    seen_home = set()
    for text in home_texts:
        if text not in seen_home:
            home_unique.append(text)
            seen_home.add(text)
    
    about_unique = []
    seen_about = set()
    for text in about_texts:
        if text not in seen_about:
            about_unique.append(text)
            seen_about.add(text)
    
    return {
        "home": '\n'.join(home_unique[:100]),  # 最初の100件
        "about": '\n'.join(about_unique[:100])
    }

def main():
    """メイン処理"""
    snapshot_dir = Path.home() / '.cursor' / 'browser-logs'
    
    # 最新のスナップショットファイルを取得（NOVEL株式会社用）
    snapshot_files = sorted(snapshot_dir.glob('snapshot-*.log'), key=lambda x: x.stat().st_mtime, reverse=True)
    
    if not snapshot_files:
        print("スナップショットファイルが見つかりません")
        return
    
    # 最新のファイルから情報を抽出（テスト用）
    latest_snapshot = snapshot_files[0]
    print(f"処理中: {latest_snapshot.name}")
    
    result = extract_text_from_snapshot(latest_snapshot)
    
    print("\n=== ホーム ===")
    print(result['home'][:1000])
    print("\n=== 私たちについて ===")
    print(result['about'][:1000])

if __name__ == "__main__":
    main()

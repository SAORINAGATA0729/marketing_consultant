#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wantedlyスナップショットファイルからテキスト情報を抽出
"""

import yaml
import json
import re
from pathlib import Path

def extract_text_from_snapshot(snapshot_file):
    """スナップショットファイルからテキスト情報を抽出"""
    with open(snapshot_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # YAML形式のスナップショットからテキストを抽出
    text_content = []
    
    # name属性を持つ要素のテキストを抽出
    name_pattern = r'name:\s*([^\n]+)'
    names = re.findall(name_pattern, content)
    
    # 重要なセクションを特定
    home_text = []
    about_text = []
    current_section = None
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'ホーム' in line or 'home' in line.lower():
            current_section = 'home'
        elif '私たちについて' in line or 'about' in line.lower() or 'about-us' in line.lower():
            current_section = 'about'
        elif 'name:' in line:
            text = line.split('name:')[1].strip()
            if text and len(text) > 5:  # 短すぎるテキストは除外
                if current_section == 'home':
                    home_text.append(text)
                elif current_section == 'about':
                    about_text.append(text)
    
    return {
        'home': '\n'.join(home_text[:50]),  # 最初の50行
        'about': '\n'.join(about_text[:50])
    }

def main():
    """メイン処理"""
    snapshot_dir = Path.home() / '.cursor' / 'browser-logs'
    
    # 最新のスナップショットファイルを取得
    snapshot_files = sorted(snapshot_dir.glob('snapshot-*.log'), key=lambda x: x.stat().st_mtime, reverse=True)
    
    if not snapshot_files:
        print("スナップショットファイルが見つかりません")
        return
    
    # 最新のファイルから情報を抽出
    latest_snapshot = snapshot_files[0]
    print(f"処理中: {latest_snapshot.name}")
    
    result = extract_text_from_snapshot(latest_snapshot)
    
    print("\n=== ホーム ===")
    print(result['home'][:500])
    print("\n=== 私たちについて ===")
    print(result['about'][:500])

if __name__ == "__main__":
    main()

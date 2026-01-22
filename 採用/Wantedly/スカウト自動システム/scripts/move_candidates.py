#!/usr/bin/env python3
"""
候補者フォルダ内のmdファイルをOK/NG判断に基づいてフォルダ移動するスクリプト
"""

import os
import re
import shutil
from pathlib import Path
from datetime import datetime

# パス設定
BASE_DIR = Path(__file__).parent.parent
CANDIDATES_DIR = BASE_DIR / "候補者フォルダ"
OK_DIR = BASE_DIR / "OKフォルダ"
NG_DIR = BASE_DIR / "NGフォルダ"

def extract_status_from_md(file_path):
    """mdファイルからスクリーニング結果のステータスを抽出"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # スクリーニング結果セクションを探す
        status_match = re.search(r'## スクリーニング結果\s*\n.*?\*\*ステータス\*\*:\s*(OK|NG|要確認)', content, re.DOTALL)
        if status_match:
            return status_match.group(1)
        
        return None
    except Exception as e:
        print(f"エラー: {file_path} の読み込みに失敗しました: {e}")
        return None

def move_file(file_path, status):
    """ファイルを適切なフォルダに移動"""
    if status == "OK":
        dest_dir = OK_DIR
    elif status == "NG":
        dest_dir = NG_DIR
    else:
        # 要確認や未判断の場合は移動しない
        return False
    
    try:
        dest_path = dest_dir / file_path.name
        # 既に存在する場合は上書き
        if dest_path.exists():
            print(f"警告: {dest_path} は既に存在します。上書きします。")
        
        shutil.move(str(file_path), str(dest_path))
        print(f"移動完了: {file_path.name} -> {dest_dir.name}/")
        return True
    except Exception as e:
        print(f"エラー: {file_path.name} の移動に失敗しました: {e}")
        return False

def main():
    """メイン処理"""
    print("=" * 60)
    print("候補者ファイル移動スクリプト")
    print("=" * 60)
    
    # フォルダが存在しない場合は作成
    OK_DIR.mkdir(parents=True, exist_ok=True)
    NG_DIR.mkdir(parents=True, exist_ok=True)
    
    # 候補者フォルダ内のmdファイルを取得
    md_files = list(CANDIDATES_DIR.glob("*.md"))
    
    if not md_files:
        print("候補者フォルダにmdファイルが見つかりませんでした。")
        return
    
    print(f"\n{len(md_files)}件のファイルを確認します...\n")
    
    moved_count = {"OK": 0, "NG": 0}
    remaining_count = 0
    
    for md_file in md_files:
        status = extract_status_from_md(md_file)
        
        if status in ["OK", "NG"]:
            if move_file(md_file, status):
                moved_count[status] += 1
        else:
            remaining_count += 1
            print(f"スキップ: {md_file.name} (ステータス: {status or '未判断'})")
    
    print("\n" + "=" * 60)
    print("処理完了")
    print("=" * 60)
    print(f"OKフォルダへ移動: {moved_count['OK']}件")
    print(f"NGフォルダへ移動: {moved_count['NG']}件")
    print(f"候補者フォルダに残り: {remaining_count}件")

if __name__ == "__main__":
    main()

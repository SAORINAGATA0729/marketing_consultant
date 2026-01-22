#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wantedly競合企業の「ホーム」と「私たちについて」をまとめてスクレイピング
ブラウザツールを使って各企業のページにアクセスし、情報を抽出
"""

import re
import json
from pathlib import Path

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

def extract_meaningful_text(content):
    """スナップショットファイルから意味のあるテキストを抽出"""
    # name属性からテキストを抽出
    name_pattern = r'name:\s*([^\n]+)'
    all_names = re.findall(name_pattern, content)
    
    # スキップパターン
    skip_patterns = [
        r'^\s*$',
        r'^[0-9]+$',
        r'^[a-zA-Z]{1,2}$',
        r'^http',
        r'^メンバーと話せる',
        r'^最新順で表示',
        r'^もっと見る',
        r'^フォロー',
        r'^採用担当者の方はこちら',
        r'^ウォンテッドリーのロゴ',
        r'^人や会社、募集を検索',
        r'^無料でログイン',
        r'^アプリをダウンロード',
        r'^Wantedly',
        r'^気軽に会社訪問',
        r'^成長できるインターンと出会う',
        r'^あなたの活躍を共有',
        r'^ビジネス向け',
        r'^サービス概要',
        r'^料金表',
        r'^導入事例',
        r'^社内報',
        r'^チームの状態',
        r'^福利厚生',
        r'^エンゲージメント',
        r'^採用',
        r'^運営会社',
        r'^ニュース',
        r'^採用情報',
    ]
    
    meaningful_texts = []
    for text in all_names:
        text = text.strip()
        if len(text) < 3:
            continue
        
        should_skip = False
        for pattern in skip_patterns:
            if re.match(pattern, text):
                should_skip = True
                break
        
        if not should_skip:
            meaningful_texts.append(text)
    
    # 重複を削除し、順序を保持
    unique_texts = []
    seen = set()
    for text in meaningful_texts:
        if text not in seen:
            unique_texts.append(text)
            seen.add(text)
    
    return '\n'.join(unique_texts)

def main():
    """メイン処理 - 各企業の情報をまとめる"""
    results = []
    
    # 各企業の情報を取得（現在はNOVEL株式会社のみ）
    # 実際にはブラウザツールを使って各企業のページにアクセスする必要があります
    
    print("=" * 60)
    print("Wantedly競合企業 情報抽出")
    print("=" * 60)
    print("\n注意: このスクリプトはブラウザツールと連携して使用します。")
    print("各企業のページにアクセスして、情報を取得してください。\n")
    
    # テンプレートファイルを作成
    output_file = "wantedly_競合企業_情報まとめ.md"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Wantedly競合企業 情報まとめ\n\n")
        f.write("募集ページ上位10社の「ホーム」と「私たちについて」の情報\n\n")
        f.write("**作成日**: 2026年1月11日\n\n")
        f.write("---\n\n")
        
        for i, company in enumerate(COMPANIES, 1):
            f.write(f"## {i}. {company['name']}\n\n")
            f.write(f"**URL**: {company['url']}\n\n")
            f.write("### ホーム\n\n")
            f.write("（情報取得中）\n\n")
            f.write("### 私たちについて\n\n")
            f.write("（情報取得中）\n\n")
            f.write("---\n\n")
    
    print(f"テンプレートファイルを作成しました: {output_file}")
    print("\n各企業のページにアクセスして、情報を取得してください。")

if __name__ == "__main__":
    main()

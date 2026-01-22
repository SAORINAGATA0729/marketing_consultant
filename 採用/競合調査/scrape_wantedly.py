#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wantedly企業ページの「ホーム」と「私たちについて」をスクレイピング
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin

# スクレイピング対象の企業URLリスト
COMPANIES = [
    {
        "name": "NOVEL株式会社",
        "url": "https://www.wantedly.com/companies/company_1207250"
    },
    {
        "name": "株式会社メディアファースト",
        "url": "https://www.wantedly.com/companies/media1st"
    },
    {
        "name": "株式会社リーヴオン",
        "url": "https://www.wantedly.com/companies/company_525282"
    },
    {
        "name": "株式会社エアークローゼット",
        "url": "https://www.wantedly.com/companies/airCloset"
    },
    {
        "name": "PROJECT GROUP株式会社",
        "url": "https://www.wantedly.com/companies/project-lc2012"
    },
    {
        "name": "ジャッグジャパン株式会社",
        "url": "https://www.wantedly.com/companies/jagjapan"
    },
    {
        "name": "株式会社AINEXT",
        "url": "https://www.wantedly.com/companies/company_686692"
    },
    {
        "name": "株式会社エスコプロモーション",
        "url": "https://www.wantedly.com/companies/company_2055615"
    },
    {
        "name": "株式会社 サン・クレア",
        "url": "https://www.wantedly.com/companies/sun-crea"
    },
    {
        "name": "株式会社LiNew",
        "url": "https://www.wantedly.com/companies/company_513077"
    }
]

def scrape_company(company_info):
    """企業のWantedlyページから情報をスクレイピング"""
    name = company_info["name"]
    url = company_info["url"]
    
    print(f"\n{'='*60}")
    print(f"スクレイピング中: {name}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        result = {
            "company_name": name,
            "url": url,
            "home": "",
            "about_us": ""
        }
        
        # 「ホーム」セクションの情報を取得
        # Wantedlyの構造に応じて適切なセレクタを使用
        home_section = soup.find('div', {'data-testid': 'company-home'}) or \
                      soup.find('section', class_='home') or \
                      soup.find('div', class_='company-home')
        
        if home_section:
            # テキストを抽出（不要な要素を除外）
            for script in home_section(["script", "style"]):
                script.decompose()
            result["home"] = home_section.get_text(separator='\n', strip=True)
        else:
            # フォールバック: ページ全体から関連情報を抽出
            main_content = soup.find('main') or soup.find('div', class_='main-content')
            if main_content:
                for script in main_content(["script", "style"]):
                    script.decompose()
                result["home"] = main_content.get_text(separator='\n', strip=True)[:5000]  # 最初の5000文字
        
        # 「私たちについて」セクションの情報を取得
        about_url = urljoin(url, '/about')
        try:
            about_response = requests.get(about_url, headers=headers, timeout=30)
            if about_response.status_code == 200:
                about_soup = BeautifulSoup(about_response.text, 'html.parser')
                about_section = about_soup.find('div', {'data-testid': 'company-about'}) or \
                               about_soup.find('section', class_='about') or \
                               about_soup.find('div', class_='company-about')
                
                if about_section:
                    for script in about_section(["script", "style"]):
                        script.decompose()
                    result["about_us"] = about_section.get_text(separator='\n', strip=True)
                else:
                    main_content = about_soup.find('main') or about_soup.find('div', class_='main-content')
                    if main_content:
                        for script in main_content(["script", "style"]):
                            script.decompose()
                        result["about_us"] = main_content.get_text(separator='\n', strip=True)[:5000]
        except Exception as e:
            print(f"  「私たちについて」ページの取得に失敗: {e}")
            # メインページから「私たちについて」の情報を探す
            about_section = soup.find('div', {'data-testid': 'company-about'}) or \
                           soup.find('section', class_='about') or \
                           soup.find('div', class_='company-about')
            if about_section:
                for script in about_section(["script", "style"]):
                    script.decompose()
                result["about_us"] = about_section.get_text(separator='\n', strip=True)
        
        return result
        
    except Exception as e:
        print(f"  エラー: {e}")
        return {
            "company_name": name,
            "url": url,
            "home": f"エラー: {str(e)}",
            "about_us": f"エラー: {str(e)}"
        }

def main():
    """メイン処理"""
    results = []
    
    for company in COMPANIES:
        result = scrape_company(company)
        results.append(result)
        time.sleep(2)  # リクエスト間隔を空ける
    
    # 結果をJSONファイルに保存
    output_file = "wantedly_scraping_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # 結果をMarkdown形式でも保存
    md_output_file = "wantedly_scraping_results.md"
    with open(md_output_file, 'w', encoding='utf-8') as f:
        f.write("# Wantedly企業ページ スクレイピング結果\n\n")
        f.write("募集ページ上位10社の「ホーム」と「私たちについて」の情報\n\n")
        f.write("---\n\n")
        
        for result in results:
            f.write(f"## {result['company_name']}\n\n")
            f.write(f"**URL**: {result['url']}\n\n")
            
            f.write("### ホーム\n\n")
            if result['home']:
                f.write(f"{result['home']}\n\n")
            else:
                f.write("（情報なし）\n\n")
            
            f.write("### 私たちについて\n\n")
            if result['about_us']:
                f.write(f"{result['about_us']}\n\n")
            else:
                f.write("（情報なし）\n\n")
            
            f.write("---\n\n")
    
    print(f"\n{'='*60}")
    print("スクレイピング完了!")
    print(f"JSON形式: {output_file}")
    print(f"Markdown形式: {md_output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()

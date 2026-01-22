"""
Wantedly求人ページスクレイピングスクリプト
須藤さんが見た求人ページの内容を取得してMarkdownファイルに保存
"""

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re
from datetime import datetime
from pathlib import Path


def clean_text(text):
    """テキストをクリーンアップ"""
    if not text:
        return ""
    # 改行と空白を整理
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text


def scrape_wantedly_project(url: str, output_path: str = None):
    """
    Wantedlyの求人ページをスクレイピング
    
    Args:
        url: WantedlyのプロジェクトURL
        output_path: 出力先ファイルパス（指定しない場合は自動生成）
    """
    if output_path is None:
        output_dir = Path(__file__).parent
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = output_dir / f"Wantedly求人_スクレイピング結果_{timestamp}.md"
    
    print(f"スクレイピング開始: {url}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # User-Agentを設定
        page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        # ページにアクセス
        page.goto(url, wait_until="networkidle", timeout=60000)
        
        # コンテンツが読み込まれるまで少し待機
        page.wait_for_timeout(3000)
        
        # HTMLを取得
        html = page.content()
        browser.close()
    
    # BeautifulSoupでパース
    soup = BeautifulSoup(html, 'html.parser')
    
    # データを抽出
    data = {}
    
    # タイトル
    title_elem = soup.select_one('h1[data-testid="project-title"], h1.project-title, h1')
    data['title'] = clean_text(title_elem.get_text()) if title_elem else ""
    
    # 会社名
    company_elem = soup.select_one('a[href*="/companies/"], .company-name')
    data['company'] = clean_text(company_elem.get_text()) if company_elem else ""
    
    # オープンポジションかどうか
    open_position_elem = soup.find(string=re.compile('オープンポジション'))
    data['is_open_position'] = open_position_elem is not None
    
    # エントリー数
    entry_elem = soup.find(string=re.compile('エントリー'))
    if entry_elem:
        entry_text = entry_elem.find_parent().get_text() if hasattr(entry_elem, 'find_parent') else str(entry_elem)
        entry_match = re.search(r'(\d+)\s*エントリー', entry_text)
        data['entry_count'] = entry_match.group(1) if entry_match else ""
    else:
        data['entry_count'] = ""
    
    # メンバー情報
    members = []
    member_elems = soup.select('[data-testid="member-card"], .member-card, .project-member')
    for member_elem in member_elems[:10]:  # 最初の10人まで
        member_name = ""
        member_role = ""
        member_story_link = ""
        
        name_elem = member_elem.select_one('h3, .member-name, [data-testid="member-name"]')
        if name_elem:
            member_name = clean_text(name_elem.get_text())
        
        role_elem = member_elem.select_one('.member-role, [data-testid="member-role"]')
        if role_elem:
            member_role = clean_text(role_elem.get_text())
        
        story_link_elem = member_elem.select_one('a[href*="/stories/"]')
        if story_link_elem:
            member_story_link = story_link_elem.get('href', '')
            if not member_story_link.startswith('http'):
                member_story_link = f"https://www.wantedly.com{member_story_link}"
        
        if member_name:
            members.append({
                'name': member_name,
                'role': member_role,
                'story_link': member_story_link
            })
    
    data['members'] = members
    
    # プロジェクトの説明（「なにをやっているのか」セクション）
    description_sections = []
    
    # セクションタイトルと内容を抽出
    section_titles = soup.select('h2, h3, [class*="section-title"], [class*="heading"]')
    for title_elem in section_titles:
        title_text = clean_text(title_elem.get_text())
        if not title_text:
            continue
        
        # 次の要素から内容を取得
        content = []
        next_elem = title_elem.find_next_sibling()
        while next_elem and next_elem.name not in ['h2', 'h3', 'h1']:
            if next_elem.name == 'p':
                text = clean_text(next_elem.get_text())
                if text:
                    content.append(text)
            elif next_elem.name == 'ul':
                items = []
                for li in next_elem.select('li'):
                    item_text = clean_text(li.get_text())
                    if item_text:
                        items.append(f"- {item_text}")
                if items:
                    content.append('\n'.join(items))
            next_elem = next_elem.find_next_sibling()
        
        if content:
            description_sections.append({
                'title': title_text,
                'content': '\n\n'.join(content)
            })
    
    data['description_sections'] = description_sections
    
    # 募集要項（「こんなことやります」セクション）
    job_description = ""
    job_desc_elem = soup.select_one('[class*="job-description"], [class*="project-description"], .project-content')
    if job_desc_elem:
        job_description = clean_text(job_desc_elem.get_text())
    
    data['job_description'] = job_description
    
    # 求める人物像
    requirements = []
    req_elem = soup.find(string=re.compile('求める人物像|こんな方におすすめ'))
    if req_elem:
        req_parent = req_elem.find_parent() if hasattr(req_elem, 'find_parent') else None
        if req_parent:
            req_items = req_parent.find_all('li')
            for item in req_items:
                req_text = clean_text(item.get_text())
                if req_text:
                    requirements.append(req_text)
    
    data['requirements'] = requirements
    
    # 生のHTMLも保存（念のため）
    data['raw_html'] = html
    
    # Markdownファイルに出力
    output_path = Path(output_path)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"# Wantedly求人ページスクレイピング結果\n\n")
        f.write(f"**URL**: {url}\n\n")
        f.write(f"**取得日時**: {datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}\n\n")
        f.write("---\n\n")
        
        f.write(f"## 基本情報\n\n")
        f.write(f"- **タイトル**: {data['title']}\n")
        f.write(f"- **会社名**: {data['company']}\n")
        f.write(f"- **オープンポジション**: {'はい' if data['is_open_position'] else 'いいえ'}\n")
        f.write(f"- **エントリー数**: {data['entry_count']}\n\n")
        
        if data['members']:
            f.write(f"## メンバー情報\n\n")
            for member in data['members']:
                f.write(f"### {member['name']}\n")
                if member['role']:
                    f.write(f"**役職**: {member['role']}\n\n")
                if member['story_link']:
                    f.write(f"**ストーリー**: {member['story_link']}\n\n")
        
        if data['description_sections']:
            f.write(f"## プロジェクト説明\n\n")
            for section in data['description_sections']:
                f.write(f"### {section['title']}\n\n")
                f.write(f"{section['content']}\n\n")
        
        if data['job_description']:
            f.write(f"## 募集要項\n\n")
            f.write(f"{data['job_description']}\n\n")
        
        if data['requirements']:
            f.write(f"## 求める人物像\n\n")
            for req in data['requirements']:
                f.write(f"- {req}\n")
            f.write("\n")
        
        f.write("---\n\n")
        f.write("## 生HTML（参考用）\n\n")
        f.write("<details>\n<summary>HTMLを表示</summary>\n\n")
        f.write("```html\n")
        f.write(html[:50000])  # 最初の50000文字のみ
        f.write("\n```\n\n")
        f.write("</details>\n")
    
    print(f"スクレイピング完了: {output_path}")
    return data, output_path


if __name__ == "__main__":
    url = "https://www.wantedly.com/projects/1061604"
    output_path = Path(__file__).parent / "Wantedly求人_須藤さんが見た求人.md"
    
    try:
        data, saved_path = scrape_wantedly_project(url, str(output_path))
        print(f"\n✅ 成功: {saved_path}")
    except Exception as e:
        print(f"\n❌ エラー: {e}")
        import traceback
        traceback.print_exc()


base_url = "https://test.quran.com/_next/data/mMF_DOMUEFx1SUaqdXpKl/en/page/<page_id>.json"

import requests
import json

qpcV2 = {}
# read the json file ./static/QPC2/qpc-v2.json
with open("./static/QPC2/qpc-v2.json", "r", encoding="utf-8") as f:
    qpcV2 = json.load(f)

for page_id in range(1, 605):
    url = base_url.replace("<page_id>", str(page_id))
    response = requests.get(url)
    data = response.json()
    
    # Extracting mushaf layout data
    pagesLookup = data.get("pageProps").get("pageVerses").get("pagesLookup")
    mushaf_layout = data.get("pageProps").get("pageVerses").get("verses")
    
    verses = []
    for verse in mushaf_layout:
        words = []
        for word in verse["words"]:
            words.append({
                "position": word["position"],
                "location": word["location"],
                "line": word["lineNumber"],
                "text": word["textUthmani"],
                "qpc": qpcV2.get(str(word["location"])),
                "lineNumber": word["lineNumber"],
                "audioUrl": word["audioUrl"]
            })
        
        verses.append({
            "verseKey": verse["verseKey"],
            "surahNumber": verse["chapterId"],
            "verseNumber": verse["verseNumber"],
            "text": verse["textUthmani"],
            "words": words
        })
    
    page_data = {
        "pageId": page_id,
        "verses": verses,
        "pagesLookup": pagesLookup
    }
    with open(f"./static/mushaf-layout/page-{page_id}.json", "w", encoding="utf-8") as f:
        json.dump(page_data, f, ensure_ascii=False)
        
    print(f"Page {page_id} done")

# AirTraveler's Book

AirTraveler's Book 是一個靜態飛機圖鑑網站，提供航空公司與機型家族介紹。首頁可以依航空公司或機型篩選資料，機型卡片可連到詳細頁查看家族亮點、常見營運航空、規格與型號差異。

## 功能

- 航空公司與機型篩選
- 航空公司機隊卡片列表
- 機型家族詳細頁
- 機型亮點、舒適度、規格與型號比較
- 航空公司錨點連結，方便從機型頁回到首頁對應航空公司

## 專案結構

```text
.
├── index.html                  # 首頁：航空公司與機型篩選
├── aircraft.html               # 機型家族詳細頁
├── assets/
│   ├── css/
│   │   └── style.css           # 全站樣式
│   └── js/
│       ├── script.js           # 首頁資料載入與篩選邏輯
│       └── aircraft.js         # 機型詳細頁資料載入與渲染邏輯
├── data/
│   ├── airlines.json           # 航空公司與機隊資料
│   ├── aircraft-families.json  # 機型家族資料
│   └── aircraft-details.json   # 各型號詳細資料
└── img/
    ├── airplane.png            # 網站 icon
    └── pexels-carlos-ruiz-163887590-10864818.jpg
```

## 本機執行

這個專案會透過 JavaScript `fetch` 載入 `data/` 裡的 JSON 檔案，因此建議使用本機 HTTP server。

```bash
python3 -m http.server 8000
```

啟動後打開：

```text
http://localhost:8000/
```

## 資料維護

- 新增或修改航空公司：編輯 `data/airlines.json`
- 新增或修改機型家族：編輯 `data/aircraft-families.json`
- 新增或修改型號細節：編輯 `data/aircraft-details.json`

機型連結主要使用 slug，例如：

```text
aircraft.html?family=a350
aircraft.html?family=b787
```

如果首頁新增機型，需要確認 `assets/js/script.js` 裡的 `modelOptions` 與 `modelFamilyMap` 也有對應資料，這樣篩選選單與機型詳細頁連結才會正確。

## 技術

- HTML
- CSS
- Vanilla JavaScript
- JSON 靜態資料

## 注意事項

座位圖、航線與航空公司配置皆為示意資料，實際機隊與座艙配置請以各航空公司公告為準。

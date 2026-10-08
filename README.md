---
title: AI Food Tracking Health Dashboard
emoji: 🥗
colorFrom: pink
colorTo: red
sdk: static
app_file: dist/index.html
short_description: AI 飲食紀錄與健康儀表板
---

# AI 飲控小幫手

AI 飲控儀表板免費展示版：可試用照片上傳介面、查看範例營養資訊、記錄飲水與瀏覽趨勢。免費版不會辨識照片；顯示的是預設示範資料。

## 免費版功能

- 使用 Hugging Face Static Space，不需要 Docker、付費硬體或 API 金鑰。
- 圖片留在瀏覽器中，不會傳到伺服器。
- 餐點營養資料是介面示範用的範例，不是照片分析或醫療建議。
- 資料存在目前瀏覽器的本機儲存空間。

Space 只託管已建置的靜態檔案；建置在本機完成，不使用線上建置 credits 或付費運算。

## 本機執行

需要 Node.js 22 或更新版本。

1. 安裝相依套件：`npm install`
2. 執行 `npm run dev`

正式建置使用 `npm run build`；將 `dist/` 內的檔案一併上傳至 Space。

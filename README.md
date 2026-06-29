# 🏨 ホテル清掃シフト・報酬集計 管理システム

ホテルの清掃業務に特化した、シフト管理・部屋割当・報酬集計をワンストップで行えるWebアプリです。

🖥️ **[デモを見る](https://hotel-cleaning-shift-646.pages.dev/)**

---

## ✨ 主な機能

- **シフト管理** — スタッフの出勤日・担当時間帯を日別に登録・管理
- **部屋割当** — 清掃員を各客室に割り当て。担当状況を一覧で把握
- **報酬集計** — 清掃実績・部屋単価に基づいた報酬を自動計算
- **スタッフマスタ** — 従業員情報・単価設定をまとめて管理
- **初期デモデータ** — ワンクリックでサンプルデータをリセット・復元

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 |
| データ保存 | LocalStorage（サーバー不要） |
| ビルド | Vite 6 |
| デプロイ | Cloudflare Pages |

## 🚀 ローカル実行

```bash
git clone https://github.com/tatagen/hotel-cleaning-shift.git
cd hotel-cleaning-shift
npm install
npm run dev
```
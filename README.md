# Health Log App｜体調記録アプリ（React×Firebase）

日々の体調や服薬状況を、スマホ・PCから手軽に記録・振り返りできるWebアプリです。
「続けやすさ」と「振り返りやすさ」にこだわり、設計・UIUXを工夫しました。

## 🚀 アプリ概要

体調・服薬・気分を簡単に記録できるWebアプリです。
日々の小さな変化を「見える化」することで、セルフケアの習慣化をサポートします。

- **アプリURL**：[Health Log App（Vercel）](https://health-log-app.vercel.app/)

## 🛠️ 使用技術スタック

| 階層 / 機能    | 採用技術                                | 選定理由                                 |
| -------------- | --------------------------------------- | ---------------------------------------- |
| Frontend       | **React 19 + CRA（TypeScript）**        | 安定した構成・TypeScript対応             |
| 状態管理       | React Hooks（`useState` / `useEffect`） | 小〜中規模で十分                         |
| Authentication | **Firebase Auth**                       | Google / メール / ゲストログイン対応     |
| Database       | **Firestore**                           | リアルタイム購読・ユーザーIDでデータ分離 |
| Hosting        | **Vercel**                              | GitHub push → 自動デプロイ               |

## 🌟 主な機能（実装済み）

- 体調メモ＋薬チェックの記録入力（複数の薬に対応）
- ログの一覧表示・編集・削除（Firestoreと連携）
- **Firebase Auth（Google / メール / ゲストログイン）✅**
- **ユーザーIDでFirestoreデータを分離 ✅**
- 日付ごとの記録をカレンダーから確認可能
- 季節ごとのテーマ切り替え（色・メッセージ）
- Markdown形式での出力

## 🔥 今後の開発予定

- 薬のカスタム登録と管理機能
- 花粉レベルの自動取得・表示
- ダークモード対応
- スマホ表示の最適化

## 🚀 ローカルでの実行手順

```bash
git clone https://github.com/ksk3gogodayo/health-log-app.git
cd health-log-app
npm install
npm run start
```

※ `.env` に Firebase の環境変数を設定してください。

## 👤 開発・運用者

池上 慶亮 / Keisuke Ikegami  
技術習得と転職活動の一環として開発・公開しています。

📣 フィードバック・レビュー大歓迎です！

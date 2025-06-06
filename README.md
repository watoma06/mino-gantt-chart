# LEXIA クライアント進捗管理システム

## プロジェクト概要

LEXIAクライアント専用の進捗管理ダッシュボード - 安全でリアルタイムなプロジェクト進捗の可視化

### 🎯 存在意義
このシステムは、LEXIA（ホームページ制作会社）とクライアント間のコミュニケーションを改善し、プロジェクトの透明性と効率性を向上させるために開発されました。

### ✨ 主要機能

#### 🆕 カンバンボード（2025年6月刷新）
- 旧ガントチャート・プログレスダッシュボードUIを廃止し、モバイルフレンドリーなカンバン（カードベース進捗管理）を導入
- タスクを「ToDo」「進行中」「完了」列でカード表示
- スマホ・PC両対応、縦スクロール・横スクロール両対応
- ステータスバッジ・依存・期間などもカード内で確認可能
- ドラッグ＆ドロップ対応（今後追加予定）

#### 🔒 セキュアな情報管理
- **パスワード認証**: クライアント情報へのアクセス制御
- **データ保護**: 開発者ツールからの情報漏洩防止
- **プロジェクト別認証**: 各プロジェクトごとの独立した認証システム

#### 📋 ヒヤリングシート管理
- **提出状況確認**: ヒヤリングシートの提出状況をリアルタイム表示
- **クライアント情報表示**: 認証後にクライアント詳細情報を安全に表示
- **アクション機能**: 連絡やシート再送などの管理機能

#### 📅 プロジェクト管理機能
- **複数プロジェクト表示**: タブ切り替えで複数案件を管理
- **進捗状況の可視化**: 各プロジェクトの現在状況を明確に表示
- **アクション管理**: 次に必要なアクションを明確に提示

#### 🔄 リアルタイム日付システム
- **現在日表示**: 1分ごとに更新される「今日」インジケーター
- **週間スケジュール**: 実際のカレンダー日付でタスクを表示
- **進捗同期**: ブラウザリフレッシュで最新状況を反映

### 🏢 対象クライアント
- **みのボクシングジム様**: スポーツ施設向けWebサイト制作
- **みの建築様**: 建築・設計事業向けWebサイト制作

### 🛠 技術スタック

#### フロントエンド
- **HTML5/CSS3**: モダンなレスポンシブデザイン
- **JavaScript (ES6+)**: インタラクティブなユーザーインターフェース
- **CSS Animations**: スムーズなUIアニメーション
- **Font Awesome**: アイコンライブラリ

#### バックエンド
- **Go言語**: 高性能なサーバーサイド処理（オプション）
- **Static Files**: 静的ファイルベースの軽量構成

#### セキュリティ
- **パスワード認証**: クライアント情報保護
- **データ暗号化**: 機密情報の安全な管理
- **開発者ツール対策**: ブラウザ開発者ツールからの情報漏洩防止

## 🚀 使用方法

### 1. プロジェクトのセットアップ
```bash
# プロジェクトのクローン
git clone [repository-url]
cd mino-gantt-chart

# ブラウザでindex.htmlを開く
```

### 2. ダッシュボードの操作
- 上部タブで「みのボクシングジム」「みの建築」を切り替え
- 各プロジェクトの進捗カード・全体進捗がダッシュボードに表示
- スマホ・PCどちらでも快適に閲覧可能

### 3. 主なUI要素
- **カンバンボード**: タスクをカードで表示し、進捗状況を直感的に把握
- **カード**: 各工程の進捗・依存・期間・ステータスを表示
- **レスポンシブ**: スマホ・PC両対応

### 📊 機能説明
- **進捗状況**: 完了（緑）、進行中（オレンジ）、開始可能（青）、待機中（グレー）、マイルストーン（緑）
- **レスポンシブ**: スマホ・タブレット・PCで最適化
- **セキュリティ**: パスワード認証・セッション管理

### 📝 備考
- 旧ガントチャートUIのCSS/JSは削除済み
- 進捗管理はカンバンボードを標準UIとします

### 🔐 セキュリティ機能
- **パスワード認証**: クライアント情報への安全なアクセス制御
- **データ保護**: 開発者ツールからの情報漏洩防止
- **プロジェクト別認証**: 各クライアントごとの独立したアクセス管理

### 📁 ファイル構成
```
mino-gantt-chart/
├── index.html              # メインダッシュボード
├── login.html              # パスワード認証ページ
├── scripts/
│   └── dashboard.js        # カンバンボード表示・認証・ダッシュボード主要機能
├── styles/
│   └── dashboard.css       # メインスタイルシート
├── server/                 # Go サーバー（オプション）
│   ├── main.go
│   └── go.mod
└── README.md              # プロジェクト説明
```

### 🚀 セットアップと起動

#### 1. 基本セットアップ
```bash
# プロジェクトを任意のディレクトリに配置
# ブラウザでlogin.htmlを開いてアクセス
```

#### 2. 開発サーバー使用（推奨）
```bash
# Live Server拡張機能を使用（VS Code）
# または任意の静的サーバーで起動
python -m http.server 8000  # Python使用の場合
# ブラウザで http://localhost:8000/login.html にアクセス
```

### 🔐 アクセス方法

#### パスワード認証
- **アクセスページ**: `login.html`
- **有効なパスワード**: 
  - `lexia2024`
  - `client2024` 
  - `admin2024`
- **セッション有効期限**: 24時間

### 📊 機能説明

#### セキュリティ
- **みのボクシングジム**: パスワード `boxing2024`
- **みの建築**: パスワード `archi2024`
- **情報保護**: 開発者ツールからクライアント情報を保護

#### プロジェクト状況（2025年6月2日現在）
- **みのボクシングジム**: ヒアリングシート提出待ち（進捗10%）
- **みの建築**: 要件詰め・提案書作成中（進捗20%）

### 🎯 今後の発展予定
- WebSocket通信によるリアルタイム更新
- AI による進捗予測機能
- カレンダー統合機能
- 自動通知システム
- 詳細分析機能

### 📞 サポート・お問い合わせ
- **開発者**: LEXIA開発チーム
- **プロジェクト管理**: 進捗管理システム専用

### 🏆 プロジェクトの成果
1. 透明性のあるプロジェクト進捗管理
2. セキュアなクライアント情報管理
3. 直感的で使いやすいインターフェース
4. モバイル対応によるアクセシビリティ向上
5. リアルタイム日付システムによる正確な進捗把握

---

**最終更新**: 2025年6月2日  
**バージョン**: 1.0.0  
**開発者**: LEXIA 進捗管理システム開発チーム

## 旧UIからの変更点
- ガントチャート・円形プログレス・進捗バーは廃止
- 進捗管理はカンバンボード（カードベース）に一本化

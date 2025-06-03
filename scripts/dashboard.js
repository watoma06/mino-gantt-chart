// =================
// 認証チェック機能
// =================

// ページ読み込み時の認証チェック
(function() {
    // 認証状態をチェック
    const isAuthenticated = sessionStorage.getItem('lexia_authenticated');
    const authTimestamp = sessionStorage.getItem('auth_timestamp');
    const currentTime = new Date().getTime();
    
    // 認証されていない、または24時間以上経過している場合
    if (isAuthenticated !== 'true' || !authTimestamp || 
        (currentTime - parseInt(authTimestamp)) > 24 * 60 * 60 * 1000) {
        
        // セッション情報をクリア
        sessionStorage.removeItem('lexia_authenticated');
        sessionStorage.removeItem('auth_timestamp');
        
        // ログインページにリダイレクト
        window.location.href = 'login.html';
        return;
    }
    
    // 認証済みの場合は通常の初期化を実行
    console.log('認証済みユーザーでアクセス中');
})();

// ダッシュボードの初期化
document.addEventListener('DOMContentLoaded', function() {
    // ログアウト機能を設定
    setupLogoutButton();
    
    initializeTabs();
    initializeKanbanBoards();
});

// ログアウト機能の設定
function setupLogoutButton() {
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        // クリックイベント（PCとモバイル両対応）
        logoutButton.addEventListener('click', handleLogout);
        
        // タッチイベント（モバイル専用）
        logoutButton.addEventListener('touchend', function(event) {
            event.preventDefault();
            handleLogout(event);
        });
    }
}

// ログアウト処理関数
function handleLogout(event) {
    event.preventDefault();
    
    // 確認ダイアログを表示
    if (confirm('ログアウトしますか？')) {
        // セッション情報をクリア
        sessionStorage.removeItem('lexia_authenticated');
        sessionStorage.removeItem('auth_timestamp');
        
        // ログインページにリダイレクト
        window.location.href = 'login.html';
    }
}

// =================
// Progress Dashboard機能
// =================

// プロジェクト開始日の設定（2025年6月1日）
const PROJECT_START_DATE = new Date('2025-06-01');

// 現在の週を計算する関数
function getCurrentWeek() {
    const today = new Date();
    const diffTime = today.getTime() - PROJECT_START_DATE.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.ceil(diffDays / 7);
    return Math.max(1, currentWeek); // 最低でも1週目として表示
}

// プロジェクトタスクデータを取得
function getProjectTasks(projectType) {
    const currentWeek = getCurrentWeek();
    
    let tasks = [];
    
    if (projectType === 'boxing') {
        tasks = [
            { name: 'ヒアリングシート提出', status: 'waiting', startWeek: 1, duration: 1, dependency: null },
            { name: '要件定義・企画', status: 'blocked', startWeek: 2, duration: 2, dependency: 'ヒアリングシート提出' },
            { name: 'デザイン設計', status: 'blocked', startWeek: 4, duration: 2, dependency: '要件定義・企画' },
            { name: 'コーディング・開発', status: 'blocked', startWeek: 6, duration: 3, dependency: 'デザイン設計' },
            { name: '機能実装・テスト', status: 'blocked', startWeek: 9, duration: 2, dependency: 'コーディング・開発' },
            { name: '最終調整・納品', status: 'blocked', startWeek: 11, duration: 1, dependency: '機能実装・テスト' },
            { name: '保守・運用開始', status: 'milestone', startWeek: 12, duration: 1, dependency: '最終調整・納品' }
        ];
    } else if (projectType === 'architecture') {
        tasks = [
            { name: 'ヒアリングシート受領', status: 'completed', startWeek: 1, duration: 1, dependency: null },
            { name: '要件詰め・提案書作成', status: 'in-progress', startWeek: 2, duration: 2, dependency: 'ヒアリングシート受領' },
            { name: 'デザイン設計', status: 'ready', startWeek: 4, duration: 2, dependency: '要件詰め・提案書作成' },
            { name: 'コーディング・開発', status: 'blocked', startWeek: 6, duration: 3, dependency: 'デザイン設計' },
            { name: '機能実装・テスト', status: 'blocked', startWeek: 9, duration: 2, dependency: 'コーディング・開発' },
            { name: '最終調整・納品', status: 'blocked', startWeek: 11, duration: 1, dependency: '機能実装・テスト' },
            { name: '保守・運用開始', status: 'milestone', startWeek: 12, duration: 1, dependency: '最終調整・納品' }
        ];
    }
    
    // スマホ環境での1-10週のデザイン設計・コーディングセルの削除
    if (window.innerWidth <= 768) {
        tasks = tasks.filter(task => {
            // デザイン設計とコーディング・開発のタスクで、1-10週の範囲のセルを削除
            if ((task.name === 'デザイン設計' || task.name === 'コーディング・開発') && 
                task.startWeek <= 10) {
                // スマホでは11週以降に表示を調整
                if (task.name === 'デザイン設計') {
                    return false; // デザイン設計は完全に削除
                }
                if (task.name === 'コーディング・開発') {
                    // コーディング・開発は削除（新しいスケジュールでは11週目以降に該当タスクなし）
                    return false;
                }
            }
            return true;
        });
    }
    
    return tasks;
}

// =================
// タブ機能
// =================

// タブ機能の初期化
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const projectContents = document.querySelectorAll('.project-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const projectType = button.getAttribute('data-project');
            
            // アクティブタブの切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // プロジェクトコンテンツの切り替え
            projectContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${projectType}-project`).classList.add('active');
        });
    });
}

// =================
// プログレス機能
// =================

// =================
// モーダル機能
// =================

// モーダルを開く
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// モーダルを閉じる
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// =================
// カンバンボード描画ロジック
// =================
function renderKanbanBoard(projectType) {
  console.log(`Kanbanボード描画中: ${projectType}`);
  const tasks = getProjectTasks(projectType);
  console.log(`タスク数: ${tasks.length}`, tasks);
  
  // ステータスごとに分類
  const todoList = document.getElementById(`${projectType}-todo-list`);
  const inprogressList = document.getElementById(`${projectType}-inprogress-list`);
  const completedList = document.getElementById(`${projectType}-completed-list`);
  
  if (!todoList || !inprogressList || !completedList) {
    console.error(`Kanban要素が見つかりません: ${projectType}`);
    return;
  }
  
  todoList.innerHTML = '';
  inprogressList.innerHTML = '';
  completedList.innerHTML = '';
  
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'kanban-card ' + (task.status === 'completed' ? 'completed' : task.status === 'in-progress' ? 'in-progress' : 'todo');
    card.innerHTML = `
      <div class="task-title">${task.name}</div>
      <div class="task-meta">
        <span>週: ${task.startWeek}</span>
        <span>期間: ${task.duration}週</span>
      </div>
      <span class="task-status-badge">${getStatusBadgeText(task.status)}</span>
      ${task.dependency ? `<div class="task-meta">依存: ${task.dependency}</div>` : ''}
    `;
    if (task.status === 'completed') {
      completedList.appendChild(card);
    } else if (task.status === 'in-progress') {
      inprogressList.appendChild(card);
    } else {
      todoList.appendChild(card);
    }
  });
  
  console.log(`${projectType} Kanbanボード描画完了`);
}

function getStatusBadgeText(status) {
  switch(status) {
    case 'completed': return '完了';
    case 'in-progress': return '進行中';
    case 'ready': return '開始可能';
    case 'waiting': return '待機中';
    case 'blocked': return 'ブロック中';
    case 'milestone': return 'マイルストーン';
    default: return '未定';
  }
}

// 初期化時にカンバン描画
function initializeKanbanBoards() {
  console.log('Kanbanボードを初期化中...');
  renderKanbanBoard('boxing');
  renderKanbanBoard('architecture');
  console.log('Kanbanボードの初期化完了');
}

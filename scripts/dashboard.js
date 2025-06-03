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
    // console.log('認証済みユーザーでアクセス中'); // Removed
})();

const KANBAN_AUTO_REFRESH_INTERVAL_MS = 60 * 1000; // 60 seconds

// ダッシュボードの初期化
document.addEventListener('DOMContentLoaded', function() {
    // ログアウト機能を設定
    setupLogoutButton();
    
    initializeTabs();
    initializeKanbanBoards();

    // Update days remaining every minute
    setInterval(updateAllDaysRemainingDisplays, KANBAN_AUTO_REFRESH_INTERVAL_MS);
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

    // Calculate and add dueDate to each task
    tasks = tasks.map(task => {
        const taskStartDate = new Date(PROJECT_START_DATE);
        taskStartDate.setDate(taskStartDate.getDate() + (task.startWeek - 1) * 7);

        const calculatedDueDate = new Date(taskStartDate);
        calculatedDueDate.setDate(calculatedDueDate.getDate() + task.duration * 7 - 1);

        return { ...task, dueDate: calculatedDueDate };
    });
    
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

// Helper function to format Date object to YYYY/MM/DD string
function formatDateToYYYYMMDD(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// Helper function to calculate days remaining until due date
function calculateDaysRemaining(dueDate) {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of today
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);   // Normalize to start of due date
    return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Helper function to get styling class based on days remaining
function getDaysRemainingClass(daysRemaining) {
    if (daysRemaining === null) return '';
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 3) return 'urgent'; // 3 days or less
    if (daysRemaining <= 7) return 'warning'; // 1 week or less
    return 'normal'; // Default if no other condition met
}

function renderKanbanBoard(projectType) {
  // console.log(`Kanbanボード描画中: ${projectType}`); // Removed
  const tasks = getProjectTasks(projectType);
  // console.log(`タスク数: ${tasks.length}`, tasks); // Removed
  
  // ステータスごとに分類
  const todoList = document.getElementById(`${projectType}-todo-list`);
  const inprogressList = document.getElementById(`${projectType}-inprogress-list`);
  const completedList = document.getElementById(`${projectType}-completed-list`);
  
  if (!todoList || !inprogressList || !completedList) {
    throw new Error(`プロジェクト${projectType}に必要な Kanban DOM 要素が見つかりません。'${projectType}-todo-list'、'${projectType}-inprogress-list'、および '${projectType}-completed-list' などの要素が存在することを確認してください。`);
  }
  
  todoList.innerHTML = '';
  inprogressList.innerHTML = '';
  completedList.innerHTML = '';
  
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'kanban-card ' + (task.status === 'completed' ? 'completed' : task.status === 'in-progress' ? 'in-progress' : 'todo');

    const dueDateStr = formatDateToYYYYMMDD(task.dueDate);
    const daysRemaining = calculateDaysRemaining(task.dueDate);
    let daysRemainingText = "";
    let daysRemainingClass = getDaysRemainingClass(daysRemaining);

    if (daysRemaining !== null) {
        if (daysRemaining >= 0) {
            daysRemainingText = ` (残り${daysRemaining}日)`;
        } else {
            daysRemainingText = ` (${Math.abs(daysRemaining)}日超過)`;
        }
    }

    let statusDisplayHTML = '';
    if ((task.status === 'waiting' || task.status === 'blocked') && task.dependency) {
        statusDisplayHTML = `<div class="task-dependency">⚠️ 前工程: ${task.dependency}</div>`;
    } else {
        statusDisplayHTML = `<span class="task-status-badge">${getStatusBadgeText(task.status)}</span>`;
    }

    card.innerHTML = `
      <div class="task-title">${task.name}</div>
      <div class="task-meta">
        <span>期限: ${dueDateStr}</span>
        <span class="days-remaining" data-due-date="${task.dueDate ? task.dueDate.toISOString() : ''}">${daysRemainingText}</span>
      </div>
      ${statusDisplayHTML}
    `;
    // Set initial class for days-remaining span
    const daysRemainingSpan = card.querySelector('.days-remaining');
    if (daysRemainingSpan) {
        daysRemainingSpan.className = `days-remaining ${daysRemainingClass}`;
    }

    if (task.status === 'completed') {
      completedList.appendChild(card);
    } else if (task.status === 'in-progress') {
      inprogressList.appendChild(card);
    } else {
      todoList.appendChild(card);
    }
  });
  
  // console.log(`${projectType} Kanbanボード描画完了`); // Removed
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
  // console.log('Kanbanボードを初期化中...'); // Removed
  try {
    renderKanbanBoard('boxing');
    renderKanbanBoard('architecture');
  } catch (error) {
    console.error("Error initializing Kanban board(s):", error); // This one STAYS
  }
  // console.log('Kanbanボードの初期化完了'); // Removed
}

// Function to update all "days remaining" displays
function updateAllDaysRemainingDisplays() {
    const daySpans = document.querySelectorAll('.days-remaining');
    daySpans.forEach(span => {
        const dueDateISO = span.getAttribute('data-due-date');
        if (dueDateISO) {
            const dueDate = new Date(dueDateISO);
            const daysRemaining = calculateDaysRemaining(dueDate);
            let newText = "";

            if (daysRemaining !== null) {
                if (daysRemaining >= 0) {
                    newText = ` (残り${daysRemaining}日)`;
                } else {
                    newText = ` (${Math.abs(daysRemaining)}日超過)`;
                }
            }
            span.textContent = newText;

            // Update styling class
            const newClass = getDaysRemainingClass(daysRemaining);
            // Ensure to keep the base class 'days-remaining' and only change the dynamic part
            span.className = `days-remaining ${newClass}`;
        }
    });
    // console.log('Days remaining displays updated.'); // Removed
}

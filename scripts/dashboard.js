// =================
// 認証チェック機能
// =================

// ページ読み込み時の認証チェック
(function() {
    // テスト用: 認証状態を設定
    sessionStorage.setItem('lexia_authenticated', 'true');
    sessionStorage.setItem('auth_timestamp', new Date().getTime().toString());
    
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
        
        // テスト環境ではリダイレクトしない
        console.log('テスト環境: ログインページリダイレクトをスキップ');
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
    updateProgressCircles();
    initializeTooltips();
    initializeProgressDashboards();
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

// 日付をフォーマットする関数
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 短い日付フォーマット関数（M/D形式）
function formatDateShort(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// 週の開始日を取得する関数
function getWeekStartDate(weekNumber) {
    const startDate = new Date(PROJECT_START_DATE);
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    return startDate;
}

// Progress Dashboardの初期化
function initializeProgressDashboards() {
    generateProgressDashboard('boxing');
    generateProgressDashboard('architecture');
    
    // リサイズ時の再生成を制御（デバウンス処理）
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentWidth = window.innerWidth;
            // 画面幅が768pxを境界にクロスした場合のみ再生成
            if ((lastWidth <= 768 && currentWidth > 768) || 
                (lastWidth > 768 && currentWidth <= 768)) {
                generateProgressDashboard('boxing');
                generateProgressDashboard('architecture');
                lastWidth = currentWidth;
            }
        }, 250); // 250ms のデバウンス
    });
    
    // スクロール中のアニメーション防止（強化版）
    let scrollTimeout;
    let isScrolling = false;
    
    // パッシブリスナーでスクロールを検出
    document.addEventListener('scroll', () => {
        if (!isScrolling) {
            console.log('スクロール開始: アニメーション一時停止');
        }
        isScrolling = true;
        document.body.classList.add('scrolling');
        clearTimeout(scrollTimeout);
        
        // スクロール終了後1秒後にフラグをリセット
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            document.body.classList.remove('scrolling');
            console.log('スクロール終了: アニメーション再開可能');
        }, 1000);
    }, { passive: true });
    
    // タッチスクロール対応（モバイル）
    document.addEventListener('touchmove', () => {
        if (!isScrolling) {
            console.log('タッチスクロール開始: アニメーション一時停止');
        }
        isScrolling = true;
        document.body.classList.add('scrolling');
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            document.body.classList.remove('scrolling');
            console.log('タッチスクロール終了: アニメーション再開可能');
        }, 1000);
    }, { passive: true });
    
    // スクロール状態をグローバルで参照可能にする
    window.isScrolling = () => isScrolling;
    
    console.log(`Progress Dashboardが初期化されました。プロジェクト開始日: ${formatDate(PROJECT_START_DATE)}`);
}

// Progress Dashboardを生成
function generateProgressDashboard(projectType) {
    const container = document.getElementById(`${projectType}ProgressDashboard`);
    if (!container) return;

    const tasks = getProjectTasks(projectType);
    
    // Progress Dashboard HTMLを生成
    const dashboardHTML = createProgressDashboardHTML(tasks, projectType);
    
    // Progress Dashboardを設定
    container.innerHTML = '';
    container.insertAdjacentHTML('beforeend', dashboardHTML);
    
    // プログレス円とバーのアニメーション開始
    setTimeout(() => {
        animateProgressElements(projectType);
    }, 100);
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

// Progress Dashboard HTMLを作成
function createProgressDashboardHTML(tasks, projectType) {
    // 総合進捗を計算
    const totalProgress = calculateOverallProgress(tasks);
    
    let html = '';
    
    // 各タスクのプログレスカードを生成
    tasks.forEach((task, index) => {
        const progress = getTaskProgress(task);
        const statusBadge = getStatusBadge(task.status);
        const progressBarClass = getProgressBarClass(task.status);
        
        html += `
            <div class="progress-card" data-status="${task.status}" style="animation-delay: ${index * 0.1}s;">
                <div class="progress-card-header">
                    <h4>${task.name}</h4>
                    ${statusBadge}
                </div>
                
                <div class="progress-info">
                    <div class="progress-details">
                        <div class="detail-item">
                            <span class="detail-label">期間:</span>
                            <span class="detail-value">${task.duration}週間</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">開始週:</span>
                            <span class="detail-value">${task.startWeek}週目</span>
                        </div>
                        ${task.dependency ? `
                        <div class="detail-item">
                            <span class="detail-label">依存:</span>
                            <span class="detail-value">${task.dependency}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="progress-visual">
                        <div class="progress-circle-small">
                            <svg viewBox="0 0 36 36" class="circular-chart">
                                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                <path class="circle progress-circle-${task.status}" 
                                      stroke-dasharray="${progress}, 100" 
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            </svg>
                            <span class="progress-text-small">${progress}%</span>
                        </div>
                        
                        <div class="progress-bar-container">
                            <div class="progress-bar ${progressBarClass}">
                                <div class="progress-fill" style="width: 0%" data-target="${progress}%"></div>
                                <div class="progress-shimmer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    return html;
}

// タスクの進捗率を計算
function getTaskProgress(task) {
    switch(task.status) {
        case 'completed': return 100;
        case 'in-progress': return 60;
        case 'ready': return 10;
        case 'waiting': return 5;
        case 'blocked': return 0;
        case 'milestone': return 100;
        default: return 0;
    }
}

// 総合進捗を計算
function calculateOverallProgress(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    
    const totalProgress = tasks.reduce((sum, task) => {
        return sum + getTaskProgress(task);
    }, 0);
    
    return Math.round(totalProgress / tasks.length);
}

// ステータスバッジを取得
function getStatusBadge(status) {
    const statusConfig = {
        'completed': { text: '完了', class: 'completed', icon: 'fa-check-circle' },
        'in-progress': { text: '進行中', class: 'in-progress', icon: 'fa-clock' },
        'ready': { text: '開始可能', class: 'ready', icon: 'fa-play-circle' },
        'waiting': { text: '待機中', class: 'pending', icon: 'fa-pause-circle' },
        'blocked': { text: 'ブロック中', class: 'pending', icon: 'fa-ban' },
        'milestone': { text: 'マイルストーン', class: 'completed', icon: 'fa-flag' }
    };
    
    const config = statusConfig[status] || { text: '未定', class: 'pending', icon: 'fa-question-circle' };
    
    return `
        <div class="status-badge ${config.class}">
            <i class="fas ${config.icon}"></i>
            <span>${config.text}</span>
        </div>
    `;
}

// プログレスバーのクラスを取得
function getProgressBarClass(status) {
    switch(status) {
        case 'completed': return 'completed';
        case 'in-progress': return 'in-progress';
        case 'ready': return 'ready';
        case 'waiting': return 'pending';
        case 'blocked': return 'pending';
        case 'milestone': return 'completed';
        default: return 'pending';
    }
}

// Progress Dashboardのアニメーション
function animateProgressElements(projectType) {
    const container = document.getElementById(`${projectType}ProgressDashboard`);
    if (!container) return;
    
    // スクロール中は完全にアニメーションをスキップ
    if (typeof window.isScrolling === 'function' && window.isScrolling()) {
        console.log('スクロール中のため、プログレスアニメーションをスキップします');
        const cards = container.querySelectorAll('.progress-card');
        const progressFills = container.querySelectorAll('.progress-fill');
        const circles = container.querySelectorAll('.circle');
        
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
        
        progressFills.forEach(fill => {
            const target = fill.getAttribute('data-target');
            fill.style.width = target;
        });
        
        circles.forEach(circle => {
            const dashArray = circle.getAttribute('stroke-dasharray');
            if (dashArray) {
                circle.style.strokeDasharray = dashArray;
            }
        });
        
        return;
    }
    
    // プログレスカードのフェードインアニメーション
    const cards = container.querySelectorAll('.progress-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // プログレスバーのアニメーション
    const progressFills = container.querySelectorAll('.progress-fill');
    progressFills.forEach((fill, index) => {
        setTimeout(() => {
            const target = fill.getAttribute('data-target');
            fill.style.width = target;
        }, (index * 150) + 300);
    });
    
    // 円形プログレスのアニメーション
    const circles = container.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
        setTimeout(() => {
            const dashArray = circle.getAttribute('stroke-dasharray');
            if (dashArray) {
                circle.style.strokeDasharray = dashArray;
            }
        }, (index * 150) + 500);
    });
    
    console.log(`[${projectType}] Progress Dashboard アニメーション開始: ${cards.length}個のカード`);
}

// 総合進捗円の更新
function updateOverallProgress(projectType) {
    const tasks = getProjectTasks(projectType);
    const overallProgress = calculateOverallProgress(tasks);
    
    // 総合進捗円を更新
    const overallCircle = document.querySelector(`#${projectType}-project .overall-progress-circle .circle`);
    const overallText = document.querySelector(`#${projectType}-project .overall-progress-circle .progress-text`);
    
    if (overallCircle && overallText) {
        overallCircle.style.strokeDasharray = `${overallProgress}, 100`;
        overallText.textContent = `${overallProgress}%`;
    }
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

// プログレスサークルの更新
function updateProgressCircles() {
    // Progress Dashboard の総合進捗を更新
    updateOverallProgress('boxing');
    updateOverallProgress('architecture');
    
    // 既存のカード内プログレス円（もし存在する場合）
    const boxingProgress = document.querySelector('#boxing-project .progress-circle');
    const architectureProgress = document.querySelector('#architecture-project .progress-circle');
    
    if (boxingProgress) {
        const boxingTasks = getProjectTasks('boxing');
        const boxingOverallProgress = calculateOverallProgress(boxingTasks);
        updateProgressCircle(boxingProgress, boxingOverallProgress);
    }
    
    if (architectureProgress) {
        const architectureTasks = getProjectTasks('architecture');
        const architectureOverallProgress = calculateOverallProgress(architectureTasks);
        updateProgressCircle(architectureProgress, architectureOverallProgress);
    }
}

// 個別プログレスサークルの更新
function updateProgressCircle(circle, percentage) {
    const deg = (percentage / 100) * 360;
    circle.style.background = `conic-gradient(#4caf50 0deg ${deg}deg, #e1e5e9 ${deg}deg 360deg)`;
}

// =================
// ツールチップ機能
// =================

// ツールチップの初期化
function initializeTooltips() {
    // Progress Dashboardのツールチップは CSS で実装済み
    console.log('ツールチップ機能を初期化しました');
}

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
  try {
    renderKanbanBoard('boxing');
    renderKanbanBoard('architecture');
    console.log('Kanbanボードの初期化完了');
  } catch (error) {
    console.error('Kanbanボード初期化エラー:', error);
  }
}

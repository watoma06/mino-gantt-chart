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
    updateProgressCircles();
    initializeTooltips();
    initializeGanttCharts();
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
// ガントチャート機能
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

// 現在日付インジケーターを更新する関数
function updateCurrentDateIndicator() {
    const today = new Date();
    const currentWeek = getCurrentWeek();
    
    // 両方のプロジェクトの現在日付インジケーターを更新
    ['boxing', 'architecture'].forEach(projectType => {
        const indicator = document.getElementById(`current-date-${projectType}`);
        const ganttContainer = document.getElementById(`${projectType}GanttChart`);
        
        if (indicator && ganttContainer) {
            // 現在の週が表示範囲内の場合のみ表示
            if (currentWeek >= 1 && currentWeek <= 12) {
                // ガントチャートのタイムライン要素を取得
                const timeline = ganttContainer.querySelector('.gantt-timeline');
                const datesHeader = ganttContainer.querySelector('.gantt-dates-header');
                
                if (timeline && datesHeader) {
                    // 各週のセルサイズを実際のDOM要素から計算
                    const dateCells = datesHeader.querySelectorAll('.gantt-date-cell');
                    if (dateCells.length > 0) {
                        const timelineRect = timeline.getBoundingClientRect();
                        const firstCellRect = dateCells[0].getBoundingClientRect();
                        const cellWidth = firstCellRect.width;
                        
                        // タスク名列の幅を実際のDOM要素から取得
                        const taskHeader = ganttContainer.querySelector('.gantt-tasks-header');
                        const taskColumnWidth = taskHeader ? taskHeader.getBoundingClientRect().width : 200;
                        
                        // 現在の週内での日の位置を計算（0-6の範囲）
                        const dayOfWeek = getCurrentDayOfWeek();
                        
                        // ガントチャートコンテナの左端からの距離を考慮
                        const containerRect = ganttContainer.getBoundingClientRect();
                        const timelineOffsetLeft = timeline.getBoundingClientRect().left - containerRect.left;
                        
                        // 現在の週の開始位置を計算（タイムラインの左端からの相対位置）
                        const weekStartOffset = (currentWeek - 1) * cellWidth;
                        
                        // 週内での日の位置を計算
                        const dayOffset = (dayOfWeek / 7) * cellWidth;
                        
                        // 最終的な位置（タスク名列の幅を加算）
                        const finalPosition = taskColumnWidth + weekStartOffset + dayOffset;
                        
                        // タイムライン全体の幅に対する相対位置で計算
                        const timelineWidth = timelineRect.width;
                        const relativePosition = (finalPosition / timelineWidth) * 100;
                        
                        indicator.style.left = `${finalPosition}px`;
                        indicator.style.display = 'block';
                        
                        // 現在の日付をラベルに表示
                        const label = indicator.querySelector('.current-date-label');
                        if (label) {
                            label.textContent = `今日 (${formatDateShort(today)})`;
                        }
                        
                        console.log(`[${projectType}] 今日の位置更新:`, {
                            週: currentWeek,
                            日: dayOfWeek,
                            タスク列幅: taskColumnWidth,
                            セル幅: cellWidth,
                            週開始オフセット: weekStartOffset,
                            日オフセット: dayOffset,
                            最終位置: `${finalPosition.toFixed(2)}px`,
                            相対位置: `${relativePosition.toFixed(2)}%`,
                            タイムライン幅: timelineWidth,
                            コンテナ左端: containerRect.left,
                            タイムライン左端: timeline.getBoundingClientRect().left,
                            タイムラインオフセット: timelineOffsetLeft
                        });
                    }
                }
            } else {
                indicator.style.display = 'none';
            }
        }
    });
}

// 現在の週の何日目かを取得する関数
function getCurrentDayOfWeek() {
    const today = new Date();
    const currentWeekStart = getWeekStartDate(getCurrentWeek());
    const diffTime = today.getTime() - currentWeekStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(6, diffDays)); // 0-6の範囲内
}

// ガントチャートの初期化
function initializeGanttCharts() {
    generateGanttChart('boxing');
    generateGanttChart('architecture');
    
    // 初期表示時に現在日付インジケーターを設定
    // DOM要素が完全に描画された後に実行するため遅延を追加
    setTimeout(() => {
        updateCurrentDateIndicator();
    }, 1000);
    
    // リアルタイム更新のため、1分ごとに現在日付を更新
    setInterval(() => {
        updateCurrentDateIndicator();
    }, 60000); // 1分ごと
    
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
                generateGanttChart('boxing');
                generateGanttChart('architecture');
                lastWidth = currentWidth;
            }
            
            // 位置調整は常に実行
            updateCurrentDateIndicator();
        }, 250); // 250ms のデバウンス
    });
    
    // スクロール中のアニメーション防止
    let scrollTimeout;
    let isScrolling = false;
    
    document.addEventListener('scroll', () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        
        // スクロール終了後0.5秒後にフラグをリセット
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 500);
    }, { passive: true });
    
    // スクロール状態をグローバルで参照可能にする
    window.isScrolling = () => isScrolling;
    
    console.log(`ガントチャートが初期化されました。プロジェクト開始日: ${formatDate(PROJECT_START_DATE)}`);
}

// ガントチャートを生成
function generateGanttChart(projectType) {
    const container = document.getElementById(`${projectType}GanttChart`);
    if (!container) return;

    const tasks = getProjectTasks(projectType);
    
    // 既存のアニメーション状態をチェック
    const existingBars = container.querySelectorAll('.gantt-bar');
    const hasAnimatedBars = existingBars.length > 0 && 
                           Array.from(existingBars).some(bar => bar.style.opacity === '1');
    
    // 凡例を追加
    const legend = createStatusLegend();
    
    const ganttHTML = createGanttHTML(tasks, projectType);
    
    // 凡例とガントチャートを組み合わせ
    container.innerHTML = '';
    container.appendChild(legend);
    container.insertAdjacentHTML('beforeend', ganttHTML);
    
    // 初回表示または明示的なアニメーション要求時のみアニメーション実行
    if (!hasAnimatedBars) {
        setTimeout(() => {
            animateGanttBars(projectType);
        }, 100);
    } else {
        // 既に表示済みの場合は即座に可視状態にする
        const bars = container.querySelectorAll('.gantt-bar');
        bars.forEach(bar => {
            bar.style.opacity = '1';
            bar.style.transform = 'scale(1)';
        });
    }
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

// ガントチャートHTMLを作成
function createGanttHTML(tasks, projectType) {
    const currentWeek = getCurrentWeek();
    
    // 実際の日付を生成（12週間分）
    const weeks = [];
    for (let i = 1; i <= 12; i++) {
        const weekStartDate = getWeekStartDate(i);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        
        weeks.push({
            number: i,
            displayText: `${i}週`,
            dateRange: `${formatDateShort(weekStartDate)}-${formatDateShort(weekEndDate)}`,
            startDate: weekStartDate
        });
    }
    
    let html = `
        <div class="gantt-timeline">
            <div class="gantt-header">
                <div class="gantt-tasks-header">タスク</div>
                <div class="gantt-dates-header">
                    ${weeks.map(week => `
                        <div class="gantt-date-cell" title="${week.dateRange}">
                            <div class="week-number">${week.displayText}</div>
                            <div class="week-dates">${week.dateRange}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
    `;
    
    tasks.forEach((task, index) => {
        html += `
            <div class="gantt-row">
                <div class="gantt-task-name">${task.name}</div>
                <div class="gantt-task-timeline" id="gantt-timeline-${projectType}-${index}">
                    ${weeks.map((week, weekIndex) => {
                        const weekNum = week.number;
                        const isTaskWeek = weekNum >= task.startWeek && weekNum < task.startWeek + task.duration;
                        
                        if (isTaskWeek) {
                            const barClass = task.status === 'milestone' ? 'milestone' : task.status;
                            const progress = task.status === 'in-progress' ? '60%' : '100%';
                            const statusColor = getStatusColor(task.status);
                            const statusIcon = getStatusIcon(task.status);
                            
                            return `
                                <div class="gantt-cell">
                                    <div class="gantt-bar ${barClass}" 
                                         data-task="${task.name}" 
                                         style="animation-delay: ${index * 0.1}s; background-color: ${statusColor};">
                                        ${statusIcon} ${task.name.substring(0, 6)}
                                        <div class="gantt-task-details">
                                            ${task.name}<br>
                                            状況: ${getStatusText(task.status)}<br>
                                            期間: ${task.duration}週間<br>
                                            日程: ${week.dateRange}<br>
                                            ${task.dependency ? `依存: ${task.dependency}` : ''}
                                        </div>
                                        ${task.status === 'in-progress' ? `<div class="gantt-progress-indicator" style="width: ${progress};"></div>` : ''}
                                    </div>
                                </div>
                            `;
                        } else {
                            return '<div class="gantt-cell"></div>';
                        }
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    // 現在日付インジケーターを追加（タイムライン内に配置）
    html += `
        <div class="gantt-current-date-line" id="current-date-${projectType}">
            <div class="current-date-marker">
                <span class="current-date-label">今日</span>
            </div>
        </div>
    `;
    
    html += '</div>';
    return html;
}

// ステータステキストを取得
function getStatusText(status) {
    switch(status) {
        case 'completed': return '✅ 完了';
        case 'in-progress': return '🔄 進行中';
        case 'ready': return '📋 開始可能';
        case 'waiting': return '⏳ 待機中';
        case 'blocked': return '🚫 ブロック中';
        case 'milestone': return '🎯 マイルストーン';
        default: return '❓ 未定';
    }
}

// ステータスの色を取得
function getStatusColor(status) {
    switch(status) {
        case 'completed': return '#28a745'; // 緑色 - 完了
        case 'in-progress': return '#ffc107'; // 黄色 - 進行中
        case 'ready': return '#17a2b8'; // 青色 - 開始可能
        case 'waiting': return '#fd7e14'; // オレンジ色 - 待機中
        case 'blocked': return '#6c757d'; // グレー色 - ブロック中
        case 'milestone': return '#dc3545'; // 赤色 - マイルストーン
        default: return '#e9ecef'; // 薄いグレー - 未定
    }
}

// ステータスアイコンを取得
function getStatusIcon(status) {
    switch(status) {
        case 'completed': return '✅';
        case 'in-progress': return '🔄';
        case 'ready': return '📋';
        case 'waiting': return '⏳';
        case 'blocked': return '🚫';
        case 'milestone': return '🎯';
        default: return '❓';
    }
}

// ガントチャートバーのアニメーション
function animateGanttBars(projectType) {
    const container = document.getElementById(`${projectType}GanttChart`);
    if (!container) return;
    
    // スクロール中はアニメーションをスキップ
    if (typeof window.isScrolling === 'function' && window.isScrolling()) {
        console.log('スクロール中のため、アニメーションをスキップします');
        const bars = container.querySelectorAll('.gantt-bar');
        bars.forEach(bar => {
            bar.style.opacity = '1';
            bar.style.transform = 'scale(1)';
            bar.classList.add('animated');
        });
        return;
    }
    
    const bars = container.querySelectorAll('.gantt-bar');
    bars.forEach((bar, index) => {
        // 既にアニメーション済みの場合はスキップ
        if (bar.classList.contains('animated')) {
            return;
        }
        
        setTimeout(() => {
            // アニメーション実行前に再度スクロール状態をチェック
            if (typeof window.isScrolling === 'function' && window.isScrolling()) {
                bar.style.opacity = '1';
                bar.style.transform = 'scale(1)';
                bar.classList.add('animated');
                return;
            }
            
            bar.style.opacity = '1';
            bar.style.transform = 'scale(1)';
            bar.classList.add('animated'); // アニメーション済みマーク
        }, index * 100);
    });
}

// ステータス凡例を生成する関数
function createStatusLegend() {
    const legend = document.createElement('div');
    legend.className = 'gantt-status-legend';
    
    const statusTypes = [
        { key: 'completed', label: '完了', color: '#28a745' },
        { key: 'in-progress', label: '進行中', color: '#ffc107' },
        { key: 'ready', label: '開始準備完了', color: '#17a2b8' },
        { key: 'waiting', label: '待機中', color: '#fd7e14' },
        { key: 'blocked', label: 'ブロック中', color: '#6c757d' },
        { key: 'milestone', label: 'マイルストーン', color: '#dc3545' }
    ];
    
    statusTypes.forEach(status => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = `legend-color ${status.key}`;
        
        const label = document.createElement('span');
        label.textContent = status.label;
        
        item.appendChild(colorBox);
        item.appendChild(label);
        legend.appendChild(item);
    });
    
    return legend;
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
    const boxingProgress = document.querySelector('#boxing-project .progress-circle');
    const architectureProgress = document.querySelector('#architecture-project .progress-circle');
    
    if (boxingProgress) {
        updateProgressCircle(boxingProgress, 10);
    }
    
    if (architectureProgress) {
        updateProgressCircle(architectureProgress, 20);
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
    // ガントチャートのツールチップは CSS で実装済み
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

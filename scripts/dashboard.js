// ダッシュボードの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    updateProgressCircles();
    initializeTooltips();
    initializeGanttCharts();
});

// ガントチャートの初期化
function initializeGanttCharts() {
    generateGanttChart('boxing');
    generateGanttChart('architecture');
}

// ガントチャート生成
function generateGanttChart(projectType) {
    const container = document.getElementById(`${projectType}GanttChart`);
    const tasks = getProjectTasks(projectType);
    
    const ganttHTML = createGanttHTML(tasks, projectType);
    container.innerHTML = ganttHTML;
    
    // アニメーションを適用
    setTimeout(() => {
        animateGanttBars(container);
    }, 100);
}

// プロジェクトのタスクデータを取得
function getProjectTasks(projectType) {
    if (projectType === 'boxing') {
        return [
            {
                name: 'ヒヤリングシート受領',
                status: 'pending',
                startWeek: 1,
                duration: 1,
                progress: 0
            },
            {
                name: '要件定義・企画',
                status: 'pending',
                startWeek: 2,
                duration: 1,
                progress: 0
            },
            {
                name: 'デザイン制作',
                status: 'pending',
                startWeek: 3,
                duration: 2,
                progress: 0
            },
            {
                name: 'コーディング',
                status: 'pending',
                startWeek: 5,
                duration: 2,
                progress: 0
            },
            {
                name: 'コンテンツ作成',
                status: 'pending',
                startWeek: 6,
                duration: 2,
                progress: 0
            },
            {
                name: 'テスト・調整',
                status: 'pending',
                startWeek: 8,
                duration: 1,
                progress: 0
            },
            {
                name: '本番公開',
                status: 'pending',
                startWeek: 9,
                duration: 1,
                progress: 0,
                type: 'milestone'
            },
            {
                name: '運用サポート開始',
                status: 'pending',
                startWeek: 10,
                duration: 2,
                progress: 0
            }
        ];
    } else {
        return [
            {
                name: 'ヒヤリングシート受領',
                status: 'completed',
                startWeek: 1,
                duration: 1,
                progress: 100
            },
            {
                name: '要件定義・企画',
                status: 'in-progress',
                startWeek: 2,
                duration: 1,
                progress: 70
            },
            {
                name: 'デザイン制作',
                status: 'pending',
                startWeek: 3,
                duration: 2,
                progress: 0
            },
            {
                name: 'コーディング',
                status: 'pending',
                startWeek: 5,
                duration: 2,
                progress: 0
            },
            {
                name: 'コンテンツ作成',
                status: 'pending',
                startWeek: 6,
                duration: 2,
                progress: 0
            },
            {
                name: 'テスト・調整',
                status: 'pending',
                startWeek: 8,
                duration: 1,
                progress: 0
            },
            {
                name: '本番公開',
                status: 'pending',
                startWeek: 9,
                duration: 1,
                progress: 0,
                type: 'milestone'
            },
            {
                name: '運用サポート開始',
                status: 'pending',
                startWeek: 10,
                duration: 2,
                progress: 0
            }
        ];
    }
}

// ガントチャートのHTML生成
function createGanttHTML(tasks, projectType) {
    const weeks = 12;
    const currentWeek = projectType === 'boxing' ? 1 : 2;
    
    let html = `
        <div class="gantt-timeline">
            <div class="gantt-header">
                <div class="gantt-tasks-header">作業項目</div>
                <div class="gantt-dates-header">
                    ${Array.from({length: weeks}, (_, i) => `
                        <div class="gantt-date-cell">第${i + 1}週</div>
                    `).join('')}
                </div>
            </div>
    `;
    
    tasks.forEach((task, index) => {
        html += `
            <div class="gantt-row">
                <div class="gantt-task-name">${task.name}</div>
                <div class="gantt-task-timeline">
                    ${Array.from({length: weeks}, (_, weekIndex) => {
                        const isTaskWeek = weekIndex >= task.startWeek - 1 && weekIndex < task.startWeek - 1 + task.duration;
                        const isCurrentWeek = weekIndex === currentWeek - 1;
                        
                        if (isTaskWeek) {
                            const barClass = task.type === 'milestone' ? 'milestone' : task.status;
                            return `
                                <div class="gantt-bar ${barClass}" style="grid-column: span ${task.duration};" data-task="${task.name}" data-progress="${task.progress}">
                                    ${task.type === 'milestone' ? '🎯' : Math.round(task.progress) + '%'}
                                    <div class="gantt-task-details">
                                        ${task.name}<br>
                                        進捗: ${task.progress}%<br>
                                        期間: ${task.duration}週間
                                    </div>
                                </div>
                            `;
                        } else if (weekIndex === task.startWeek - 1) {
                            return `<div></div>`;
                        }
                        return weekIndex < task.startWeek - 1 + task.duration ? '' : `<div></div>`;
                    }).join('')}
                    ${currentWeek >= task.startWeek && currentWeek < task.startWeek + task.duration ? 
                        `<div class="gantt-current-date" style="left: ${((currentWeek - task.startWeek) / task.duration) * 100}%;"></div>` : ''}
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    return html;
}

// ガントチャートのアニメーション
function animateGanttBars(container) {
    const bars = container.querySelectorAll('.gantt-bar');
    
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.opacity = '0';
            bar.style.transform = 'scaleX(0)';
            bar.style.transformOrigin = 'left center';
            
            setTimeout(() => {
                bar.style.transition = 'all 0.8s ease-out';
                bar.style.opacity = '1';
                bar.style.transform = 'scaleX(1)';
                
                // 進行中のタスクに進捗インジケーターを追加
                if (bar.classList.contains('in-progress')) {
                    const progress = parseInt(bar.dataset.progress);
                    setTimeout(() => {
                        const indicator = document.createElement('div');
                        indicator.className = 'gantt-progress-indicator';
                        indicator.style.width = progress + '%';
                        bar.appendChild(indicator);
                    }, 400);
                }
            }, index * 100);
        }, index * 150);
    });
}

// タブ切り替え機能
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const projectContents = document.querySelectorAll('.project-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectType = this.getAttribute('data-project');
            
            // アクティブなタブを切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // コンテンツを切り替え
            projectContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(`${projectType}-project`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // 進捗サークルを更新
            setTimeout(() => {
                updateProgressCircles();
            }, 100);
        });
    });
}

// 進捗サークルの更新
function updateProgressCircles() {
    const progressCircles = document.querySelectorAll('.progress-circle');
    
    progressCircles.forEach(circle => {
        const progressText = circle.querySelector('.progress-text');
        const percentage = parseInt(progressText.textContent);
        
        // 進捗に応じて色を変更
        let color = '#4caf50'; // 緑
        if (percentage < 30) {
            color = '#f44336'; // 赤
        } else if (percentage < 70) {
            color = '#ff9800'; // オレンジ
        }
        
        // CSS変数で色を動的に設定
        const degrees = (percentage / 100) * 360;
        circle.style.background = `conic-gradient(${color} 0deg ${degrees}deg, #e1e5e9 ${degrees}deg 360deg)`;
        
        // 進捗テキストの色も更新
        progressText.style.color = color;
    });
}

// ツールチップ機能（将来的な拡張用）
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = event.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// 通知機能（将来的な拡張用）
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒後に自動で削除
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// データ更新機能（将来的にAPIと連携）
function updateProjectData(projectType, data) {
    const projectContent = document.getElementById(`${projectType}-project`);
    if (!projectContent) return;
    
    // 進捗率の更新
    const progressText = projectContent.querySelector('.progress-text');
    if (progressText && data.progress) {
        progressText.textContent = `${data.progress}%`;
    }
    
    // 次のアクションの更新
    const actionItem = projectContent.querySelector('.action-item');
    if (actionItem && data.nextAction) {
        actionItem.querySelector('span').textContent = data.nextAction.title;
        actionItem.querySelector('small').textContent = `期限: ${data.nextAction.deadline}`;
        
        // 緊急度に応じてクラスを追加
        if (data.nextAction.urgent) {
            actionItem.classList.add('urgent');
        } else {
            actionItem.classList.remove('urgent');
        }
    }
    
    // マイルストーンの更新
    const milestoneItem = projectContent.querySelector('.milestone-item');
    if (milestoneItem && data.milestone) {
        milestoneItem.querySelector('span').textContent = data.milestone.title;
        milestoneItem.querySelector('small').textContent = `予定: ${data.milestone.date}`;
    }
    
    // 進捗サークルを再描画
    updateProgressCircles();
}

// 使用例（デモデータ）
const demoData = {
    boxing: {
        progress: 65,
        nextAction: {
            title: '会員管理画面デザイン確認',
            deadline: '6月5日',
            urgent: true
        },
        milestone: {
            title: 'β版リリース',
            date: '6月15日'
        }
    },
    architecture: {
        progress: 45,
        nextAction: {
            title: '施工事例写真の提供',
            deadline: '6月7日',
            urgent: false
        },
        milestone: {
            title: 'デザイン最終確認',
            date: '6月20日'
        }
    }
};

// ヒヤリングシート関連機能
function toggleHearingSheet(projectType) {
    const hearingSheet = document.getElementById(`${projectType}-hearing-sheet`);
    const toggleBtn = hearingSheet.previousElementSibling.querySelector('.toggle-btn i');
    
    if (hearingSheet.style.display === 'none' || !hearingSheet.style.display) {
        hearingSheet.style.display = 'block';
        toggleBtn.style.transform = 'rotate(180deg)';
    } else {
        hearingSheet.style.display = 'none';
        toggleBtn.style.transform = 'rotate(0deg)';
    }
}

// ヒヤリングシート入力フォーム（外部リンク）
function openHearingForm(projectType) {
    // 外部サイトを開く
    window.open('https://lexia-hp.com/new', '_blank');
}

// ローカルストレージにヒヤリングシート保存
function saveHearingSheetLocally(projectType, data) {
    const key = `hearing_sheet_${projectType}`;
    const hearingData = {
        ...data,
        projectType: projectType,
        submittedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(hearingData));
}

// データエクスポート機能
function exportHearingData(projectType) {
    const key = `hearing_sheet_${projectType}`;
    const data = localStorage.getItem(key);
    
    if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hearing_sheet_${projectType}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('データをエクスポートしました', 'success');
    } else {
        showNotification('エクスポートするデータがありません', 'warning');
    }
}

// 印刷用表示
function printHearingSheet(projectType) {
    const hearingContent = document.getElementById(`${projectType}-hearing-sheet`);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>${projectType} ヒヤリングシート</title>
                <style>
                    body { font-family: 'MS Gothic', monospace; padding: 20px; }
                    .hearing-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
                    .hearing-item { margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    .hearing-item label { font-weight: bold; display: block; margin-bottom: 5px; }
                    .hearing-item span { display: block; padding: 5px; background: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>${projectType} プロジェクト ヒヤリングシート</h1>
                <p>印刷日: ${new Date().toLocaleDateString('ja-JP')}</p>
                ${hearingContent.innerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// プロジェクト比較機能
function showProjectComparison() {
    document.getElementById('comparisonModal').style.display = 'block';
    generateComparisonChart();
}

function generateComparisonChart() {
    const canvas = document.getElementById('comparisonChart');
    const ctx = canvas.getContext('2d');
    
    // 簡単な比較チャートの描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // みのボクシングジム
    ctx.fillStyle = '#667eea';
    ctx.fillRect(50, 50, 100, 30);
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('みのボクシングジム: 10%', 50, 45);
    
    // みの建築
    ctx.fillStyle = '#764ba2';
    ctx.fillRect(50, 100, 150, 30);
    ctx.fillText('みの建築: 20%', 50, 95);
}

// プロジェクト状況更新
function updateProjectStatus(projectType, status) {
    const statusKey = `project_status_${projectType}`;
    const currentStatus = JSON.parse(localStorage.getItem(statusKey) || '{}');
    
    currentStatus[status] = {
        completed: true,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(statusKey, JSON.stringify(currentStatus));
}

// モーダル機能
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 通知システム（ローカル）
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    // 5秒後に自動削除
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

// テンプレート表示機能
function showTemplate(projectType) {
    const templateWindow = window.open('', '_blank');
    templateWindow.document.write(`
        <html>
            <head>
                <title>ヒヤリングシートテンプレート</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    .section { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
                    .required { color: red; }
                </style>
            </head>
            <body>
                <h1>${projectType} ヒヤリングシートテンプレート</h1>
                <div class="section">
                    <h3>基本情報 <span class="required">*必須</span></h3>
                    <p>• 会社名・団体名</p>
                    <p>• 担当者様</p>
                    <p>• メールアドレス</p>
                    <p>• 電話番号</p>
                </div>
                <div class="section">
                    <h3>プロジェクト詳細</h3>
                    <p>• ホームページの目的・ゴール</p>
                    <p>• ターゲット層</p>
                    <p>• 現在の課題</p>
                    <p>• 必要な機能</p>
                </div>
                <div class="section">
                    <h3>デザイン・予算</h3>
                    <p>• デザインイメージ</p>
                    <p>• 参考サイト</p>
                    <p>• 予算感</p>
                </div>
            </body>
        </html>
    `);
}

// キーボードナビゲーション対応
document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        // Tabキーでタブ切り替えができるようにフォーカス管理
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('tab-button')) {
            // 現在フォーカスされているタブの処理
        }
    }
    
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('tab-button')) {
            event.preventDefault();
            focusedElement.click();
        }
    }
});

// オートセーブ機能
function enableAutoSave() {
    setInterval(() => {
        const currentState = {
            activeTab: document.querySelector('.tab-button.active')?.getAttribute('data-project'),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('dashboardState', JSON.stringify(currentState));
    }, 30000); // 30秒ごとに保存
}

// 初期化時に分析機能を準備
document.addEventListener('DOMContentLoaded', function() {
    // ...existing initialization...
    enableAutoSave();
    
    // 保存された状態を復元
    const savedState = localStorage.getItem('dashboardState');
    if (savedState) {
        const state = JSON.parse(savedState);
        const tabButton = document.querySelector(`[data-project="${state.activeTab}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
});

// ============= 新機能: 分析機能 =============

// 進捗予測機能
function showProgressPrediction(projectType) {
    const modal = document.getElementById('progressPredictionModal');
    const projectName = document.getElementById('predictionProjectName');
    const currentProgress = document.getElementById('currentProgressValue');
    
    // プロジェクト名を設定
    projectName.textContent = projectType === 'boxing' ? 'みのボクシングジム' : 'みの建築';
    
    // 現在の進捗を設定
    const progressValue = projectType === 'boxing' ? '10%' : '20%';
    currentProgress.textContent = progressValue;
    
    // 予測データを生成・表示
    generateProgressPrediction(projectType);
    
    modal.style.display = 'block';
}

function generateProgressPrediction(projectType) {
    const canvas = document.getElementById('predictionChart');
    const ctx = canvas.getContext('2d');
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 予測データ（プロジェクトタイプに基づく）
    const predictionData = getPredictionData(projectType);
    
    // チャートを描画
    drawPredictionChart(ctx, predictionData);
    
    // 予測詳細を更新
    updatePredictionDetails(predictionData);
}

function getPredictionData(projectType) {
    if (projectType === 'boxing') {
        return {
            currentProgress: 10,
            predictedCompletionDate: '2024年8月15日',
            remainingWorkTime: '約8週間',
            confidence: '75%',
            milestones: [
                { name: 'ヒヤリング完了', date: '6月15日', progress: 20 },
                { name: '設計完了', date: '7月1日', progress: 40 },
                { name: '開発完了', date: '7月30日', progress: 80 },
                { name: 'テスト・公開', date: '8月15日', progress: 100 }
            ]
        };
    } else {
        return {
            currentProgress: 20,
            predictedCompletionDate: '2024年7月30日',
            remainingWorkTime: '約6週間',
            confidence: '85%',
            milestones: [
                { name: '要件定義完了', date: '6月20日', progress: 35 },
                { name: '設計完了', date: '7月5日', progress: 55 },
                { name: '開発完了', date: '7月25日', progress: 90 },
                { name: 'テスト・公開', date: '7月30日', progress: 100 }
            ]
        };
    }
}

function drawPredictionChart(ctx, data) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;
    
    // 背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // グリッド線
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    // 縦線
    for (let i = 0; i <= 4; i++) {
        const x = padding + (i * (width - 2 * padding) / 4);
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // 横線
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i * (height - 2 * padding) / 4);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // 進捗線を描画
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.milestones.forEach((milestone, index) => {
        const x = padding + (index * (width - 2 * padding) / (data.milestones.length - 1));
        const y = height - padding - (milestone.progress * (height - 2 * padding) / 100);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // マイルストーンポイント
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x - 3, y - 3, 6, 6);
    });
    
    ctx.stroke();
    
    // ラベル
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText('進捗予測チャート', 10, 20);
    ctx.fillText('0%', 10, height - 10);
    ctx.fillText('100%', 10, 30);
}

function updatePredictionDetails(data) {
    document.getElementById('predictedCompletionDate').textContent = data.predictedCompletionDate;
    document.getElementById('remainingWorkTime').textContent = data.remainingWorkTime;
    document.getElementById('predictionConfidence').textContent = data.confidence;
}

// ボトルネック検出機能
function showBottleneckAnalysis(projectType) {
    const modal = document.getElementById('bottleneckModal');
    const projectName = document.getElementById('bottleneckProjectName');
    const analysisDate = document.getElementById('analysisDate');
    
    // プロジェクト名を設定
    projectName.textContent = projectType === 'boxing' ? 'みのボクシングジム' : 'みの建築';
    
    // 分析日時を設定
    analysisDate.textContent = new Date().toLocaleString('ja-JP');
    
    // ボトルネック分析を実行・表示
    generateBottleneckAnalysis(projectType);
    
    modal.style.display = 'block';
}

function generateBottleneckAnalysis(projectType) {
    const bottleneckData = getBottleneckData(projectType);
    
    // ボトルネックリストを表示
    displayBottlenecks(bottleneckData.bottlenecks);
    
    // 改善提案を表示
    displayRecommendations(bottleneckData.recommendations);
}

function getBottleneckData(projectType) {
    if (projectType === 'boxing') {
        return {
            bottlenecks: [
                {
                    title: 'ヒヤリングシート提出遅延',
                    description: 'クライアント側のヒヤリングシート提出が予定より遅れています。',
                    impact: '全体スケジュールに2週間の遅延リスク',
                    severity: 'high'
                },
                {
                    title: 'リソース競合',
                    description: 'みの建築プロジェクトとの同時進行によるリソース競合が発生する可能性があります。',
                    impact: '開発フェーズで作業効率低下の可能性',
                    severity: 'warning'
                }
            ],
            recommendations: [
                {
                    title: 'ヒヤリングシート催促',
                    description: 'クライアントに対して丁寧な催促とサポートを提供し、シート提出を促進する。'
                },
                {
                    title: 'スケジュール調整',
                    description: '両プロジェクトのタイムラインを調整し、リソース競合を最小化する。'
                }
            ]
        };
    } else {
        return {
            bottlenecks: [
                {
                    title: '素材提供待ち',
                    description: 'クライアントからの追加素材（施工事例写真等）の提供が必要です。',
                    impact: 'デザイン作業の進行に影響',
                    severity: 'warning'
                },
                {
                    title: '要件詳細化不足',
                    description: '一部機能要件の詳細が不明確で、設計段階での判断が困難です。',
                    impact: '設計・開発フェーズでの手戻りリスク',
                    severity: 'info'
                }
            ],
            recommendations: [
                {
                    title: '素材収集サポート',
                    description: '素材提供のガイドラインを作成し、クライアントの素材準備をサポートする。'
                },
                {
                    title: '要件詳細化ミーティング',
                    description: '追加のヒヤリングミーティングを設定し、不明確な要件を詳細化する。'
                }
            ]
        };
    }
}

function displayBottlenecks(bottlenecks) {
    const container = document.getElementById('bottleneckList');
    container.innerHTML = '';
    
    bottlenecks.forEach(bottleneck => {
        const item = document.createElement('div');
        item.className = `bottleneck-item ${bottleneck.severity}`;
        item.innerHTML = `
            <div class="bottleneck-title">${bottleneck.title}</div>
            <div class="bottleneck-description">${bottleneck.description}</div>
            <div class="bottleneck-impact">影響: ${bottleneck.impact}</div>
        `;
        container.appendChild(item);
    });
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationsList');
    container.innerHTML = '';
    
    recommendations.forEach(recommendation => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <div class="recommendation-content">
                <div class="recommendation-title">${recommendation.title}</div>
                <div class="recommendation-description">${recommendation.description}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// リアルタイム同期機能（ローカル）
function initializeRealTimeSync() {
    // ローカルストレージの変更を監視
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('shared_memo_') || e.key.startsWith('tasks_')) {
            showNotification('データが更新されました', 'info');
        }
    });
    
    // 定期的なデータ同期（5秒ごと）
    setInterval(() => {
        syncLocalData();
    }, 5000);
}

function syncLocalData() {
    // 実装予定: WebRTCやWebSocketを使ったリアルタイム同期
    // 現在はローカルストレージベース
    const timestamp = new Date().toISOString();
    localStorage.setItem('lastSync', timestamp);
}

// ヒヤリングシート認証機能
function authenticateHearingSheet(projectType) {
    const passwordInput = document.getElementById(`${projectType}-password`);
    const authError = document.getElementById(`${projectType}-auth-error`);
    const authForm = document.getElementById(`${projectType}-auth-form`);
    const hearingContent = document.getElementById(`${projectType}-hearing-sheet`);
    
    const password = passwordInput.value.trim();
    const correctPassword = getProjectPassword(projectType);
    
    if (password === correctPassword) {
        // 認証成功
        authForm.style.display = 'none';
        hearingContent.classList.add('show');
        authError.classList.remove('show');
        
        // ヒヤリングシートのデータを読み込み
        loadHearingSheetData(projectType);
        
        // 成功通知
        showNotification('認証に成功しました', 'success');
    } else {
        // 認証失敗
        authError.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        
        // 入力フィールドを一瞬赤くする
        passwordInput.style.borderColor = '#dc3545';
        setTimeout(() => {
            passwordInput.style.borderColor = '#ced4da';
        }, 1000);
    }
}

// プロジェクトごとのパスワードを取得
function getProjectPassword(projectType) {
    const passwords = {
        'boxing': 'boxing2024',
        'architecture': 'archi2024'
    };
    return passwords[projectType] || '';
}

// ヒヤリングシートデータを読み込み
function loadHearingSheetData(projectType) {
    const hearingContent = document.getElementById(`${projectType}-hearing-sheet`);
    
    if (projectType === 'architecture') {
        // みの建築のヒヤリングシートデータは既にHTMLに含まれているので、
        // ここでは表示を調整するだけ
        return;
    } else if (projectType === 'boxing') {
        // みのボクシングジムのヒヤリングシートデータを動的に生成
        hearingContent.innerHTML = `
            <div class="hearing-grid">
                <div class="hearing-item">
                    <label>担当者様</label>
                    <span>未提出</span>
                </div>
                <div class="hearing-item">
                    <label>会社名</label>
                    <span>みのボクシングジム</span>
                </div>
                <div class="hearing-item">
                    <label>連絡先</label>
                    <span>未提出</span>
                </div>
                <div class="hearing-item">
                    <label>目的・ゴール</label>
                    <span>ヒヤリングシート提出待ち</span>
                </div>
                <div class="hearing-item full-width">
                    <label>ビジョン</label>
                    <span>ヒヤリングシート提出後に詳細が明らかになります</span>
                </div>
                <div class="hearing-item full-width">
                    <label>ターゲット</label>
                    <span>ヒヤリングシート提出後に詳細が明らかになります</span>
                </div>
                <div class="hearing-item full-width">
                    <label>現在の課題</label>
                    <span>ヒヤリングシート提出後に詳細が明らかになります</span>
                </div>
                <div class="hearing-item full-width">
                    <label>必要機能</label>
                    <span>ヒヤリングシート提出後に詳細が明らかになります</span>
                </div>
                <div class="hearing-item">
                    <label>デザインイメージ</label>
                    <span>未定</span>
                </div>
                <div class="hearing-item">
                    <label>参考サイト</label>
                    <span>未定</span>
                </div>
                <div class="hearing-item">
                    <label>予算感</label>
                    <span>要相談</span>
                </div>
                <div class="hearing-item">
                    <label>素材準備状況</label>
                    <span>未確認</span>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn-primary" onclick="exportHearingData('${projectType}')">
                    <i class="fas fa-download"></i>
                    データエクスポート
                </button>
                <button class="btn-secondary" onclick="printHearingSheet('${projectType}')">
                    <i class="fas fa-print"></i>
                    印刷用表示
                </button>
                <button class="btn-info" onclick="showProjectComparison()">
                    <i class="fas fa-chart-bar"></i>
                    プロジェクト比較
                </button>
            </div>
        `;
    }
}

// ヒヤリングシートの表示/非表示切り替え
function toggleHearingSheet(projectType) {
    const authForm = document.getElementById(`${projectType}-auth-form`);
    const hearingContent = document.getElementById(`${projectType}-hearing-sheet`);
    const toggleBtn = document.querySelector(`[onclick="toggleHearingSheet('${projectType}')"] i`);
    
    // 認証済みでない場合は認証フォームの表示/非表示を切り替え
    if (!hearingContent.classList.contains('show')) {
        if (authForm.style.display === 'none' || authForm.style.display === '') {
            authForm.style.display = 'block';
            toggleBtn.className = 'fas fa-chevron-up';
        } else {
            authForm.style.display = 'none';
            toggleBtn.className = 'fas fa-chevron-down';
        }
    } else {
        // 認証済みの場合はコンテンツの表示/非表示を切り替え
        if (hearingContent.style.display === 'none') {
            hearingContent.style.display = 'block';
            toggleBtn.className = 'fas fa-chevron-up';
        } else {
            hearingContent.style.display = 'none';
            toggleBtn.className = 'fas fa-chevron-down';
        }
    }
}

// Enterキーでパスワード認証
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // パスワード入力フィールドでEnterキーを押した時の処理
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const target = e.target;
            if (target.id.includes('-password')) {
                const projectType = target.id.replace('-password', '');
                authenticateHearingSheet(projectType);
            }
        }
    });
});

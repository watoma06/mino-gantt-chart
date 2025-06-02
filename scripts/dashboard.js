// ダッシュボードの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    updateProgressCircles();
    initializeTooltips();
});

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

// モーダル機能
function openProposalModal(projectType) {
    document.getElementById('proposalModal').style.display = 'block';
    // プロジェクト情報を設定
    console.log(`提案書作成 for ${projectType}`);
}

function scheduleMedia(projectType) {
    document.getElementById('scheduleModal').style.display = 'block';
    loadAvailableTimeSlots(projectType);
}

function showProgressPrediction(projectType) {
    document.getElementById('progressModal').style.display = 'block';
    generateProgressChart(projectType);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 時間枠選択機能
function loadAvailableTimeSlots(projectType) {
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            timeSlots.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// AI提案書生成（模擬）
function generateProposal() {
    showNotification('AI提案書の生成を開始しています...', 'info');
    
    setTimeout(() => {
        showNotification('提案書が正常に生成されました！', 'success');
        closeModal('proposalModal');
        
        // 進捗を更新
        updateTaskProgress('architecture', 'proposal', 80);
    }, 3000);
}

// 進捗更新機能
function updateTaskProgress(projectType, taskType, percentage) {
    // リアルタイム進捗更新の実装
    const progressElements = document.querySelectorAll(`#${projectType}-project .progress-text`);
    
    // WebSocket接続でリアルタイム更新（実装時）
    if (typeof io !== 'undefined') {
        const socket = io();
        socket.emit('progressUpdate', {
            project: projectType,
            task: taskType,
            progress: percentage
        });
    }
}

// 通知システム
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

// リマインダー送信機能
function sendReminder(projectType) {
    showNotification('ヒヤリングシートのリマインダーを送信しました', 'success');
    
    // 実際の実装では API 呼び出し
    console.log(`Reminder sent for ${projectType}`);
}

// テンプレート表示機能
function showTemplate(projectType) {
    // 新しいウィンドウでテンプレートを表示
    const templateWindow = window.open('', '_blank');
    templateWindow.document.write(`
        <html>
            <head><title>ヒヤリングシートテンプレート</title></head>
            <body>
                <h1>${projectType} ヒヤリングシートテンプレート</h1>
                <p>テンプレートの内容がここに表示されます...</p>
            </body>
        </html>
    `);
}

// 進捗チャート生成（Chart.js使用想定）
function generateProgressChart(projectType) {
    // Chart.js での実装例
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    
    // 簡単な進捗グラフの描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#667eea';
    ctx.fillRect(20, 20, 200, 30);
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('進捗予測グラフ', 20, 15);
}

// リアルタイム同期機能（WebSocket使用想定）
function initializeRealTimeSync() {
    if (typeof io !== 'undefined') {
        const socket = io();
        
        socket.on('progressUpdate', (data) => {
            updateProgressDisplay(data);
            showNotification(`${data.project} の進捗が更新されました`, 'info');
        });
        
        socket.on('newMessage', (data) => {
            showNotification(data.message, 'info');
        });
    }
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

// 初期化時にオートセーブ機能を開始
document.addEventListener('DOMContentLoaded', function() {
    // ...existing initialization...
    enableAutoSave();
    initializeRealTimeSync();
    
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

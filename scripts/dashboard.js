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

// ヒヤリングシート入力フォーム
function openHearingForm(projectType) {
    document.getElementById('hearingFormModal').style.display = 'block';
    
    // フォーム送信処理
    document.getElementById('hearingSheetForm').onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // ローカルストレージに保存
        saveHearingSheetLocally(projectType, data);
        showNotification('ヒヤリングシートが保存されました', 'success');
        closeModal('hearingFormModal');
        
        // 進捗を更新
        updateProjectStatus(projectType, 'hearing_received');
    };
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

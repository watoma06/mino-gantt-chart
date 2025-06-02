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

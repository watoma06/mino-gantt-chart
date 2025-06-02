// ダッシュボードの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    updateProgressCircles();
    initializeTooltips();
    initializeGanttCharts();
    
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

// =================
// セキュリティ機能
// =================

// プロジェクトパスワード設定
const PROJECT_PASSWORDS = {
    'boxing': 'boxing2024',
    'architecture': 'archi2024'
};

// 暗号化されたクライアントデータ（Base64 + ROT13）
function getEncryptedClientData() {
    return {
        'architecture': {
            // みの建築のクライアント情報（暗号化済み）
            encrypted: 'WENyZlkvdGRHTTNSUWJZTzJZNlhwZStyWE56Y0pmaW85WmVvYWhsSkJEQT09',
            key: 'archi2024'
        },
        'boxing': {
            // みのボクシングジムは未提出状態
            encrypted: 'V0lKdCtZcm9xcGZPdkFubVFMc0pZTStYT3lKbEJEUkZBcGx2dHF2dVMvOD0=',
            key: 'boxing2024'
        }
    };
}

// ROT13復号化
function rot13Decode(str) {
    return str.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
}

// データ復号化（Base64 + ROT13）
function decryptData(encryptedData) {
    try {
        // Base64デコード
        const base64Decoded = atob(encryptedData);
        
        // ROT13デコード
        const rot13Decoded = rot13Decode(base64Decoded);
        
        // JSONパース
        return JSON.parse(rot13Decoded);
    } catch (error) {
        console.error('復号化エラー:', error);
        return null;
    }
}

// 統一されたパスワード認証機能
function authenticateHearingSheet(projectType) {
    const passwordInput = document.getElementById(`${projectType}-password`);
    const errorElement = document.getElementById(`${projectType}-auth-error`);
    const authForm = document.getElementById(`${projectType}-auth-form`);
    const hearingContent = document.getElementById(`${projectType}-hearing-sheet`);
    
    if (!passwordInput || !errorElement || !authForm || !hearingContent) {
        console.error('必要な要素が見つかりません:', projectType);
        return;
    }
    
    const inputPassword = passwordInput.value.trim();
    const correctPassword = PROJECT_PASSWORDS[projectType];
    
    // エラー表示をリセット
    errorElement.style.display = 'none';
    errorElement.classList.remove('show');
    
    if (inputPassword === correctPassword) {
        // 認証成功
        authForm.style.display = 'none';
        hearingContent.classList.add('show');
        hearingContent.style.display = 'block';
        
        // 暗号化されたデータを復号化して表示
        const encryptedData = getEncryptedClientData()[projectType];
        
        if (encryptedData) {
            const clientData = decryptData(encryptedData.encrypted);
            
            if (clientData) {
                loadHearingSheetData(projectType, clientData);
                showNotification('認証に成功しました', 'success');
            } else {
                hearingContent.innerHTML = '<p class="error">データの復号化に失敗しました</p>';
                showNotification('データの復号化に失敗しました', 'error');
            }
        }
        
        // パスワード入力欄をクリア
        passwordInput.value = '';
    } else {
        // 認証失敗
        errorElement.style.display = 'block';
        errorElement.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        
        // エラーメッセージを3秒後に非表示
        setTimeout(() => {
            errorElement.style.display = 'none';
            errorElement.classList.remove('show');
        }, 3000);
        
        // 入力フィールドを一瞬赤くする
        passwordInput.style.borderColor = '#dc3545';
        setTimeout(() => {
            passwordInput.style.borderColor = '#ced4da';
        }, 1000);
    }
}

// ヒヤリングシートデータを復号化して表示
function loadHearingSheetData(projectType, clientData) {
    const hearingContent = document.getElementById(`${projectType}-hearing-sheet`);
    
    if (projectType === 'architecture' && clientData) {
        hearingContent.innerHTML = `
            <div class="hearing-grid">
                <div class="hearing-item">
                    <label>担当者様</label>
                    <span>${clientData.contact || '未設定'}</span>
                </div>
                <div class="hearing-item">
                    <label>会社名</label>
                    <span>${clientData.company || '未設定'}</span>
                </div>
                <div class="hearing-item">
                    <label>連絡先</label>
                    <span>${clientData.email || '未設定'} / ${clientData.phone || '未設定'}</span>
                </div>
                <div class="hearing-item">
                    <label>目的・ゴール</label>
                    <span>${clientData.purpose || '未設定'}</span>
                </div>
                <div class="hearing-item full-width">
                    <label>ビジョン</label>
                    <span>${clientData.vision || '未設定'}</span>
                </div>
                <div class="hearing-item full-width">
                    <label>ターゲット</label>
                    <span>${clientData.target || '未設定'}</span>
                </div>
                <div class="hearing-item full-width">
                    <label>現在の課題</label>
                    <span>${clientData.challenges || '未設定'}</span>
                </div>
                <div class="hearing-item full-width">
                    <label>必要機能</label>
                    <span>${clientData.features || '未設定'}</span>
                </div>
                <div class="hearing-item">
                    <label>デザインイメージ</label>
                    <span>${clientData.design || '未設定'}</span>
                </div>
                <div class="hearing-item">
                    <label>参考サイト</label>
                    <span>${clientData.reference || '未設定'}</span>
                </div>
                <div class="hearing-item">
                    <label>予算感</label>
                    <span>${clientData.budget || '未設定'}</span>
                </div>
                <div class="hearing-item">
                    <label>素材準備状況</label>
                    <span>${clientData.materials || '未設定'}</span>
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
    } else if (projectType === 'boxing') {
        // みのボクシングジムのヒヤリングシートデータ（未提出状態）
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

// 通知表示機能
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(notification);
    
    // 5秒後に自動削除
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Enterキーでパスワード認証
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const target = e.target;
        if (target.id && target.id.includes('-password')) {
            const projectType = target.id.replace('-password', '');
            authenticateHearingSheet(projectType);
        }
    }
});

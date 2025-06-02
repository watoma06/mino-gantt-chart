// データ暗号化ヘルパースクリプト
// Node.jsで実行: node encrypt-data.js

// 元のクライアントデータ
const architectureData = {
    contact: "美濃巧人（みのたくと）",
    company: "みの建築",
    email: "minokenchiku314@gmail.com",
    phone: "080-2630-6355",
    purpose: "集客・見込み顧客獲得、ブランディング・認知度向上",
    vision: "お客様が「ホームページに自分の家乗ってるから見てよ！」と宣伝してくれて、そこでお客様がビビッとくるようなホームページにしたい",
    target: "これから家を建てたい子持ち世代から年配の方まで。家や店舗のリフォームをしたいけどどこに頼んだらいいかわからない方々。",
    challenges: "個人の大工さんならではの技術力、自由な発想の強みをうまく伝えることができていない",
    features: "会社概要、事業・サービス紹介、商品一覧、お客様の声、実績紹介、ブログ・お知らせ、お問い合わせフォーム",
    design: "職人らしさよりもポップで親しみやすい雰囲気",
    reference: "一条工務店、大和ハウス工業",
    budget: "15〜30万円",
    materials: "ロゴや写真素材を一部準備済み"
};

// ROT13暗号化関数
function rot13(str) {
    return str.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
}

// データ暗号化関数
function encryptData(data) {
    // JSONを文字列化
    const jsonString = JSON.stringify(data);
    
    // ROT13で暗号化
    const rot13Encrypted = rot13(jsonString);
    
    // Base64でエンコード
    const base64Encoded = Buffer.from(rot13Encrypted).toString('base64');
    
    return base64Encoded;
}

// 暗号化実行
const encryptedArchitecture = encryptData(architectureData);

console.log('=== 暗号化されたデータ ===');
console.log('Architecture:', encryptedArchitecture);

// 復号化テスト
function decryptData(encryptedData) {
    try {
        // Base64デコード
        const base64Decoded = Buffer.from(encryptedData, 'base64').toString();
        
        // ROT13デコード
        const rot13Decoded = rot13(base64Decoded);
        
        // JSONパース
        return JSON.parse(rot13Decoded);
    } catch (error) {
        console.error('復号化エラー:', error);
        return null;
    }
}

console.log('\n=== 復号化テスト ===');
const decrypted = decryptData(encryptedArchitecture);
console.log('復号化成功:', decrypted);

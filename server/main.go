// このファイルは削除予定です

// ヒヤリングシートのデータ構造
type HearingSheet struct {
	ID                 string    `json:"id"`
	ProjectType        string    `json:"project_type"`
	CompanyName        string    `json:"company_name"`
	ContactPerson      string    `json:"contact_person"`
	Email              string    `json:"email"`
	Phone              string    `json:"phone"`
	Purpose            string    `json:"purpose"`
	Vision             string    `json:"vision"`
	Target             string    `json:"target"`
	CurrentChallenges  string    `json:"current_challenges"`
	RequiredFeatures   []string  `json:"required_features"`
	DesignImage        string    `json:"design_image"`
	ReferenceSites     []string  `json:"reference_sites"`
	Budget             string    `json:"budget"`
	MaterialStatus     string    `json:"material_status"`
	SubmittedAt        time.Time `json:"submitted_at"`
}

// プロジェクト進捗データ
type ProjectProgress struct {
	ID              string             `json:"id"`
	ProjectType     string             `json:"project_type"`
	OverallProgress int                `json:"overall_progress"`
	Tasks           []Task             `json:"tasks"`
	Milestones      []Milestone        `json:"milestones"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

type Task struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Status      string    `json:"status"` // completed, in-progress, pending
	Progress    int       `json:"progress"`
	Assignee    string    `json:"assignee"`
	DueDate     time.Time `json:"due_date"`
	Description string    `json:"description"`
}

type Milestone struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	DueDate     time.Time `json:"due_date"`
	Status      string    `json:"status"`
	Description string    `json:"description"`
}

// AI提案書生成リクエスト
type ProposalRequest struct {
	ProjectType     string   `json:"project_type"`
	HearingSheetID  string   `json:"hearing_sheet_id"`
	IncludeDesign   bool     `json:"include_design"`
	IncludeSpec     bool     `json:"include_spec"`
	IncludeEstimate bool     `json:"include_estimate"`
	IncludeSchedule bool     `json:"include_schedule"`
}

type ProposalResponse struct {
	ID           string    `json:"id"`
	ProjectType  string    `json:"project_type"`
	DesignPlan   string    `json:"design_plan"`
	Specification string   `json:"specification"`
	Estimate     string    `json:"estimate"`
	Schedule     string    `json:"schedule"`
	GeneratedAt  time.Time `json:"generated_at"`
}

// WebSocket アップグレーダー
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 本番環境では適切なオリジンチェックを実装
	},
}

// WebSocket接続管理
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan []byte)

func main() {
	r := mux.NewRouter()

	// API エンドポイント
	r.HandleFunc("/api/hearing-sheets", createHearingSheet).Methods("POST")
	r.HandleFunc("/api/hearing-sheets/{id}", getHearingSheet).Methods("GET")
	r.HandleFunc("/api/projects/{type}/progress", getProjectProgress).Methods("GET")
	r.HandleFunc("/api/projects/{type}/progress", updateProjectProgress).Methods("PUT")
	r.HandleFunc("/api/proposals/generate", generateProposal).Methods("POST")
	r.HandleFunc("/api/schedule/meeting", scheduleMeeting).Methods("POST")
	r.HandleFunc("/api/notifications/send", sendNotification).Methods("POST")

	// WebSocket エンドポイント
	r.HandleFunc("/ws", handleWebSocket)

	// 静的ファイルの配信
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("../"))).Methods("GET")

	// CORS設定
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	// WebSocket ブロードキャスト処理
	go handleMessages()

	fmt.Println("サーバーを起動中: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// ヒヤリングシート作成
func createHearingSheet(w http.ResponseWriter, r *http.Request) {
	var sheet HearingSheet
	if err := json.NewDecoder(r.Body).Decode(&sheet); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sheet.ID = fmt.Sprintf("hs_%d", time.Now().Unix())
	sheet.SubmittedAt = time.Now()

	// データベースに保存（仮実装）
	saveHearingSheet(sheet)

	// リアルタイム通知
	notifyClients("hearing_sheet_received", map[string]interface{}{
		"project_type": sheet.ProjectType,
		"company_name": sheet.CompanyName,
		"submitted_at": sheet.SubmittedAt,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sheet)
}

// ヒヤリングシート取得
func getHearingSheet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// データベースから取得（仮実装）
	sheet := getHearingSheetByID(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sheet)
}

// プロジェクト進捗取得
func getProjectProgress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectType := vars["type"]

	progress := getProgressByProjectType(projectType)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(progress)
}

// プロジェクト進捗更新
func updateProjectProgress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectType := vars["type"]

	var progress ProjectProgress
	if err := json.NewDecoder(r.Body).Decode(&progress); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	progress.ProjectType = projectType
	progress.UpdatedAt = time.Now()

	// データベースに保存
	saveProjectProgress(progress)

	// リアルタイム通知
	notifyClients("progress_updated", map[string]interface{}{
		"project_type": projectType,
		"progress":     progress,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(progress)
}

// AI提案書生成
func generateProposal(w http.ResponseWriter, r *http.Request) {
	var req ProposalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// AI提案書生成の模擬実装
	proposal := generateAIProposal(req)

	// リアルタイム通知
	notifyClients("proposal_generated", map[string]interface{}{
		"project_type": req.ProjectType,
		"proposal_id":  proposal.ID,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(proposal)
}

// 打ち合わせスケジュール
func scheduleMeeting(w http.ResponseWriter, r *http.Request) {
	var scheduleReq map[string]interface{}
	json.NewDecoder(r.Body).Decode(&scheduleReq)

	// カレンダー統合の実装
	result := map[string]interface{}{
		"status":      "scheduled",
		"meeting_id":  fmt.Sprintf("meeting_%d", time.Now().Unix()),
		"datetime":    scheduleReq["datetime"],
		"participants": scheduleReq["participants"],
	}

	// リアルタイム通知
	notifyClients("meeting_scheduled", result)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// 通知送信
func sendNotification(w http.ResponseWriter, r *http.Request) {
	var notificationReq map[string]interface{}
	json.NewDecoder(r.Body).Decode(&notificationReq)

	// メール/SMS送信の実装
	// 実際の実装では外部APIを使用

	result := map[string]interface{}{
		"status":  "sent",
		"sent_at": time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// WebSocket処理
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	clients[conn] = true

	for {
		var msg map[string]interface{}
		err := conn.ReadJSON(&msg)
		if err != nil {
			delete(clients, conn)
			break
		}

		// メッセージをブロードキャスト
		data, _ := json.Marshal(msg)
		broadcast <- data
	}
}

// メッセージブロードキャスト処理
func handleMessages() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}

// クライアントへの通知
func notifyClients(eventType string, data map[string]interface{}) {
	message := map[string]interface{}{
		"type":      eventType,
		"data":      data,
		"timestamp": time.Now(),
	}

	msgData, _ := json.Marshal(message)
	broadcast <- msgData
}

// データ操作関数（仮実装）
func saveHearingSheet(sheet HearingSheet) {
	// 実際の実装ではデータベースに保存
	log.Printf("ヒヤリングシート保存: %s - %s", sheet.ProjectType, sheet.CompanyName)
}

func getHearingSheetByID(id string) HearingSheet {
	// 実際の実装ではデータベースから取得
	return HearingSheet{ID: id}
}

func getProgressByProjectType(projectType string) ProjectProgress {
	// 実際の実装ではデータベースから取得
	return ProjectProgress{ProjectType: projectType}
}

func saveProjectProgress(progress ProjectProgress) {
	// 実際の実装ではデータベースに保存
	log.Printf("進捗保存: %s - %d%%", progress.ProjectType, progress.OverallProgress)
}

func generateAIProposal(req ProposalRequest) ProposalResponse {
	// AI提案書生成の模擬実装
	// 実際の実装ではOpenAI APIやカスタムAIモデルを使用
	return ProposalResponse{
		ID:          fmt.Sprintf("proposal_%d", time.Now().Unix()),
		ProjectType: req.ProjectType,
		DesignPlan:  "AI生成されたデザイン提案...",
		Specification: "AI生成された仕様書...",
		Estimate:    "AI生成された見積書...",
		Schedule:    "AI生成されたスケジュール...",
		GeneratedAt: time.Now(),
	}
}

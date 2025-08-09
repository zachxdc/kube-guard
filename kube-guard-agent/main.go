package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

var suspiciousKeywords = []string{
	"nmap", "nc ", "nc-", "netcat", "masscan",
	"curl ", "wget ", "powershell", "bash -i",
	"chmod 777", "chattr", "base64 -d", "openssl", "mkfifo",
}

func isSuspicious(s string) bool {
	low := strings.ToLower(s)
	for _, kw := range suspiciousKeywords {
		if strings.Contains(low, kw) {
			return true
		}
	}
	return false
}

type scoreReq struct{ Lines []string `json:"lines"` }
type scoreResp struct{ Scores []float64 `json:"scores"` }

func requestScores(lines []string) ([]float64, error) {
	b, _ := json.Marshal(scoreReq{Lines: lines})
	resp, err := http.Post("http://risk-scorer:8000/score", "application/json", bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var out scoreResp
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out.Scores, nil
}

type Event struct {
	Time   string  `json:"time"`
	Line   string  `json:"line"`
	Score  float64 `json:"score"`
	Alert  bool    `json:"alert"`
	Reason string  `json:"reason"`
}

var (
	events   []Event
	evMu     sync.Mutex
	evMaxLen = 100
)

func addEvent(e Event) {
	evMu.Lock()
	defer evMu.Unlock()
	events = append(events, e)
	if len(events) > evMaxLen {
		events = events[len(events)-evMaxLen:]
	}
}

func main() {
	log.Println("🚀 KubeGuard Agent started (with AI scoring + /events)")
	path := "/tmp/fake_bash_history.log"

	// 启动 HTTP 服务器：/events 返回最近结果
	go func() {
		http.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == http.MethodOptions { // 处理预检
				w.WriteHeader(http.StatusNoContent)
				return
			}

			evMu.Lock()
			defer evMu.Unlock()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(events)
		})
		log.Println("🌐 serving /events on :9000")
		log.Fatal(http.ListenAndServe(":9000", nil))
	}()

	for {
		b, err := os.ReadFile(path)
		if err != nil {
			log.Println("❌ Error reading:", err)
		} else {
			text := string(b)
			log.Println("📜 Collected data:\n" + text)
			var lines []string
			for _, l := range strings.Split(text, "\n") {
				l = strings.TrimSpace(l)
				if l != "" {
					lines = append(lines, l)
				}
			}
			if len(lines) > 0 {
				if scores, err := requestScores(lines); err != nil {
					log.Println("⚠️ scoring service not reachable:", err)
				} else {
					for i, l := range lines {
						alert := isSuspicious(l) || scores[i] >= 0.6
						reason := "AI>=0.6"
						if isSuspicious(l) {
							reason = "rule"
						}
						if alert {
							log.Printf("🤖 AI-RISK %.2f | 🚨 %s\n", scores[i], l)
						} else {
							log.Printf("🤖 AI-RISK %.2f | ✅ %s\n", scores[i], l)
						}
						addEvent(Event{
							Time:  time.Now().Format(time.RFC3339),
							Line:  l,
							Score: scores[i],
							Alert: alert,
							Reason: reason,
						})
					}
				}
			}
		}
		time.Sleep(10 * time.Second)
	}
}
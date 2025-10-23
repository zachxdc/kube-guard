// filepath: /Users/zchen/Documents/GitHub/kube-guard/kubeguard-dashboard/src/App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { initializeMockData, addNewMockEvent, getMockEvents, type Event } from "./mockData";

// Get API URL from environment variable, fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000/events";
const USE_DEMO_MODE = API_URL === "demo";
const POLL_MS = 5000;

type SortKey = "time" | "score" | "line";
type SortDirection = "asc" | "desc";

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [onlyAlerts, setOnlyAlerts] = useState<boolean>(false);
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (USE_DEMO_MODE) {
        // Demo mode: use mock data
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        const mockData = getMockEvents();
        setEvents(mockData);
      } else {
        // Real mode: fetch from actual API
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (USE_DEMO_MODE) {
      // Initialize mock data
      initializeMockData();
    }
    
    fetchEvents();
    
    timer.current = setInterval(() => {
      if (USE_DEMO_MODE) {
        // In demo mode, randomly add new events
        if (Math.random() < 0.3) { // 30% chance per interval
          addNewMockEvent();
        }
      }
      fetchEvents();
    }, POLL_MS);
    
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const filtered = useMemo(() => {
    let rows = events.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.line || "").toLowerCase().includes(q) ||
          (r.reason || "").toLowerCase().includes(q)
      );
    }
    if (onlyAlerts) rows = rows.filter((r) => !!r.alert);

    rows.sort((a, b) => {
      let A, B;
      if (sortKey === "score") {
        A = a.score ?? 0;
        B = b.score ?? 0;
      } else if (sortKey === "line") {
        A = (a.line || "").toLowerCase();
        B = (b.line || "").toLowerCase();
      } else {
        A = Date.parse(a.time || "0");
        B = Date.parse(b.time || "0");
      }
      return sortDir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
    });

    return rows;
  }, [events, query, onlyAlerts, sortKey, sortDir]);

  const th = (key: SortKey, label: string) => (
    <th
      onClick={() => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else {
          setSortKey(key);
          setSortDir(key === "line" ? "asc" : "desc");
        }
      }}
      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
      title="Click to sort"
    >
      {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </th>
  );

  const buttonStyle = (isLoading: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 10,
    border: isLoading ? "1px solid #ddd" : "1px solid #111",
    background: isLoading ? "#eee" : "#111",
    color: isLoading ? "#999" : "#fff",
    cursor: isLoading ? "not-allowed" : "pointer",
  });

  return (
    <div
      style={{
        fontFamily: "ui-sans-serif, system-ui",
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
        KubeGuard Dashboard {USE_DEMO_MODE && "🎭 Demo"}
      </h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 16 }}>
        {USE_DEMO_MODE 
          ? `Live demo with simulated security events (auto refresh every ${POLL_MS / 1000}s)`
          : `Real-time view of agent detections (auto refresh every ${POLL_MS / 1000}s)`
        }
      </p>
      {USE_DEMO_MODE && (
        <div style={{
          padding: "12px 16px",
          background: "#FEF3C7",
          border: "1px solid #FCD34D",
          borderRadius: 10,
          marginBottom: 16,
          fontSize: 14,
          color: "#92400E"
        }}>
          📌 <strong>Demo Mode:</strong> This is a preview with simulated data. 
          Deploy to your Kubernetes cluster for real-time monitoring. 
          <a 
            href="https://github.com/yourusername/kube-guard#quick-start" 
            style={{ marginLeft: 8, color: "#92400E", textDecoration: "underline" }}
          >
            Learn more
          </a>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search command/reason…"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            minWidth: 260,
          }}
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={onlyAlerts}
            onChange={(e) => setOnlyAlerts(e.target.checked)}
          />
          Only alerts
        </label>
        <button
          onClick={fetchEvents}
          disabled={loading}
          style={buttonStyle(loading)}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
        {error && <span style={{ color: "#c00" }}>Error: {error}</span>}
        {!error && (
          <span style={{ color: "#666" }}>
            Showing <b>{filtered.length}</b> (raw {events.length})
          </span>
        )}
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
        >
          <thead style={{ background: "#fafafa" }}>
            <tr>
              {th("time", "Time")}
              {th("score", "AI Score")}
              {th("line", "Command")}
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: 24, color: "#888" }}
                >
                  No data
                </td>
              </tr>
            ) : (
              filtered.map((e, i) => (
                <tr
                  key={i}
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    background: e.alert
                      ? "rgba(255, 59, 48, 0.06)"
                      : "transparent",
                  }}
                >
                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>
                    {e.time ? new Date(e.time).toLocaleString() : "-"}
                  </td>
                  <td
                    style={{ padding: 12, fontVariantNumeric: "tabular-nums" }}
                  >
                    {typeof e.score === "number" ? e.score.toFixed(2) : "-"}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                  >
                    {e.line || "-"}
                  </td>
                  <td style={{ padding: 12 }}>
                    <Badge ok={!e.alert} />
                  </td>
                  <td style={{ padding: 12 }}>{e.reason || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer style={{ marginTop: 16, color: "#888", fontSize: 12 }}>
        Source: {USE_DEMO_MODE 
          ? <><code>Demo Mode</code> (Simulated data)</> 
          : <><code>GET {API_URL}</code> (Agent /events)</>
        }
      </footer>
    </div>
  );
}

interface BadgeProps {
  ok: boolean;
}

function Badge({ ok }: BadgeProps) {
  const bg = ok ? "rgba(16, 185, 129, .15)" : "rgba(239, 68, 68, .15)";
  const fg = ok ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";
  const text = ok ? "OK" : "Alert";
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      {text}
    </span>
  );
}

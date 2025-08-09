import { useEffect, useMemo, useRef, useState } from "react";

const API = "http://localhost:9000/events"; // make sure: kubectl port-forward deploy/kubeguard-agent 9000:9000
const POLL_MS = 5000;

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [sortKey, setSortKey] = useState("time"); // time | score | line
  const [sortDir, setSortDir] = useState("desc"); // asc | desc
  const timer = useRef(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    timer.current = setInterval(fetchEvents, POLL_MS);
    return () => clearInterval(timer.current);
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
        A = Date.parse(a.time || 0);
        B = Date.parse(b.time || 0);
      }
      return sortDir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
    });

    return rows;
  }, [events, query, onlyAlerts, sortKey, sortDir]);

  const th = (key, label) => (
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

  const buttonStyle = (isLoading) => ({
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
        KubeGuard Dashboard
      </h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 16 }}>
        Real-time view of agent detections (auto refresh every {POLL_MS / 1000}
        s)
      </p>

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
                  colSpan="5"
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
        Source: <code>GET {API}</code> (Agent /events)
      </footer>
    </div>
  );
}

function Badge({ ok }) {
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

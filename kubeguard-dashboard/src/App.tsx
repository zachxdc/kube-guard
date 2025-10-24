import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Link,
  ThemeProvider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  PlayArrow as GenerateIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material";
import { theme } from "./theme";
import { API_CONFIG, EVENT_CONFIG, RISK_THRESHOLDS } from "./config";
import {
  initializeMockData,
  addNewMockEvent,
  getMockEvents,
  generateBulkTestData,
  type Event,
} from "./mockData";

const API_URL = import.meta.env.VITE_API_URL || API_CONFIG.DEFAULT_URL;
const FORCE_DEMO_MODE = API_URL === API_CONFIG.DEMO_MODE_KEY;
const POLL_MS = API_CONFIG.POLL_INTERVAL_MS;

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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [useDemoMode, setUseDemoMode] = useState<boolean>(FORCE_DEMO_MODE);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (useDemoMode) {
        await new Promise((resolve) =>
          setTimeout(resolve, EVENT_CONFIG.NETWORK_DELAY_MS)
        );
        const mockData = getMockEvents();
        setEvents(mockData);
      } else {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) {
          if (!FORCE_DEMO_MODE) {
            setUseDemoMode(true);
            initializeMockData();
            const mockData = getMockEvents();
            setEvents(mockData);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      if (!FORCE_DEMO_MODE && !useDemoMode) {
        setUseDemoMode(true);
        initializeMockData();
        const mockData = getMockEvents();
        setEvents(mockData);
      } else {
        setError(e instanceof Error ? e.message : "fetch failed");
      }
    } finally {
      setLoading(false);
    }
  }, [useDemoMode]);

  useEffect(() => {
    if (useDemoMode) {
      initializeMockData();
    }

    fetchEvents();

    timer.current = setInterval(() => {
      if (useDemoMode && Math.random() < EVENT_CONFIG.AUTO_ADD_PROBABILITY) {
        addNewMockEvent();
      }
      fetchEvents();
    }, POLL_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [useDemoMode, fetchEvents]);

  const handleGenerateTestData = () => {
    if (!useDemoMode || isGenerating) return;

    setIsGenerating(true);
    generateBulkTestData(EVENT_CONFIG.BULK_GENERATE_COUNT);
    const mockData = getMockEvents();
    setEvents(mockData);

    setTimeout(() => {
      setIsGenerating(false);
    }, EVENT_CONFIG.BUTTON_DEBOUNCE_MS);
  };

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "line" ? "asc" : "desc");
    }
  };

  const getSeverity = (score: number) => {
    if (score >= RISK_THRESHOLDS.HIGH_RISK) return { label: "Alert", color: "error" as const };
    if (score >= RISK_THRESHOLDS.MEDIUM_RISK_UPPER) return { label: "Warning", color: "warning" as const };
    return { label: "OK", color: "success" as const };
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              KubeGuard Dashboard {useDemoMode && "🎭 Demo"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {useDemoMode
                ? `Live demo with simulated security events (auto refresh every ${POLL_MS / 1000}s)`
                : `Real-time view of agent detections (auto refresh every ${POLL_MS / 1000}s)`}
            </Typography>
          </Box>

          {useDemoMode && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                bgcolor: "warning.main",
                color: "#000",
                "& .MuiAlert-icon": {
                  color: "#000",
                },
              }}
            >
              <Box>
                <Box>
                  <strong>Demo Mode:</strong> This is a preview with simulated data.
                  Maximum {EVENT_CONFIG.MAX_EVENTS} events displayed (older events auto-removed).
                </Box>
                <Box sx={{ mt: 0.5 }}>
                  Deploy to your Kubernetes cluster for real-time monitoring.{" "}
                  <Link
                    href="https://github.com/zachxdc/kube-guard#quick-start"
                    target="_blank"
                    rel="noopener"
                    sx={{ color: "#000", textDecoration: "underline" }}
                  >
                    Learn more
                  </Link>
                </Box>
              </Box>
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search command/reason…"
              size="small"
              sx={{ minWidth: 260 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyAlerts}
                  onChange={(e) => setOnlyAlerts(e.target.checked)}
                />
              }
              label="Only alerts"
            />

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchEvents}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </Button>

            {useDemoMode && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<GenerateIcon />}
                onClick={handleGenerateTestData}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating…" : "Generate Test Data"}
              </Button>
            )}

            {error && (
              <Typography color="error" variant="body2">
                Error: {error}
              </Typography>
            )}

            {!error && (
              <Typography variant="body2" color="text.secondary">
                Showing <strong>{filtered.length}</strong> (raw {events.length})
              </Typography>
            )}
          </Box>

          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    onClick={() => handleSort("time")}
                    sx={{ cursor: "pointer", fontWeight: 600, minWidth: 150 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Time
                      {sortKey === "time" &&
                        (sortDir === "asc" ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort("score")}
                    sx={{ cursor: "pointer", fontWeight: 600, minWidth: 80 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      AI Score
                      {sortKey === "score" &&
                        (sortDir === "asc" ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort("line")}
                    sx={{ cursor: "pointer", fontWeight: 600 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Command
                      {sortKey === "line" &&
                        (sortDir === "asc" ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No data</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow
                      key={e.id || `${e.time}-${e.line}`}
                      sx={{
                        bgcolor: 
                          (e.score ?? 0) >= RISK_THRESHOLDS.HIGH_RISK
                            ? "error.light"
                            : (e.score ?? 0) >= RISK_THRESHOLDS.MEDIUM_RISK_UPPER
                            ? "warning.light"
                            : "transparent",
                      }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {e.time ? new Date(e.time).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>
                        {typeof e.score === "number" ? e.score.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                          whiteSpace: "pre-wrap",
                          maxWidth: 500,
                        }}
                      >
                        {e.line || "-"}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const severity = getSeverity(e.score ?? 0);
                          return (
                            <Chip
                              label={severity.label}
                              color={severity.color}
                              size="small"
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell sx={{ minWidth: 200, maxWidth: 500 }}>
                        {e.reason || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Source:{" "}
              {useDemoMode ? (
                <>
                  <code>Demo Mode</code> (Simulated data)
                </>
              ) : (
                <>
                  <code>GET {API_URL}</code> (Agent /events)
                </>
              )}
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

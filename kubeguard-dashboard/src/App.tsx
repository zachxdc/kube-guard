import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
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
import { API_CONFIG, EVENT_CONFIG } from "./config";
import {
  initializeMockData,
  addNewMockEvent,
  getMockEvents,
  generateBulkTestData,
  type Event,
} from "./mockData";

const API_URL = import.meta.env.VITE_API_URL || API_CONFIG.DEFAULT_URL;
const USE_DEMO_MODE = API_URL === API_CONFIG.DEMO_MODE_KEY;
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
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isGeneratingRef = useRef<boolean>(false);
  const fetchingRef = useRef<boolean>(false);
  const fetchCounterRef = useRef<number>(0);

  const fetchEvents = async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    const currentFetch = ++fetchCounterRef.current;

    try {
      setLoading(true);
      setError("");

      if (USE_DEMO_MODE) {
        await new Promise((resolve) =>
          setTimeout(resolve, EVENT_CONFIG.NETWORK_DELAY_MS)
        );

        if (currentFetch === fetchCounterRef.current) {
          const mockData = getMockEvents();
          setEvents(mockData);
        }
      } else {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (currentFetch === fetchCounterRef.current) {
          setEvents(Array.isArray(data) ? data : []);
        }
      }
    } catch (e) {
      if (currentFetch === fetchCounterRef.current) {
        setError(e instanceof Error ? e.message : "fetch failed");
      }
    } finally {
      if (currentFetch === fetchCounterRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (USE_DEMO_MODE) {
      initializeMockData();
    }

    fetchEvents();

    timer.current = setInterval(() => {
      if (USE_DEMO_MODE && Math.random() < EVENT_CONFIG.AUTO_ADD_PROBABILITY) {
        addNewMockEvent();
      }
      fetchEvents();
    }, POLL_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const handleGenerateTestData = () => {
    if (!USE_DEMO_MODE) return;
    if (isGeneratingRef.current) return;

    isGeneratingRef.current = true;
    fetchingRef.current = true;
    
    flushSync(() => {
      setIsGenerating(true);
    });

    requestAnimationFrame(() => {
      try {
        generateBulkTestData(EVENT_CONFIG.BULK_GENERATE_COUNT);
        const mockData = getMockEvents();
        
        flushSync(() => {
          setEvents(mockData);
        });
      } catch (error) {
        console.error("Failed to generate test data:", error);
      } finally {
        setTimeout(() => {
          isGeneratingRef.current = false;
          fetchingRef.current = false;
          flushSync(() => {
            setIsGenerating(false);
          });
        }, EVENT_CONFIG.BUTTON_DEBOUNCE_MS);
      }
    });
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              KubeGuard Dashboard {USE_DEMO_MODE && "🎭 Demo"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {USE_DEMO_MODE
                ? `Live demo with simulated security events (auto refresh every ${POLL_MS / 1000}s)`
                : `Real-time view of agent detections (auto refresh every ${POLL_MS / 1000}s)`}
            </Typography>
          </Box>

          {USE_DEMO_MODE && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Demo Mode:</strong> This is a preview with simulated data.
              Deploy to your Kubernetes cluster for real-time monitoring.{" "}
              <Link
                href="https://github.com/zachxdc/kube-guard#quick-start"
                target="_blank"
                rel="noopener"
              >
                Learn more
              </Link>
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

            {USE_DEMO_MODE && (
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

          <TableContainer component={Paper} elevation={2} key={`table-${events.length}`}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    onClick={() => handleSort("time")}
                    sx={{ cursor: "pointer", fontWeight: 600 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      Time
                      {sortKey === "time" &&
                        (sortDir === "asc" ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />)}
                    </Box>
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort("score")}
                    sx={{ cursor: "pointer", fontWeight: 600 }}
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
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
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
                        bgcolor: e.alert ? "error.light" : "transparent",
                      }}
                    >
                      <TableCell>
                        {e.time ? new Date(e.time).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>
                        {typeof e.score === "number" ? e.score.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {e.line || "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={e.alert ? "Alert" : "OK"}
                          color={e.alert ? "error" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{e.reason || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Source:{" "}
              {USE_DEMO_MODE ? (
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

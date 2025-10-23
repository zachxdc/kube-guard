export const API_CONFIG = {
  DEFAULT_URL: "http://localhost:9000/events",
  DEMO_MODE_KEY: "demo",
  POLL_INTERVAL_MS: 5000,
} as const;

export const EVENT_CONFIG = {
  MAX_EVENTS: 100,
  INITIAL_EVENTS_COUNT: 10,
  BULK_GENERATE_COUNT: 2,
  BUTTON_DEBOUNCE_MS: 300,
  NETWORK_DELAY_MS: 100,
  AUTO_ADD_PROBABILITY: 0.9,
} as const;

export const RISK_THRESHOLDS = {
  HIGH_RISK: 0.6,
  MEDIUM_RISK_UPPER: 0.4,
  LOW_RISK_UPPER: 0.2,
} as const;

export const RISK_DISTRIBUTION = {
  HIGH: 0.2,
  MEDIUM: 0.4,
  LOW: 1.0,
} as const;


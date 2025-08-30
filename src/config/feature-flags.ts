/**
 * Feature flags for the application
 * Used to enable/disable features in development and production
 */

export const FEATURE_FLAGS = {
  /**
   * Path A Sandbox Implementation
   * When enabled:
   * - Uses same-origin iframe with about:blank
   * - Strict CSP with nonce
   * - Local React UMD and CSS
   * - No runtime transpilation (direct JS injection)
   * When disabled:
   * - Falls back to legacy transpile.ts implementation
   */
  USE_PATH_A_SANDBOX: true,

  /**
   * Job Loss Tracker feature flag
   * - When false: /joblosstracker route is disabled at build-time (404) and all related components/hooks are inert.
   * - When true: route and components behave normally.
   */
  JOB_LOSS_TRACKER_ENABLED: false,
};

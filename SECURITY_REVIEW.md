# Security Review: Chat Widget

## Overview
This review evaluates the security posture of the embeddable chat widget implemented in `chat-widget.js`. The widget is designed to be embedded on arbitrary sites and configured via a global `window.CHAT_CONFIG` object or constructor arguments. As an embeddable script, untrusted configuration data or multi-tenant hosting scenarios pose a heightened risk for cross-site scripting (XSS).

## Findings

### 1. HTML injection via `config.title`
* **Location:** `chat-widget.js`, template literal inside `createWidget()`
* **Issue:** The widget interpolates `this.config.title` directly into a string assigned to `innerHTML` without encoding. Any HTML provided in the configuration will therefore execute in the host page's context, enabling stored or reflected XSS.
* **Impact:** An attacker who controls or can tamper with the configuration (for example, via multi-tenant administration panels, CMS integrations, or query-string bootstrapping) can run arbitrary JavaScript on every page that embeds the widget. This breaks the same-origin policy and can lead to complete account takeover on the hosting site.
* **Recommendation:** Avoid injecting untrusted data via `innerHTML`. Create DOM nodes with `textContent`, or sanitize input with a robust HTML sanitizer before insertion.

### 2. HTML injection via `config.bubbleIcon`
* **Location:** `chat-widget.js`, `createBubble()`
* **Issue:** `this.config.bubbleIcon` is assigned directly to `bubble.innerHTML`. If the value is attacker-controlled, arbitrary markup—including `<script>` tags—can be injected and executed.
* **Impact:** Same as finding 1: arbitrary script execution in the embedding page.
* **Recommendation:** Treat icon configuration as untrusted. Either require static SVG assets shipped with the widget or sanitize the markup before assignment. As a safer alternative, accept only URLs to vetted assets and load them via `<img>` `src`.

### 3. Persistent session data without namespace isolation
* **Location:** `chat-widget.js`, `saveMessages()` / `loadMessages()`
* **Issue:** Messages are stored in `localStorage` under the key `${storageKey}_${sessionId}`. If multiple widgets share the same `storageKey` and `sessionId` across different origins (e.g., staging/production) the data is still origin-bound, but within the same origin a malicious script could read prior conversations. The risk is primarily that the widget encourages storing potentially sensitive chat transcripts in a medium accessible to any script running on the origin.
* **Impact:** Exposure of chat contents to other third-party scripts on the same origin. This is an inherent risk when using `localStorage` for sensitive data.
* **Recommendation:** Document the risk and prefer server-side storage of transcripts. If local persistence is required, consider encrypting the payloads or providing an opt-out configuration.

## Additional Recommendations
* Validate `config.webhook` against an allowlist before use to avoid misconfiguration that could leak data to unexpected endpoints.
* Consider implementing Content Security Policy (CSP) guidance for integrators to reduce the blast radius of potential XSS bugs.

## Conclusion
The most critical issues are the two HTML injection vectors (Findings 1 and 2). Remediation should prioritize escaping/sanitizing configuration values before inserting them into the DOM. Addressing these issues will significantly improve the widget's security posture when embedded in third-party sites.

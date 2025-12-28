# YeMoSHOT

**HIGH-PERFORMANCE WEB ARCHIVING INTERFACE**

> A professional-grade, Node.js-based screenshot automation tool utilizing Puppeteer for high-fidelity rendering. Designed with a Neo-Brutalist aesthetic and built for speed, reliability, and ease of integration.

---

## SYSTEM OVERVIEW

YeMoSHOT offers a robust solution for developers needing programmable website captures. It features a responsive web GUI for manual use and a RESTful API for automated workflows.

### KEY CAPABILITIES

*   **Native API Integration**: Simple JSON-based REST endpoints.
*   **High-Resolution Rendering**: Powered by Chrome/Puppeteer for pixel-perfect results.
*   **Multi-Device Simulation**: Viewports for Desktop (1920x1080), MacBook Pro, iPhone 14, Pixel 7, and more.
*   **Custom Viewports**: Define arbitrary width and height dimensions on the fly.
*   **Auto-Maintenance**: Self-cleaning file storage (24-hour retention policy).
*   **Responsive GUI**: Optimized Neo-Brutalist interface for all screen sizes.

---

## DEPLOYMENT

### PREREQUISITES

*   **Node.js**: v20.x or higher
*   **NPM**: v6.x or higher
*   **OS**: Windows, Linux, or macOS

### INSTALLATION SCRIPT

```bash
# 1. Clone the repository
git clone https://github.com/yemobyte/YeMo-SC.git

# 2. Navigate to directory
cd YeMo-SC

# 3. Install dependencies
npm install

# 4. Initialize server
node server.js
```

> The application will initialize on `http://localhost:3000`

---

## USAGE GUIDE

### WEB INTERFACE
1.  Access `http://localhost:3000`.
2.  Input the target **URL** (http/https).
3.  Select a **Viewport Mode** (Desktop, Mobile, or Custom).
4.  Execute capture.

### API INTEGRATION

**Endpoint**: `POST /api/screenshot`

**Header**: `Content-Type: application/json`

#### REQUEST PAYLOAD

```json
{
  "url": "https://www.github.com",
  "deviceType": "custom",
  "customWidth": 1920,
  "customHeight": 1080
}
```

#### RESPONSE OBJECT

```json
{
  "status": true,
  "message": "Screenshot success",
  "data": {
    "filename": "screenshot-27-12-2024-10-00-00.png",
    "url": "http://localhost:3000/files/screenshot-27-12-2024-10-00-00.png",
    "expires": "24 hours"
  }
}
```

#### DEVICE PRESETS
*   `desktop`
*   `macbook-pro`
*   `iphone-14`
*   `pixel-7`
*   `custom` (requires `customWidth` & `customHeight`)

---

## LICENSE

**GNU GENERAL PUBLIC LICENSE Version 3**

Copyright (C) 2025 **YeMo**  
https://github.com/yemobyte

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation.

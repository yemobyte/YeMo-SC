YEOSHOT - HIGH PERFORMANCE WEB ARCHIVER

YeMoSHOT is a robust, Node.js-based web screenshot tool designed for developers and power users. It utilizes a headless browser engine (Puppeteer) to capture high-resolution screenshots of any website. The system features a responsive Neo-Brutalist web interface and a fully documented REST API for seamless integration.

FEATURES

- High-Speed Rendering: Optimized for fast capture and minimal latency.
- Responsive Design: Works perfectly on Desktop, Mobile, and Tablets.
- REST API: Native API endpoint for easy integration with other applications.
- Auto-Cleanup: Automatically deletes generated files after 24 hours to save storage.
- Multi-Viewport Support: Preset dimensions for Desktop, MacBook, iPhone, Pixel, and Custom sizes.

INSTALLATION

1. Clone the repository:
   git clone https://github.com/yemobyte/YeMo-SC.git

2. Navigate to the project directory:
   cd YeMo-SC

3. Install dependencies:
   npm install

4. Start the server:
   node server.js

The application will be available at http://localhost:3000.

API DOCUMENTATION

Endpoint: POST /api/screenshot
Content-Type: application/json

Parameters:
- url (string, required): The absolute URL of the website to capture.
- deviceType (string, optional): The device viewport preset (e.g., 'desktop', 'iphone-14', 'custom').
- customWidth (integer, optional): Required if deviceType is 'custom'.
- customHeight (integer, optional): Required if deviceType is 'custom'.

Response (JSON):
{
  "status": true,
  "message": "Screenshot success",
  "data": {
    "filename": "screenshot-DATE-TIME.png",
    "url": "http://localhost:3000/files/...",
    "expires": "24 hours"
  }
}

LICENSE

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See the LICENSE file for details.

COPYRIGHT

Copyright (C) 2024 YeMoByte.
All Rights Reserved.

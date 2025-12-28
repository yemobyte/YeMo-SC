YEOSHOT - HIGH PERFORMANCE WEB ARCHIVER

YeMoSHOT is a web-based tool designed to capture high-quality screenshots of websites using a headless browser engine. It provides a user-friendly interface with various device viewports and a REST API for developers.

TABLE OF CONTENTS
1. Features
2. Prerequisites
3. Installation
4. Usage
5. API Reference
6. License

FEATURES
- Capture full-page screenshots of any public URL.
- Predefined viewports for Desktop, MacBook, iPhone, Pixel, and Tablets.
- Custom viewport dimensions support.
- Automatic file cleanup (screenshots are deleted after 24 hours).
- Responsive Neo-Brutalist user interface.
- RESTful API endpoint for programmatic access.

PREREQUISITES
- Node.js (v14 or higher)
- NPM (Node Package Manager)
- A stable internet connection for the headless browser to fetch pages.

INSTALLATION
1. Clone the repository:
   git clone https://github.com/yemobyte/YeMo-SC.git

2. Navigate to the project directory:
   cd YeMo-SC

3. Install the dependencies:
   npm install

USAGE
1. Start the server:
   node server.js

2. Open your web browser and navigate to:
   http://localhost:3000

3. Enter a URL, select a device preset, and click "Run Capture Sequence".

API REFERENCE

Endpoint: POST /api/screenshot

Headers:
  Content-Type: application/json

Body Parameters:
  - url (string): The target URL (e.g., "https://example.com").
  - deviceType (string): "desktop", "macbook-pro", "iphone-14", "pixel-7", or "custom".
  - customWidth (number): Required if deviceType is "custom".
  - customHeight (number): Required if deviceType is "custom".

Example Request (cURL):
  curl -X POST http://localhost:3000/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "deviceType": "iphone-14"}'

Example Response:
  {
    "status": true,
    "message": "Screenshot success",
    "data": {
      "filename": "screenshot-27-12-2024-10-00-00.png",
      "url": "http://localhost:3000/files/screenshot-27-12-2024-10-00-00.png",
      "expires": "24 hours"
    }
  }

LICENSE
This project is licensed under the GNU General Public License v3.0.
See the LICENSE file for the full text.

COPYRIGHT
Copyright (C) 2024 YeMoByte.

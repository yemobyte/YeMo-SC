# YeMo Screenshot Tools

YeMo Screenshot Tools is a high-performance web application designed for capturing high-resolution website screenshots. Built with a Neo-Brutalist aesthetic, it offers both a user-friendly GUI and a robust API for developers.

## Features

- **Multi-Device Support**: Preset viewports for Desktop, Laptop, Tablet, and Mobile.
- **Custom Resolution**: Define specific width and height for your captures.
- **Auto-Cleanup**: Privacy-focused system that automatically deletes files after 24 hours.
- **Developer API**: Simple REST endpoints to integrate screenshot capabilities into other apps.
- **Neo-Brutalist UI**: Modern, high-contrast interface.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

3. Access the application:
   - GUI: `http://localhost:3000`
   - API Docs: `http://localhost:3000/docs.html`

## API Documentation

### 1. Capture Screenshot
**Endpoint**: `POST /api/screenshot`

**Body**:
```json
{
    "url": "https://example.com",
    "deviceType": "desktop" // or 'laptop', 'tablet', 'mobile', 'custom'
}
```

### 2. List Files
**Endpoint**: `GET /api/files`

Returns a list of available screenshots and their expiration times.

## License
Free for use.

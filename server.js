/*
* YeMoSHOT - Web Archiver
* Copyright (C) 2024 YeMoByte.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*/

const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

// Ensure directories exist
const publicDir = path.join(__dirname, 'public');
const filesDir = path.join(publicDir, 'files');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
    // Created directory: /public/files
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
setInterval(() => {
    fs.readdir(filesDir, (err, files) => {
        if (err) return;
        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(filesDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                if (now - stats.mtimeMs > MAX_AGE_MS) {
                    fs.unlink(filePath, () => { });
                }
            });
        });
    });
}, 60 * 60 * 1000);

const devices = {
    'desktop': { width: 1920, height: 1080 },
    'macbook-pro': { width: 1728, height: 1117 },
    'macbook-air': { width: 1440, height: 900 },
    'laptop': { width: 1366, height: 768 },
    'ipad-pro': { width: 1024, height: 1366, isMobile: true },
    'ipad-mini': { width: 768, height: 1024, isMobile: true },
    'samsung-tab': { width: 800, height: 1280, isMobile: true },
    'iphone-14-pro-max': { width: 430, height: 932, isMobile: true },
    'iphone-14': { width: 390, height: 844, isMobile: true },
    'iphone-se': { width: 375, height: 667, isMobile: true },
    'samsung-s22': { width: 360, height: 780, isMobile: true },
    'pixel-7': { width: 412, height: 915, isMobile: true },
    'generic-android': { width: 360, height: 640, isMobile: true }
};

app.post('/api/screenshot', async (req, res) => {
    const { url, deviceType, customWidth, customHeight } = req.body;

    if (!url) return res.status(400).json({ status: false, message: 'URL required' });

    let viewport = devices[deviceType];

    if (deviceType === 'custom') {
        viewport = {
            width: parseInt(customWidth) || 1920,
            height: parseInt(customHeight) || 1080
        };
    } else if (!viewport) {
        viewport = devices['desktop'];
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport(viewport);

        if (viewport.isMobile) {
            await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
        }

        const targetUrl = url.startsWith('http') ? url : `https://${url}`;

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        const d = new Date();
        const dateStr = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
        const timeStr = `${d.getHours().toString().padStart(2, '0')}-${d.getMinutes().toString().padStart(2, '0')}-${d.getSeconds().toString().padStart(2, '0')}`;
        const filename = `screenshot-${dateStr}-${timeStr}.png`;
        const filepath = path.join(filesDir, filename);

        await page.screenshot({ path: filepath, fullPage: true });
        await browser.close();

        res.json({
            status: true,
            message: "Screenshot success",
            data: {
                filename,
                url: `${req.protocol}://${req.get('host')}/files/${filename}`,
                expires: "24 hours"
            }
        });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ status: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true });
    }
});

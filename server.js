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

// Rate Limiting Logic
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 100; // 100 requests
const BAN_DURATION = 5 * 60 * 1000; // 5 minutes

app.use('/api', (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, startTime: now, banUntil: 0 });
        return next();
    }

    const data = requestCounts.get(ip);

    // Check if banned
    if (now < data.banUntil) {
        const remainingSeconds = Math.ceil((data.banUntil - now) / 1000);
        return res.status(429).json({
            status: false,
            message: `Rate limit exceeded. Banned for ${remainingSeconds}s.`,
            customError: true
        });
    }

    // Reset window if expired
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
        data.count = 1;
        data.startTime = now;
        data.banUntil = 0;
        requestCounts.set(ip, data);
        return next();
    }

    // Increment and check limit
    data.count++;
    if (data.count > RATE_LIMIT_MAX) {
        data.banUntil = now + BAN_DURATION;
        requestCounts.set(ip, data);
        return res.status(429).json({
            status: false,
            message: 'Rate limit exceeded (100/5min). Banned for 5 minutes.',
            customError: true
        });
    }

    requestCounts.set(ip, data);
    next();
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'public', 'files', filename);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).json({ status: false, message: 'File not found' });
    }
});

const publicDir = path.join(__dirname, 'public');
const filesDir = path.join(publicDir, 'files');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
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
    'generic-android': { width: 360, height: 640, isMobile: true },
    'macos-light': { width: 1440, height: 900 },
    'macos-dark': { width: 1440, height: 900 },
    'win-11': { width: 1920, height: 1080 },
    'iphone-15-pro': { width: 393, height: 852, isMobile: true },
    'iphone-13-mini': { width: 375, height: 812, isMobile: true },
    'samsung-s23-ultra': { width: 384, height: 854, isMobile: true },
    'pixel-7-pro': { width: 412, height: 892, isMobile: true }
};

app.post('/api/screenshot', async (req, res) => {
    const { url, deviceType, customWidth, customHeight, delay, format, fullPage } = req.body;

    if (!url) return res.status(400).json({ status: false, message: 'URL required' });

    const outputFormat = (format || 'png').toLowerCase();
    const validFormats = ['png', 'jpeg', 'pdf'];
    if (!validFormats.includes(outputFormat)) {
        return res.status(400).json({ status: false, message: 'Invalid format. Use png, jpeg, or pdf.' });
    }

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
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--ignore-certificate-errors',
            '--allow-running-insecure-content',
            '--allow-insecure-localhost'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport(viewport);

        if (viewport.isMobile) {
            await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
        }

        let targetUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            targetUrl = `http://${url}`;
        }

        let navigationFailed = false;
        try {
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch (gotoError) {
            navigationFailed = true;
            if (gotoError.message.includes('ERR_SSL_PROTOCOL_ERROR') && targetUrl.startsWith('https://')) {
                try {
                    const fallbackUrl = targetUrl.replace('https://', 'http://');
                    await page.goto(fallbackUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    navigationFailed = false;
                } catch (e) { }
            }
        }

        const filename = `capture-${Date.now()}.${outputFormat}`;
        const filepath = path.join(filesDir, filename);

        let userDelay = parseInt(delay) || 5;
        if (userDelay < 0) userDelay = 0;
        if (userDelay > 30) userDelay = 30;

        const waitTime = navigationFailed ? 0 : userDelay * 1000;
        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const isFull = fullPage === true || fullPage === 'true';
        const isMacOS = deviceType === 'macos-light' || deviceType === 'macos-dark';

        if (isMacOS && outputFormat !== 'pdf') {
            await page.evaluate((type) => {
                const isDark = type === 'macos-dark';
                const body = document.body;
                const html = document.documentElement;

                const wrapper = document.createElement('div');
                wrapper.id = 'yemo-macos-wrapper';
                wrapper.style.cssText = `
                    padding: 40px;
                    background: ${isDark ? '#1a1a1a' : '#f0f0f0'};
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    min-height: 100vh;
                `;

                const win = document.createElement('div');
                win.style.cssText = `
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                    overflow: hidden;
                    border: 1px solid ${isDark ? '#333' : '#ccc'};
                    width: 100%;
                `;

                const titleBar = document.createElement('div');
                titleBar.style.cssText = `
                    height: 32px;
                    background: ${isDark ? '#333' : '#ebebeb'};
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                    border-bottom: 1px solid ${isDark ? '#222' : '#ddd'};
                `;

                const dots = document.createElement('div');
                dots.style.display = 'flex';
                dots.style.gap = '8px';
                ['#ff5f56', '#ffbd2e', '#27c93f'].forEach(color => {
                    const dot = document.createElement('div');
                    dot.style.cssText = `width: 12px; height: 12px; border-radius: 50%; background: ${color}; border: 0.5px solid rgba(0,0,0,0.1);`;
                    dots.appendChild(dot);
                });
                titleBar.appendChild(dots);

                const content = document.createElement('div');
                content.style.background = 'white';

                while (body.firstChild) {
                    content.appendChild(body.firstChild);
                }

                win.appendChild(titleBar);
                win.appendChild(content);
                wrapper.appendChild(win);
                body.appendChild(wrapper);

                html.style.overflow = 'hidden';
                body.style.margin = '0';
            }, deviceType);
        }

        let captureSuccess = true;
        try {
            if (outputFormat === 'pdf') {
                await page.pdf({
                    path: filepath,
                    format: 'A4',
                    printBackground: true
                });
            } else {
                await page.screenshot({
                    path: filepath,
                    fullPage: (navigationFailed || isMacOS) ? false : isFull,
                    type: outputFormat === 'jpeg' ? 'jpeg' : 'png',
                    quality: outputFormat === 'jpeg' ? 80 : undefined
                });
            }
        } catch (screenshotError) {
            captureSuccess = false;
        }

        await browser.close();

        if (!captureSuccess) {
            return res.json({
                status: false,
                message: "Capture sequence failed",
                customError: true
            });
        }

        res.json({
            status: true,
            format: outputFormat,
            message: navigationFailed ? "Captured (Site Offline)" : "Capture Success",
            data: {
                filename,
                url: `${req.protocol}://${req.get('host')}/files/${filename}`,
                expires: "24 hours"
            }
        });
    } catch (error) {
        if (browser) await browser.close();
        res.json({ status: false, message: error.message, customError: true });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true });
    }
});

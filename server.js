const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = "1d3a0eefa97b499d8fbc4ee93eeb40b7";
const PORT = process.env.PORT || 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Handle API proxy requests
    if (req.url.startsWith('/api/news?')) {
        const query = new URL(req.url, `http://localhost:${PORT}`).searchParams.get('q');
        const newsApiUrl = `https://newsapi.org/v2/everything?q=${query}&apiKey=${API_KEY}`;
        
        const options = {
            headers: {
                'User-Agent': 'NewsApp/1.0'
            }
        };
        
        https.get(newsApiUrl, options, (apiRes) => {
            let data = '';
            
            apiRes.on('data', (chunk) => {
                data += chunk;
            });
            
            apiRes.on('end', () => {
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch news' }));
        });
        return;
    }
    
    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

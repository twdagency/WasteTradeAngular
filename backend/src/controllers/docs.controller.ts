import { Request, RestBindings, Response } from '@loopback/rest';
import { inject } from '@loopback/core';
import { get, param } from '@loopback/rest';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import { HttpErrors } from '@loopback/rest';
import { EnvironmentEnum } from '../enum';
import { execSync } from 'child_process';

export class DocsController {
    constructor(
        @inject(RestBindings.Http.REQUEST) private req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response,
    ) {}

    private readonly NODE_ENV = process.env.NODE_ENV || 'development';

    private checkDevEnvironment(): void {
        if (this.NODE_ENV !== 'development' && this.NODE_ENV !== EnvironmentEnum.DEVELOP) {
            throw new HttpErrors.NotFound('Documentation not available in production');
        }
    }

    private getLastCommitDate(): string {
        try {
            const lastCommitDate = execSync('git log -1 --format=%cd --date=format:"%B %d, %Y at %I:%M %p"', {
                encoding: 'utf-8',
                cwd: path.join(__dirname, '../../'),
            }).trim();
            return lastCommitDate;
        } catch (error) {
            const docsPath = path.join(__dirname, '../../docs');
            let latestTime: number | null = null;

            const scanDirectory = (dirPath: string) => {
                const items = fs.readdirSync(dirPath);
                for (const item of items) {
                    const fullPath = path.join(dirPath, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        scanDirectory(fullPath);
                    } else if (item.endsWith('.md')) {
                        const mtime = stat.mtime.getTime();
                        if (latestTime === null || mtime > latestTime) {
                            latestTime = mtime;
                        }
                    }
                }
            };

            try {
                scanDirectory(docsPath);
            } catch {}

            const date = latestTime ? new Date(latestTime) : new Date();
            const dateStr = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Bangkok',
            });
            const timeStr = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Bangkok',
            });
            return `${dateStr} at ${timeStr}`;
        }
    }

    @get('/docs', {
        responses: {
            '200': {
                description: 'Documentation viewer HTML page',
                content: {
                    'text/html': {
                        schema: { type: 'string' },
                    },
                },
            },
            '404': {
                description: 'Documentation not available in production',
            },
        },
    })
    async getDocsViewer(): Promise<void> {
        this.checkDevEnvironment();
        this.res.setHeader('Content-Type', 'text/html');
        const lastUpdate = this.getLastCommitDate();
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WasteTrade Documentation (Development)</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: #343a40;
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .header-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .last-update {
            font-size: 0.875rem;
            color: #adb5bd;
            font-weight: 400;
        }
        
        .env-badge {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
        }
        
        .search-container {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #dee2e6;
        }
        
        .search-box {
            width: 100%;
            max-width: 500px;
            padding: 0.75rem 1rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        
        .search-box:focus {
            outline: none;
            border-color: #007bff;
        }
        
        .main-container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        
        .sidebar {
            width: 350px;
            background: white;
            border-right: 1px solid #dee2e6;
            overflow-y: auto;
        }
        
        .file-list {
            padding: 1rem;
        }
        
        .file-item {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 0.25rem;
            transition: background-color 0.2s;
            font-size: 0.9rem;
        }
        
        .file-item:hover {
            background: #f8f9fa;
        }
        
        .file-item.active {
            background: #007bff;
            color: white;
        }
        
        .file-item.hidden {
            display: none;
        }
        
        .content-area {
            flex: 1;
            background: white;
            overflow-y: auto;
            padding: 2rem;
        }
        
        .markdown-content {
            max-width: 900px;
            line-height: 1.6;
        }
        
        .markdown-content h1 {
            color: #343a40;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .markdown-content h2 {
            color: #495057;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        
        .markdown-content h3 {
            color: #6c757d;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        
        .markdown-content code {
            background: #f8f9fa;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9rem;
        }
        
        .markdown-content pre {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            border-left: 4px solid #007bff;
        }
        
        .markdown-content pre code {
            background: none;
            padding: 0;
        }
        
        .markdown-content blockquote {
            border-left: 4px solid #dee2e6;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6c757d;
        }
        
        .markdown-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        
        .markdown-content th,
        .markdown-content td {
            border: 1px solid #dee2e6;
            padding: 0.75rem;
            text-align: left;
        }
        
        .markdown-content th {
            background: #f8f9fa;
            font-weight: 600;
        }
        
        .welcome-message {
            text-align: center;
            color: #6c757d;
            margin-top: 3rem;
        }
        
        .search-results {
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .highlight {
            background: yellow;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            .sidebar {
                width: 100%;
                position: absolute;
                z-index: 1000;
                height: 100%;
                transform: translateX(-100%);
                transition: transform 0.3s;
            }
            
            .sidebar.open {
                transform: translateX(0);
            }
            
            .content-area {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-info">
            <h1>📚 WasteTrade Documentation<span class="env-badge">Dev</span></h1>
            <span class="last-update">Last updated: ${lastUpdate}</span>
        </div>
    </div>
    
    <div class="search-container">
        <input type="text" class="search-box" placeholder="🔍 Search documentation..." id="searchInput">
        <div class="search-results" id="searchResults"></div>
    </div>
    
    <div class="main-container">
        <div class="sidebar">
            <div class="file-list" id="fileList">
                <!-- Files will be loaded here -->
            </div>
        </div>
        
        <div class="content-area">
            <div class="markdown-content" id="content">
                <div class="welcome-message">
                    <h2>Welcome to WasteTrade Documentation</h2>
                    <p>Select a documentation file from the sidebar to view its contents.</p>
                    <p>Use the search box above to find specific content across all documents.</p>
                    <br>
                    <p><strong>⚠️ Development Environment Only</strong></p>
                    <p>This documentation viewer is only available in development mode.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let allFiles = [];
        let currentFile = null;
         
        async function loadFileList(retryCount = 0) {
            try {
                console.log('[DOCS DEBUG] Client: Loading file list');
                const response = await fetch('/docs/files');
                
                console.log('[DOCS DEBUG] Client: File list response status:', response.status);
                
                if (response.status !== 200) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const files = await response.json();
                console.log('[DOCS DEBUG] Client: Loaded', files.length, 'files');
                allFiles = files;
                renderFileList(files);
            } catch (error) {
                console.error('Error loading file list:', error);
                

                if (retryCount < 3) {
                    console.log('[DOCS DEBUG] Client: Retrying file list load (attempt ' + (retryCount + 1) + '/3)');
                    setTimeout(() => {
                        loadFileList(retryCount + 1);
                    }, (retryCount + 1) * 1000);
                } else {
                    console.log('[DOCS DEBUG] Client: Max retries reached, showing empty list');
                    allFiles = [];
                    renderFileList([]);
                }
            }
        }
        
        function renderFileList(files) {
            const fileList = document.getElementById('fileList');
            if (!files || !Array.isArray(files)) {
                fileList.innerHTML = '<div class="file-item">No files available</div>';
                return;
            }
            fileList.innerHTML = files.map(file => 
                '<div class="file-item" data-file="' + file.path + '">' +
                    file.name +
                '</div>'
            ).join('');
        }
        
        document.getElementById('fileList').addEventListener('click', function(e) {
            const fileItem = e.target.closest('.file-item');
            if (fileItem && fileItem.dataset.file) {
                loadFile(fileItem.dataset.file);
            }
        });
        
        async function loadFile(filePath) {
            try {
                document.querySelectorAll('.file-item').forEach(item => {
                    item.classList.remove('active');
                });
                document.querySelector('[data-file="' + filePath + '"]').classList.add('active');
                const response = await fetch('/docs/file?path=' + encodeURIComponent(filePath));
                
                const html = await response.text();
                document.getElementById('content').innerHTML = html;
                currentFile = filePath;
            } catch (error) {
                console.error('Error loading file:', error);
                document.getElementById('content').innerHTML = 
                    '<div class="welcome-message"><h2>Error</h2><p>Failed to load file content.</p></div>';
            }
        }
        
        async function searchDocs(query) {
            if (!query.trim()) {
                renderFileList(allFiles);
                document.getElementById('searchResults').textContent = '';
                return;
            }
            
            try {
                const response = await fetch('/docs/search?q=' + encodeURIComponent(query));
                
                const results = await response.json();
                

                const searchResults = document.getElementById('searchResults');
                searchResults.textContent = \`Found \${results.length} result(s) for "\${query}"\`;
                renderFileList(allFiles.filter(file => 
                    results.some(result => result.file === file.path)
                ));
                if (results.length > 0) {
                    loadFile(results[0].file);
                }
            } catch (error) {
                console.error('Error searching:', error);
            }
        }
        
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchDocs(e.target.value);
            }, 300);
        });
        
        loadFileList();
    </script>
</body>
</html>`;

        this.res.send(htmlTemplate);
    }

    @get('/docs/files')
    async getFileList(): Promise<{ name: string; path: string }[]> {
        this.checkDevEnvironment();
        const docsPath = path.join(__dirname, '../../docs');
        const files: { name: string; path: string }[] = [];

        const scanDirectory = (dirPath: string, relativePath = '') => {
            const items = fs.readdirSync(dirPath);

            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const relativeFilePath = path.join(relativePath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath, relativeFilePath);
                } else if (item.endsWith('.md')) {
                    files.push({
                        name: relativeFilePath.replace(/\\/g, '/'),
                        path: relativeFilePath.replace(/\\/g, '/'),
                    });
                }
            }
        };

        try {
            scanDirectory(docsPath);
            return files.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            return [];
        }
    }

    @get('/docs/file', {
        responses: {
            '200': {
                description: 'Markdown file content as HTML',
                content: {
                    'text/html': {
                        schema: { type: 'string' },
                    },
                },
            },
            '404': {
                description: 'Documentation not available in production',
            },
        },
    })
    async getFile(@param.query.string('path') filePath: string): Promise<void> {
        this.checkDevEnvironment();
        this.res.setHeader('Content-Type', 'text/html');

        try {
            const docsPath = path.join(__dirname, '../../docs');
            const fullPath = path.join(docsPath, filePath);
            if (!fullPath.startsWith(docsPath)) {
                throw new Error('Invalid file path');
            }

            const content = fs.readFileSync(fullPath, 'utf-8');
            marked.setOptions({
                breaks: true,
                gfm: true,
            });

            const html = marked(content);
            this.res.send(`<div class="markdown-content">${html}</div>`);
        } catch (error) {
            this.res.send('<div class="welcome-message"><h2>Error</h2><p>File not found or cannot be read.</p></div>');
        }
    }

    @get('/docs/search')
    async searchDocs(@param.query.string('q') query: string): Promise<{ file: string; matches: string[] }[]> {
        this.checkDevEnvironment();

        const docsPath = path.join(__dirname, '../../docs');
        const results: { file: string; matches: string[] }[] = [];

        if (!query || query.trim().length < 2) {
            return results;
        }

        const searchTerm = query.toLowerCase();

        const searchInDirectory = (dirPath: string, relativePath = '') => {
            const items = fs.readdirSync(dirPath);

            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const relativeFilePath = path.join(relativePath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    searchInDirectory(fullPath, relativeFilePath);
                } else if (item.endsWith('.md')) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf-8');
                        const lines = content.split('\n');
                        const matches: string[] = [];

                        // Search in file name
                        if (item.toLowerCase().includes(searchTerm)) {
                            matches.push(`Filename: ${item}`);
                        }

                        // Search in file path (full relative path)
                        if (relativeFilePath.toLowerCase().includes(searchTerm)) {
                            matches.push(`Path: ${relativeFilePath.replace(/\\/g, '/')}`);
                        }

                        // Search in folder path
                        const folderPath = path.dirname(relativeFilePath);
                        if (folderPath !== '.' && folderPath.toLowerCase().includes(searchTerm)) {
                            matches.push(`Folder: ${folderPath.replace(/\\/g, '/')}`);
                        }

                        // Search in content
                        lines.forEach((line, index) => {
                            if (line.toLowerCase().includes(searchTerm)) {
                                matches.push(`Line ${index + 1}: ${line.trim()}`);
                            }
                        });

                        if (matches.length > 0) {
                            results.push({
                                file: relativeFilePath.replace(/\\/g, '/'),
                                matches: matches.slice(0, 5), // Limit to first 5 matches per file
                            });
                        }
                    } catch (error) {
                        // Skip files that can't be read
                    }
                }
            }
        };

        try {
            searchInDirectory(docsPath);
            return results.sort((a, b) => b.matches.length - a.matches.length);
        } catch (error) {
            return [];
        }
    }
}

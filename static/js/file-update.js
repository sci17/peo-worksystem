/**
 * Real-time File Update Client
 * Connects to WebSocket for live file synchronization
 */

class FileUpdateManager {
    constructor() {
        this.wsUrl = this.getWebSocketUrl();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 3000; // 3 seconds
        this.fileCache = new Map();
        this.connected = false;
        
        this.init();
    }
    
    getWebSocketUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/ws/files/update/`;
    }
    
    init() {
        this.connect();
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = (event) => {
                console.log('[FileUpdate] WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.showNotification('Connected to server', 'success');
                
                // Request initial file list
                this.ws.send(JSON.stringify({ type: 'get_files' }));
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onerror = (error) => {
                console.error('[FileUpdate] WebSocket error:', error);
                this.showNotification('Connection error', 'error');
            };
            
            this.ws.onclose = (event) => {
                console.log('[FileUpdate] WebSocket disconnected');
                this.connected = false;
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('[FileUpdate] Failed to create WebSocket:', error);
            this.attemptReconnect();
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[FileUpdate] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
            this.showNotification('Lost connection to server', 'error');
        }
    }
    
    handleMessage(data) {
        const type = data.type;
        
        switch (type) {
            case 'initial_files':
                this.handleInitialFiles(data);
                break;
            case 'file_update':
                this.handleFileUpdate(data);
                break;
            case 'file_change':
                this.handleFileChange(data);
                break;
            case 'file_notify':
                this.handleFileNotify(data);
                break;
            case 'pong':
                console.log('[FileUpdate] Server pong');
                break;
            default:
                console.log('[FileUpdate] Unknown message type:', type);
        }
    }
    
    handleInitialFiles(data) {
        console.log('[FileUpdate] Received initial file list:', data.files.length + ' files');
        this.fileCache.clear();
        
        data.files.forEach(file => {
            this.fileCache.set(file.path, file);
        });
        
        this.updateFileListUI(data.files);
    }
    
    handleFileUpdate(data) {
        console.log('[FileUpdate] File list updated');
        this.updateFileListUI(data.files);
    }
    
    handleFileChange(data) {
        const changes = {
            added: data.added || [],
            deleted: data.deleted || [],
            modified: data.modified || [],
        };
        
        console.log('[FileUpdate] File changes detected:', changes);
        
        // Process additions
        changes.added.forEach(path => {
            this.showNotification(`New file added: ${path}`, 'info');
            this.triggerRefresh();
        });
        
        // Process deletions
        changes.deleted.forEach(path => {
            this.fileCache.delete(path);
            this.showNotification(`File deleted: ${path}`, 'warning');
        });
        
        // Process modifications
        changes.modified.forEach(path => {
            this.showNotification(`File updated: ${path}`, 'info');
        });
        
        if (changes.added.length || changes.deleted.length || changes.modified.length) {
            this.triggerRefresh();
        }
    }
    
    handleFileNotify(data) {
        const notification = `${data.uploader} uploaded: ${data.filename} (${this.formatSize(data.size)})`;
        console.log('[FileUpdate] File notification:', notification);
        this.showNotification(notification, 'success');
        this.triggerRefresh();
    }
    
    updateFileListUI(files) {
        // Find file list container
        const fileList = document.getElementById('file-list');
        if (!fileList) return;
        
        // Update file list in UI (customize based on your HTML structure)
        console.log('[FileUpdate] Updating file list UI with', files.length, 'files');
        
        // Emit custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('filesUpdated', {
            detail: { files: files }
        }));
    }
    
    triggerRefresh() {
        // Refresh the page or update without refresh (depending on your app)
        window.dispatchEvent(new CustomEvent('needsRefresh'));
    }
    
    sendActivity(activity) {
        if (this.connected) {
            this.ws.send(JSON.stringify({
                type: 'activity',
                activity: activity
            }));
        }
    }
    
    ping() {
        if (this.connected) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element (customize based on your UI)
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${this.getNotificationColor(type)};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    getNotificationColor(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }
    
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.fileUpdateManager = new FileUpdateManager();
    
    // Ping server every 30 seconds to keep connection alive
    setInterval(() => {
        if (window.fileUpdateManager) {
            window.fileUpdateManager.ping();
        }
    }, 30000);
});

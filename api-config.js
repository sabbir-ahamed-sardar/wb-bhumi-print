/**
 * Secure API Configuration
 * Copyright by https://wbbhumiprint.com
 * Owner by Mr.gani
 * 
 * This class provides secure API configuration with obfuscation,
 * rate limiting, and input sanitization features.
 */
class SecureAPIConfig {
    constructor() {
        // Obfuscated API endpoints to prevent easy discovery
        this.endpoints = {
            base: this.obfuscateUrl('https://wbbhumiprint.com/api'),
            login: this.obfuscateUrl('login.php'),
            register: this.obfuscateUrl('register.php'),
            logout: this.obfuscateUrl('logout.php'),
            verify: this.obfuscateUrl('verify-token.php'),
            validation: this.obfuscateUrl('get-account-validation.php')
        };
        
        // API Key for server communication
        this.apiKey = this.generateApiKey();
        
        // Rate limiting configuration
        this.rateLimit = {
            maxRequests: 10,
            timeWindow: 60000, // 1 minute
            requests: new Map()
        };
        
        // Allowed origins for CORS - More restrictive
        this.allowedOrigins = [
            'chrome-extension://ijamjkfkgffakimceholgejfoeldblel'
        ];
    }
    
    /**
     * Obfuscate URLs to make them harder to discover
     * @param {string} url - The URL to obfuscate
     * @returns {string} - The obfuscated URL
     */
    obfuscateUrl(url) {
        // Simple base64 encoding for obfuscation
        return btoa(url).split('').reverse().join('');
    }
    
    /**
     * Deobfuscate URLs
     * @param {string} obfuscatedUrl - The obfuscated URL to deobfuscate
     * @returns {string|null} - The deobfuscated URL or null if failed
     */
    deobfuscateUrl(obfuscatedUrl) {
        try {
            return atob(obfuscatedUrl.split('').reverse().join(''));
        } catch (e) {
            console.error('Failed to deobfuscate URL:', e);
            return null;
        }
    }
    
    // Generate API key - More secure
    generateApiKey() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        const crypto = window.crypto || window.msCrypto;
        
        if (crypto && crypto.getRandomValues) {
            // Use crypto API if available for better randomness
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);
            const randomBytes = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            return btoa(timestamp + random + randomBytes).replace(/[^a-zA-Z0-9]/g, '');
        }
        
        return btoa(timestamp + random).replace(/[^a-zA-Z0-9]/g, '');
    }
    
    /**
     * Check rate limiting for a client
     * @param {string} clientId - The client ID to check
     * @returns {boolean} - True if within rate limit, false if exceeded
     */
    checkRateLimit(clientId) {
        const now = Date.now();
        const clientRequests = this.rateLimit.requests.get(clientId) || [];
        
        // Remove old requests outside the time window
        const validRequests = clientRequests.filter(time => now - time < this.rateLimit.timeWindow);
        
        if (validRequests.length >= this.rateLimit.maxRequests) {
            return false; // Rate limit exceeded
        }
        
        // Add current request
        validRequests.push(now);
        this.rateLimit.requests.set(clientId, validRequests);
        
        return true;
    }
    
    // Get client ID from extension
    getClientId() {
        return chrome.runtime.id || 'unknown';
    }
    
    // Validate request origin
    validateOrigin(origin) {
        return this.allowedOrigins.some(allowed => 
            allowed.includes('*') || origin === allowed
        );
    }
    
    // Create secure headers
    createHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-Key': this.apiKey,
            'X-Client-ID': this.getClientId(),
            'X-Request-Time': Date.now().toString()
        };
        
        // Only add extension version if available
        try {
            const manifest = chrome.runtime.getManifest();
            if (manifest && manifest.version) {
                headers['X-Extension-Version'] = manifest.version;
            }
        } catch (e) {
            console.warn('Could not get extension version:', e);
        }
        
        if (includeAuth) {
            // No authentication token needed since authentication is removed
        }
        
        return headers;
    }
    
    /**
     * Sanitize input data to prevent XSS attacks
     * @param {any} data - The data to sanitize
     * @returns {any} - The sanitized data
     */
    sanitizeInput(data) {
        if (typeof data === 'string') {
            return data.replace(/[<>\"'&]/g, function(match) {
                const escapeMap = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;'
                };
                return escapeMap[match];
            });
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    sanitized[key] = this.sanitizeInput(data[key]);
                }
            }
            return sanitized;
        }
        
        return data;
    }
}

// Export for use in other files
window.SecureAPIConfig = SecureAPIConfig;

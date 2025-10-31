// Security and Performance Utilities
// FASE 7.0 - SOLUCIONES EMPRESARIALES

import DOMPurify from 'dompurify';

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

export interface ValidationConfig {
    maxFileSize: number; // Max file size in bytes
    allowedMimeTypes: string[];
    allowedEmbedDomains: string[];
    maxInputLength: number;
}

export class SecurityValidator {
    private static readonly DEFAULT_CONFIG: ValidationConfig = {
        maxFileSize: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ],
        allowedEmbedDomains: [
            'youtube.com',
            'www.youtube.com',
            'youtu.be',
            'drive.google.com',
            'docs.google.com',
            'vimeo.com',
            'player.vimeo.com'
        ],
        maxInputLength: 10000
    };

    // Sanitize HTML content
    static sanitizeHtml(html: string): string {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'blockquote', 'code', 'pre',
                'a', 'img', 'iframe'
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'src', 'alt', 'title',
                'width', 'height', 'frameborder', 'allowfullscreen'
            ],
            ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
        });
    }

    // Validate and sanitize text input
    static sanitizeText(text: string, maxLength?: number): string {
        if (!text) return '';

        const limit = maxLength || this.DEFAULT_CONFIG.maxInputLength;
        const sanitized = text.slice(0, limit).trim();

        // Remove potentially dangerous characters
        return sanitized.replace(/[<>\"']/g, '');
    }

    // Validate file upload
    static validateFile(file: File, config?: Partial<ValidationConfig>): { valid: boolean; error?: string } {
        const cfg = { ...this.DEFAULT_CONFIG, ...config };

        // Check file size
        if (file.size > cfg.maxFileSize) {
            return {
                valid: false,
                error: `File size exceeds limit of ${cfg.maxFileSize / (1024 * 1024)}MB`
            };
        }

        // Check MIME type
        if (!cfg.allowedMimeTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type '${file.type}' is not allowed`
            };
        }

        return { valid: true };
    }

    // Validate embed URL
    static validateEmbedUrl(url: string, config?: Partial<ValidationConfig>): { valid: boolean; error?: string } {
        const cfg = { ...this.DEFAULT_CONFIG, ...config };

        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();

            // Check if domain is allowed
            const isAllowed = cfg.allowedEmbedDomains.some(domain =>
                hostname === domain || hostname.endsWith(`.${domain}`)
            );

            if (!isAllowed) {
                return {
                    valid: false,
                    error: `Embed domain '${hostname}' is not allowed`
                };
            }

            // Additional YouTube validation
            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                return this.validateYouTubeUrl(url);
            }

            // Additional Google Drive validation
            if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com')) {
                return this.validateGoogleDriveUrl(url);
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: 'Invalid URL format'
            };
        }
    }

    private static validateYouTubeUrl(url: string): { valid: boolean; error?: string } {
        const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

        if (!youtubeRegex.test(url)) {
            return {
                valid: false,
                error: 'Invalid YouTube URL format'
            };
        }

        return { valid: true };
    }

    private static validateGoogleDriveUrl(url: string): { valid: boolean; error?: string } {
        const driveRegex = /^https:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|document\/d\/|presentation\/d\/|spreadsheets\/d\/)([a-zA-Z0-9-_]+)/;

        if (!driveRegex.test(url)) {
            return {
                valid: false,
                error: 'Invalid Google Drive URL format'
            };
        }

        return { valid: true };
    }

    // Validate email format
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone format (basic)
    static validatePhone(phone: string): boolean {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Generate secure slug
    static generateSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
}

export class RateLimiter {
    // Check if request is within rate limit
    static checkRateLimit(
        identifier: string,
        config: RateLimitConfig
    ): { allowed: boolean; remainingRequests: number; resetTime: number } {
        const now = Date.now();
        const key = identifier;
        const entry = rateLimitStore.get(key);

        // If no entry or window has expired, create new entry
        if (!entry || now > entry.resetTime) {
            const newEntry = {
                count: 1,
                resetTime: now + config.windowMs
            };
            rateLimitStore.set(key, newEntry);

            return {
                allowed: true,
                remainingRequests: config.maxRequests - 1,
                resetTime: newEntry.resetTime
            };
        }

        // Check if within limit
        if (entry.count < config.maxRequests) {
            entry.count++;
            rateLimitStore.set(key, entry);

            return {
                allowed: true,
                remainingRequests: config.maxRequests - entry.count,
                resetTime: entry.resetTime
            };
        }

        // Rate limit exceeded
        return {
            allowed: false,
            remainingRequests: 0,
            resetTime: entry.resetTime
        };
    }

    // Clean up expired entries
    static cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }

    // Get rate limit info without incrementing
    static getRateLimitInfo(identifier: string, config: RateLimitConfig): {
        remainingRequests: number;
        resetTime: number;
    } {
        const entry = rateLimitStore.get(identifier);
        const now = Date.now();

        if (!entry || now > entry.resetTime) {
            return {
                remainingRequests: config.maxRequests,
                resetTime: now + config.windowMs
            };
        }

        return {
            remainingRequests: Math.max(0, config.maxRequests - entry.count),
            resetTime: entry.resetTime
        };
    }
}

export class PerformanceOptimizer {
    // Debounce function calls
    static debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;

        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // Throttle function calls
    static throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;

        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Image optimization helper
    static optimizeImageUrl(url: string, width?: number, height?: number, quality?: number): string {
        // This would typically integrate with a CDN like Cloudinary, ImageKit, etc.
        // For now, just return the original URL

        const params = new URLSearchParams();
        if (width) params.append('w', width.toString());
        if (height) params.append('h', height.toString());
        if (quality) params.append('q', quality.toString());

        const paramString = params.toString();
        if (paramString) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}${paramString}`;
        }

        return url;
    }

    // Lazy loading helper
    static createIntersectionObserver(
        callback: (entries: IntersectionObserverEntry[]) => void,
        options?: IntersectionObserverInit
    ): IntersectionObserver {
        const defaultOptions: IntersectionObserverInit = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1,
            ...options
        };

        return new IntersectionObserver(callback, defaultOptions);
    }

    // Memory cleanup helper
    static cleanup(items: Array<{ disconnect?: () => void; unsubscribe?: () => void; cleanup?: () => void }>): void {
        items.forEach(item => {
            if (item.disconnect) item.disconnect();
            if (item.unsubscribe) item.unsubscribe();
            if (item.cleanup) item.cleanup();
        });
    }
}

// Rate limiting configurations for different operations
export const rateLimitConfigs = {
    // General API requests
    api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
    } as RateLimitConfig,

    // Authentication attempts
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5
    } as RateLimitConfig,

    // File uploads
    upload: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10
    } as RateLimitConfig,

    // Solution access validation
    solutionAccess: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20
    } as RateLimitConfig,

    // Email sending
    email: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 50
    } as RateLimitConfig
};

// Auto cleanup every 5 minutes
setInterval(() => {
    RateLimiter.cleanup();
}, 5 * 60 * 1000);
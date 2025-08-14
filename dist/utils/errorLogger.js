"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const supabaseClient_1 = __importDefault(require("../routes/supabaseClient"));
class ErrorLogger {
    isTableReady = false;
    constructor() {
        this.ensureTableExists();
    }
    async ensureTableExists() {
        try {
            // Check if ErrorLog table exists by trying to select from it
            const { error } = await supabaseClient_1.default
                .from('error_logs')
                .select('count')
                .limit(1);
            if (error && error.code === 'PGRST106') {
                // Table doesn't exist, create it
                console.log('ErrorLog table not found, creating it...');
                await this.createErrorLogTable();
            }
            else if (!error) {
                console.log('ErrorLog table exists');
                this.isTableReady = true;
            }
        }
        catch (error) {
            console.error('Error checking/creating ErrorLog table:', error);
        }
    }
    async createErrorLogTable() {
        try {
            // Note: This creates the table using Supabase SQL
            // In a real scenario, you might want to use Supabase dashboard or migrations
            const { error } = await supabaseClient_1.default.rpc('create_error_log_table');
            if (error) {
                // If RPC doesn't exist, we'll create via INSERT (which will fail but help us understand)
                console.warn('Could not create table via RPC. Table may need to be created manually in Supabase dashboard.');
                console.log(`
Please create the error_logs table in your Supabase dashboard with this SQL:

CREATE TABLE error_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  source TEXT NOT NULL,
  details JSONB,
  user_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX idx_error_logs_level ON error_logs(level);
CREATE INDEX idx_error_logs_source ON error_logs(source);
        `);
            }
            else {
                console.log('ErrorLog table created successfully');
                this.isTableReady = true;
            }
        }
        catch (error) {
            console.error('Error creating ErrorLog table:', error);
        }
    }
    async waitForTable() {
        let attempts = 0;
        const maxAttempts = 10;
        while (!this.isTableReady && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
    async log(level, message, source, details, req) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level,
                message,
                source,
                details: details ? JSON.stringify(details) : null,
                userId: req?.user?.id || req?.userId || null,
                ipAddress: req?.ip || req?.connection?.remoteAddress || null,
                userAgent: req?.get?.('User-Agent') || null,
            };
            // Try to insert into Supabase
            const { error } = await supabaseClient_1.default
                .from('error_logs')
                .insert([{
                    timestamp: logEntry.timestamp,
                    level: logEntry.level,
                    message: logEntry.message,
                    source: logEntry.source,
                    details: logEntry.details,
                    user_id: logEntry.userId,
                    ip_address: logEntry.ipAddress,
                    user_agent: logEntry.userAgent,
                }]);
            if (error) {
                // Fallback to console logging if Supabase fails
                console.error('Failed to log to Supabase, using console fallback:', error);
                this.consoleLog(level, message, source, details);
            }
        }
        catch (error) {
            // Ultimate fallback to console
            console.error('Error logging failed:', error);
            this.consoleLog(level, message, source, details);
        }
    }
    consoleLog(level, message, source, details) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`;
        switch (level) {
            case 'error':
                console.error(logMessage, details || '');
                break;
            case 'warn':
                console.warn(logMessage, details || '');
                break;
            case 'debug':
                console.debug(logMessage, details || '');
                break;
            default:
                console.log(logMessage, details || '');
        }
    }
    // Convenience methods
    async info(message, source, details, req) {
        return this.log('info', message, source, details, req);
    }
    async warn(message, source, details, req) {
        return this.log('warn', message, source, details, req);
    }
    async error(message, source, details, req) {
        return this.log('error', message, source, details, req);
    }
    async debug(message, source, details, req) {
        return this.log('debug', message, source, details, req);
    }
    // Method to retrieve logs (useful for debugging)
    async getLogs(limit = 100, level, source, startDate, endDate) {
        try {
            let query = supabaseClient_1.default
                .from('error_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);
            if (level) {
                query = query.eq('level', level);
            }
            if (source) {
                query = query.eq('source', source);
            }
            if (startDate) {
                query = query.gte('timestamp', startDate);
            }
            if (endDate) {
                query = query.lte('timestamp', endDate);
            }
            const { data, error } = await query;
            if (error) {
                console.error('Error fetching logs:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error retrieving logs:', error);
            return [];
        }
    }
}
// Export singleton instance
exports.logger = new ErrorLogger();
exports.default = exports.logger;
//# sourceMappingURL=errorLogger.js.map
export interface ErrorLogEntry {
    id?: number;
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    source: string;
    details?: any;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
}
declare class ErrorLogger {
    private isTableReady;
    constructor();
    private ensureTableExists;
    private createErrorLogTable;
    private waitForTable;
    log(level: 'info' | 'warn' | 'error' | 'debug', message: string, source: string, details?: any, req?: any): Promise<void>;
    private consoleLog;
    info(message: string, source: string, details?: any, req?: any): Promise<void>;
    warn(message: string, source: string, details?: any, req?: any): Promise<void>;
    error(message: string, source: string, details?: any, req?: any): Promise<void>;
    debug(message: string, source: string, details?: any, req?: any): Promise<void>;
    getLogs(limit?: number, level?: string, source?: string, startDate?: string, endDate?: string): Promise<ErrorLogEntry[]>;
}
export declare const logger: ErrorLogger;
export default logger;
//# sourceMappingURL=errorLogger.d.ts.map
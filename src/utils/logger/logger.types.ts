/**
 * LogLevel enumeration defines the severity levels for logging.
 * DEBUG   - Detailed debugging information
 * INFO    - Informational messages
 * WARN    - Warnings that may need attention
 * ERROR   - Critical errors that require immediate attention
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

/**
 * Represents a single log entry.
 */
export interface LogEntry {
    timestamp: Date;                      // Timestamp when the log was created
    level: LogLevel;                      // Severity level of the log
    message: string;                      // Log message
    context?: Record<string, unknown>;    // Optional additional context (e.g., variables, request info)
    userId?: string;                      // Optional ID of the user related to the log
    sessionId?: string;                   // Optional session ID
    url?: string;                         // Optional URL associated with the log
    serviceInCharge?: string;             // Optional service or module responsible
}
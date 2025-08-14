# Error Logging System

This application now includes a comprehensive error logging system that logs all errors and messages to a Supabase `error_logs` table.

## Features

- ✅ Automatic table creation in Supabase
- ✅ Multiple log levels: `info`, `warn`, `error`, `debug`
- ✅ Request context tracking (IP, User-Agent, User ID)
- ✅ Structured error details in JSON format
- ✅ Fallback to console logging if Supabase fails

## Setup

### 1. Create the Error Logs Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create error_logs table for logging application errors and messages
CREATE TABLE IF NOT EXISTS error_logs (
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON error_logs(source);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
```

### 2. Usage in Route Files

```typescript
import logger from '../utils/errorLogger';

// In your route handlers:
export const someHandler: RequestHandler = async (req, res) => {
  try {
    // Log info messages
    await logger.info("Processing request", "someHandler", { userId: req.user?.id });
    
    // Your business logic here
    
  } catch (error) {
    // Log errors with request context
    await logger.error("Failed to process request", "someHandler", error, req);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

## Log Levels

- **error**: For exceptions and failures
- **warn**: For warnings and unexpected conditions
- **info**: For general information and successful operations
- **debug**: For detailed debugging information

## Available Methods

```typescript
// Basic logging
await logger.error(message, source, details?, req?);
await logger.warn(message, source, details?, req?);
await logger.info(message, source, details?, req?);
await logger.debug(message, source, details?, req?);

// Generic logging with custom level
await logger.log(level, message, source, details?, req?);

// Retrieve logs (for debugging/monitoring)
const logs = await logger.getLogs(100, 'error', 'expenses');
```

## Table Schema

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| timestamp | TIMESTAMPTZ | When the log occurred |
| level | TEXT | Log level (info, warn, error, debug) |
| message | TEXT | Log message |
| source | TEXT | Source component/function |
| details | JSONB | Additional structured data |
| user_id | TEXT | User identifier (if available) |
| ip_address | INET | Client IP address |
| user_agent | TEXT | Client user agent |
| created_at | TIMESTAMPTZ | When record was created |

## Querying Logs

```sql
-- Get recent error logs
SELECT * FROM error_logs 
WHERE level = 'error' 
ORDER BY timestamp DESC 
LIMIT 50;

-- Get logs for specific source
SELECT * FROM error_logs 
WHERE source LIKE 'expenses%' 
ORDER BY timestamp DESC;

-- Get logs within date range
SELECT * FROM error_logs 
WHERE timestamp >= '2024-01-01' 
AND timestamp < '2024-02-01'
ORDER BY timestamp DESC;
```

## Migration Status

✅ **Completed**:
- Error logging utility created
- Error logs table structure defined
- Initial integration in expenses.ts
- Fallback console logging for failures

⏳ **In Progress**:
- Complete integration across all route files
- Custom error types and structured logging
- Log retention policies
- Monitoring dashboard integration

## Files Cleaned Up

The following unused files have been removed after migration to Supabase:

### Removed JSON Data Files:
- ❌ `src/data/animals.json`
- ❌ `src/data/breeding-records.json`
- ❌ `src/data/categories.json`
- ❌ `src/data/expenses.json`
- ❌ `src/data/health-records.json`
- ❌ `src/data/vaccination-records.json`
- ❌ `src/data/weight-records.json`

### Removed Build Artifacts:
- ❌ `src/shared/*.d.ts`
- ❌ `src/shared/*.js`
- ❌ `src/shared/*.map`

### Removed Scripts:
- ❌ `migrate.cjs` (migration complete)

### Kept Files:
- ✅ `src/data/TaskTracker.json` (still used by test-reminder.ts)
- ✅ `src/shared/*.ts` (source TypeScript files)

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

-- Create a function to help with table creation from the app
CREATE OR REPLACE FUNCTION create_error_log_table()
RETURNS VOID AS $$
BEGIN
  -- This function can be called from the app to ensure table exists
  -- Table creation is handled above, this just provides a callable function
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert a test log entry to verify table is working
INSERT INTO error_logs (level, message, source, details) 
VALUES ('info', 'Error logs table created successfully', 'system', '{"table_created": true, "timestamp": "' || NOW() || '"}');

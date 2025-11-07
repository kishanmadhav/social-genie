-- Create OAuth sessions table for Twitter OAuth persistence
CREATE TABLE IF NOT EXISTS oauth_sessions (
  sid TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient cleanup of expired sessions
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);

-- Grant necessary permissions
ALTER TABLE oauth_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Service role can manage oauth sessions" ON oauth_sessions;

-- Allow the service role to manage sessions
CREATE POLICY "Service role can manage oauth sessions"
ON oauth_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

SELECT 'OAuth sessions table created successfully!' as message;
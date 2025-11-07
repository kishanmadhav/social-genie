-- Create OAuth sessions table for Twitter OAuth persistence
CREATE TABLE IF NOT EXISTS oauth_sessions (
  sid TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient cleanup of expired sessions
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);

-- DISABLE Row Level Security to allow service role full access
ALTER TABLE oauth_sessions DISABLE ROW LEVEL SECURITY;

SELECT 'OAuth sessions table created successfully!' as message;
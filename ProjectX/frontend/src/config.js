// In production, set REACT_APP_BACKEND_URL (e.g. your Render URL) in the host's
// environment variables. Falls back to localhost for local development.
// Trailing slashes are stripped so "https://host/" + "/chat" doesn't become "//chat".
export const backendUrl = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

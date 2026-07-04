const API_BASE_URL = 'http://localhost:8000/api';

// A variable to hold the Clerk getToken function, set by AuthContext
let _getClerkToken: (() => Promise<string | null>) | null = null;

/** Called from AuthContext to inject Clerk's getToken function */
export function setClerkTokenGetter(fn: () => Promise<string | null>) {
  _getClerkToken = fn;
}

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // Get the Clerk session token
  let token: string | null = null;
  if (_getClerkToken) {
    try {
      token = await _getClerkToken();
    } catch {
      // No active session
    }
  }
  
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Set Content-Type only if it's not FormData (fetch handles FormData boundaries automatically)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error('Network error. Is the backend running?');
  }

  if (!response.ok) {
    let errorData: any = {};
    try {
        errorData = await response.json();
    } catch(e) {}
    throw new Error(errorData?.message || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

/** Admin-only: create a new admin or city worker account */
export const createStaffUser = (data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'worker';
}) => fetchApi('/users', { method: 'POST', body: JSON.stringify(data) });

/** Admin-only: fetch all staff users (admins & workers) */
export const fetchStaffUsers = () => fetchApi('/users');

/** Admin-only: delete a staff user */
export const deleteStaffUser = (id: number) =>
  fetchApi(`/users/${id}`, { method: 'DELETE' });

import { User, AmalLog, JournalEntry, CustomAmal, Theme } from '../types';

export interface UserDataPayload {
  amalLog: AmalLog;
  journal: JournalEntry[];
  customAmalan: CustomAmal[];
  user: User;
  theme: Theme;
}

const TOKEN_KEY = 'rezekiq_auth_token';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for resilient local-first

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Koneksi ke server cloud batas waktu habis (timeout). Beralih ke mode lokal.');
      }
      throw err;
    }
  }

  // Health check
  public async checkHealth(): Promise<boolean> {
    try {
      const res = await this.request<{ status: string }>('/api/health');
      return res.status === 'ok';
    } catch {
      return false;
    }
  }

  // Auth: Register
  public async register(payload: {
    email: string;
    password?: string;
    name: string;
    gender: 'Laki-laki' | 'Perempuan';
    phoneNumber?: string;
    initialData?: Partial<UserDataPayload>;
  }): Promise<{ user: User; data: UserDataPayload; token: string }> {
    const res = await this.request<{ user: User; data: UserDataPayload; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  // Auth: Login
  public async login(email: string, password?: string): Promise<{ user: User; data: UserDataPayload; token: string }> {
    const res = await this.request<{ user: User; data: UserDataPayload; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  // Auth: Verify token & get user data
  public async getMe(): Promise<{ user: User; data: UserDataPayload } | null> {
    if (!this.getToken()) return null;
    try {
      return await this.request<{ user: User; data: UserDataPayload }>('/api/auth/me');
    } catch (err) {
      console.warn('Sesi cloud tidak valid atau server offline:', err);
      return null;
    }
  }

  // Sync: Pull latest cloud data
  public async fetchCloudData(): Promise<UserDataPayload | null> {
    if (!this.getToken()) return null;
    const res = await this.request<{ success: boolean; data: UserDataPayload }>('/api/user/sync');
    return res.data;
  }

  // Sync: Push progress data to cloud
  public async pushCloudData(data: UserDataPayload): Promise<UserDataPayload> {
    const res = await this.request<{ success: boolean; data: UserDataPayload }>('/api/user/sync', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  // Logout
  public logout() {
    this.setToken(null);
  }
}

export const apiService = new ApiService();

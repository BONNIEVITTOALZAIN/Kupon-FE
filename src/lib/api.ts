const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchWithAuth(url: string, token: string | null, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Session expired or invalid
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Sesi autentikasi telah berakhir.');
  }

  return res;
}

export const api = {
  // Stats
  async getStats(token: string | null) {
    const res = await fetchWithAuth('/stats', token);
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  // Kupons List
  async getKupons(
    token: string | null,
    params: { page?: number; limit?: number; search?: string; tipe?: string; status?: string } = {}
  ) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.tipe) query.append('tipe', params.tipe);
    if (params.status) query.append('status', params.status);

    const res = await fetchWithAuth(`/kupons?${query.toString()}`, token);
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  // Get Kupon by ID
  async getKuponById(token: string | null, id: string) {
    const res = await fetchWithAuth(`/kupons/${id}`, token);
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  // Create Kupon
  async createKupon(token: string | null, data: { nomor: string; nama?: string; tipe: 'terdaftar' | 'extra' }) {
    const res = await fetchWithAuth('/kupons', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  // Update Kupon
  async updateKupon(
    token: string | null,
    id: string,
    data: { nomor?: string; nama?: string; tipe?: 'terdaftar' | 'extra'; status?: 'belum' | 'sudah' }
  ) {
    const res = await fetchWithAuth(`/kupons/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  },

  // Delete Kupon
  async deleteKupon(token: string | null, id: string) {
    const res = await fetchWithAuth(`/kupons/${id}`, token, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result;
  },

  // Scan QR Code
  async scanKupon(token: string | null, kode: string) {
    const res = await fetchWithAuth('/scan', token, {
      method: 'POST',
      body: JSON.stringify({ kode }),
    });
    const result = await res.json();
    // Return standard validation result even if it's 400 (which is returned for invalid/already scanned)
    return result;
  },

  // Generate PDF URL (returns the direct URL to fetch)
  getPDFUrl(token: string | null, filters: { tipe?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (filters.tipe) query.append('tipe', filters.tipe);
    if (filters.status) query.append('status', filters.status);
    return `${API_URL}/generate-pdf?${query.toString()}&token=${token}`;
  },

  // Export Excel
  async exportExcel(token: string | null, filters: { tipe?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (filters.tipe) query.append('tipe', filters.tipe);
    if (filters.status) query.append('status', filters.status);

    const res = await fetch(`${API_URL}/export-excel?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      throw new Error('Sesi autentikasi telah berakhir.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kupon-qurban.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // User Management
  async getUsers(token: string | null) {
    const res = await fetchWithAuth('/users', token);
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data.users;
  },

  async createUser(token: string | null, data: { email: string; password?: string }) {
    const res = await fetchWithAuth('/users', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data.user;
  },

  async deleteUser(token: string | null, id: string) {
    const res = await fetchWithAuth(`/users/${id}`, token, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result;
  },

  async resetAllKuponsStatus(token: string | null) {
    const res = await fetchWithAuth('/kupons/reset-status', token, {
      method: 'POST',
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result;
  },

  async deleteAllKupons(token: string | null) {
    const res = await fetchWithAuth('/kupons/delete-all', token, {
      method: 'POST',
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result;
  },

  // AI Assistant Chat
  async sendAssistantChat(token: string | null, message: string): Promise<string> {
    const res = await fetchWithAuth('/assistant/chat', token, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    return result.data.reply;
  },
};

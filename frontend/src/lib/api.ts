const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || `HTTP ${response.status} error`;
      }
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Provide more specific error messages
    console.error('API request error:', error);
    
    // Check if it's a network error (backend not running)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      throw new ApiError(
        `Cannot connect to backend server. Please make sure the backend is running on ${baseUrl}. ` +
        `You can start it by running: cd backend-server && npm run dev`,
        0
      );
    }
    
    // Generic network error
    throw new ApiError(
      'Network error occurred. Please check if the backend server is running and try again.',
      0
    );
  }
}

export const api = {
  // Auth endpoints
  async register(email: string, password: string, username?: string) {
    return request<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, organizationName: username }),
    });
  },

  async login(email: string, password: string) {
    return request<{ message: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getUser(userId: number) {
    return request<{ user: any }>(`/auth/user/${userId}`);
  },

  async updateTheme(userId: number, themePreference: 'light' | 'dark') {
    return request<{ user: any }>(`/auth/user/${userId}/theme`, {
      method: 'PATCH',
      body: JSON.stringify({ themePreference }),
    });
  },

  async updatePassword(email: string, newPassword: string) {
    return request<{ message: string; user: any }>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  // Evaluation endpoints
  async createEvaluation(evaluationData: {
    userId: number;
    projectName?: string;
    recommendedTool: string;
    scores: {
      selenium: number;
      playwright: number;
      testim: number;
      mabl: number;
    };
    answers: any[];
  }) {
    return request<{ message: string; evaluation: any }>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    });
  },

  async getEvaluations(userId: number, limit = 50) {
    return request<{ evaluations: any[]; count: number }>(
      `/evaluations/user/${userId}?limit=${limit}`
    );
  },

  async getEvaluation(evaluationId: number) {
    return request<{ evaluation: any }>(`/evaluations/${evaluationId}`);
  },

  async deleteEvaluation(evaluationId: number, userId: number) {
    return request<{ message: string }>(`/evaluations/${evaluationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  },
};

export { ApiError };


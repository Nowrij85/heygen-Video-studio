import axios from 'axios';

export class HeyGenClient {
  private baseURL = '/api/heygen';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private get headers() {
    return {
      'X-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getBalance() {
    const endpoints = [
      '/v2/user/info',
      '/v2/user/remaining_quota',
      '/v1/user.remaining_quota',
      '/v1/user/remaining_quota',
      '/v1/user/info'
    ];
    
    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying balance endpoint: ${endpoint}`);
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          headers: this.headers,
        });
        const data = response.data.data;
        if (data) {
          // Normalize balance data for the UI
          return {
            credits: data.remaining_quota ?? data.remaining_credits ?? data.credits ?? 0,
            type: data.type || (endpoint.includes('v2') ? 'v2 Account' : 'v1 Account')
          };
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`Failed to fetch balance from ${endpoint}:`, error.response?.status || error.message);
      }
    }
    throw lastError || new Error('Could not fetch balance from any known endpoint');
  }

  async testConnection() {
    // Try v2/user/info first as it's the most basic account check
    try {
      const response = await axios.get(`${this.baseURL}/v2/user/info`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      // Fallback to v2/avatars
      const response = await axios.get(`${this.baseURL}/v2/avatars`, {
        headers: this.headers,
      });
      return response.data;
    }
  }

  async getAvatars() {
    const response = await axios.get(`${this.baseURL}/v2/avatars`, {
      headers: this.headers,
    });
    return response.data.data.avatars;
  }

  async getVoices() {
    const response = await axios.get(`${this.baseURL}/v2/voices`, {
      headers: this.headers,
    });
    return response.data.data.voices;
  }

  async getTemplates() {
    const response = await axios.get(`${this.baseURL}/v2/templates`, {
      headers: this.headers,
    });
    return response.data.data.templates;
  }

  async uploadAsset(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${this.baseURL}/v2/assets`, formData, {
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async generateVideo(payload: any) {
    const response = await axios.post(`${this.baseURL}/v2/video/generate`, payload, {
      headers: this.headers,
    });
    return response.data.data;
  }

  async getVideoStatus(videoId: string) {
    const response = await axios.get(`${this.baseURL}/v2/video/status?video_id=${videoId}`, {
      headers: this.headers,
    });
    return response.data.data;
  }

  async deleteVideo(videoId: string) {
    const response = await axios.delete(`${this.baseURL}/v2/video/${videoId}`, {
      headers: this.headers,
    });
    return response.data;
  }
}

export const getHeyGenClient = (apiKey: string) => new HeyGenClient(apiKey);

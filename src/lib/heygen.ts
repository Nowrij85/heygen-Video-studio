import axios from 'axios';

export class HeyGenClient {
  private baseURL = 'https://api.heygen.com';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private get headers() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getBalance() {
    const response = await axios.get(`${this.baseURL}/v1/user/remaining_quota`, {
      headers: this.headers,
    });
    return response.data.data;
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
    const response = await axios.get(`${this.baseURL}/v1/template.list`, {
      headers: this.headers,
    });
    return response.data.data.templates;
  }

  async uploadAsset(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${this.baseURL}/v1/asset.upload`, formData, {
      headers: {
        ...this.headers,
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
    const response = await axios.get(`${this.baseURL}/v1/video_status.get?video_id=${videoId}`, {
      headers: this.headers,
    });
    return response.data.data;
  }

  async deleteVideo(videoId: string) {
    const response = await axios.delete(`${this.baseURL}/v1/video.delete`, {
      headers: this.headers,
      data: { video_id: videoId },
    });
    return response.data;
  }
}

export const getHeyGenClient = (apiKey: string) => new HeyGenClient(apiKey);

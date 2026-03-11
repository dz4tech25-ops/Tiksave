import JSZip from 'jszip';

const API_URL = 'https://www.tikwm.com/api/';

export async function fetchWithTimeout(resource: string, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('err_timeout');
    }
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      throw new Error('err_network');
    }
    throw error;
  }
}

export async function fetchTikTokVideoData(url: string) {
  try {
    const formData = new URLSearchParams();
    formData.append('url', url);

    const response = await fetchWithTimeout(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('err_too_many');
      }
      if (response.status >= 500) {
        throw new Error('err_server');
      }
      throw new Error('err_default');
    }

    const data = await response.json();

    if (data.code !== 0 || !data.data) {
      console.error('API Error Response:', data);
      if (data.msg && data.msg.toLowerCase().includes('not found')) {
        throw new Error('err_not_found');
      }
      if (data.msg && data.msg.toLowerCase().includes('url parsing is failed')) {
        throw new Error('invalid_url');
      }
      throw new Error(data.msg || 'err_default');
    }

    const result = data.data;
    if (!result.play && !result.hdplay && !result.images) {
      throw new Error('err_not_found');
    }

    const videoData: any = {
      originalUrl: url,
      url: result.play,
      hdUrl: result.hdplay,
      title: result.title,
      author: result.author.unique_id,
      thumbnail: result.cover,
      views: result.play_count,
      duration: result.duration,
      musicUrl: result.music
    };

    if (result.images) {
      videoData.isSlideshow = true;
      videoData.images = result.images;
    }

    return videoData;

  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    if (['err_timeout', 'err_network', 'err_too_many', 'err_server', 'err_not_found', 'invalid_url', 'err_default'].includes(error.message)) {
      throw error;
    }
    throw new Error(error.message || 'err_default');
  }
}

export async function forceDownload(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error('err_not_found');
      }
      throw new Error('err_network');
    }
    const data = await response.blob();
    const blobUrl = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error: any) {
    console.error('Download failed:', error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('err_network');
    }
    throw new Error(error.message || 'err_default');
  }
}

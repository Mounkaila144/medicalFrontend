/**
 * Utility function to safely handle file downloads without causing hydration errors
 */
export const downloadFile = (url: string, filename: string) => {
  // Only execute in browser environment
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Utility function to download files from API endpoints with authentication
 */
export const downloadFromApi = async (apiUrl: string, filename: string) => {
  // Only execute in browser environment
  if (typeof window === 'undefined') return;
  
  try {
    // Import tokenManager dynamically to avoid SSR issues
    const { tokenManager } = await import('@/lib/api');
    
    // Get auth token using tokenManager
    const token = tokenManager.getAccessToken();
    
    if (!token) {
      throw new Error('Token d\'authentification non trouvé');
    }
    
    console.log('Downloading with token:', token.substring(0, 20) + '...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Download error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    downloadFile(url, filename);
    
    // Clean up the object URL
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error downloading file from API:', error);
    throw error;
  }
};

/**
 * Utility function to safely handle blob downloads
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  // Only execute in browser environment
  if (typeof window === 'undefined') return;
  
  const url = window.URL.createObjectURL(blob);
  downloadFile(url, filename);
  
  // Clean up the object URL
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
};
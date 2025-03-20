
export const getDeviceInfo = async (): Promise<Record<string, any>> => {
  // Get device info
  let deviceInfo: Record<string, any> = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
  
  let ipAddress = 'unknown';
  
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (response.ok) {
      const data = await response.json();
      ipAddress = data.ip || 'unknown';
      deviceInfo.ip = ipAddress;
    } else {
      console.warn('Could not fetch IP info:', response.statusText);
    }
  } catch (error) {
    console.warn('Could not fetch IP info:', error);
  }
  
  return deviceInfo;
};

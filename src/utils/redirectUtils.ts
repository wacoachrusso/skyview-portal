export const redirectToProduction = () => {
  // Check if it's an Android device
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    // Show app install prompt for Android users
    if (window.confirm('Would you like to install the SkyGuide app?')) {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.skyguide.app';
      return;
    }
  }
  // Redirect to production URL
  window.location.href = 'https://www.skyguide.site';
};
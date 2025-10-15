import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('simplychain_cookie_consent');
    if (cookieConsent) {
      const savedPreferences = JSON.parse(cookieConsent);
      setPreferences(savedPreferences);
      setHasConsent(true);
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem('simplychain_cookie_consent', JSON.stringify(newPreferences));
    localStorage.setItem('simplychain_cookie_consent_date', new Date().toISOString());
    setPreferences(newPreferences);
    setHasConsent(true);
    
    // Apply cookie settings
    applyCookieSettings(newPreferences);
  };

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Analytics cookies (Google Analytics, etc.)
    if (prefs.analytics) {
      // Enable analytics tracking
      console.log('Analytics cookies enabled');
      // Initialize Google Analytics or other analytics tools here
      // Example: gtag('consent', 'update', { 'analytics_storage': 'granted' });
    } else {
      // Disable analytics tracking
      console.log('Analytics cookies disabled');
      // Disable analytics tools here
      // Example: gtag('consent', 'update', { 'analytics_storage': 'denied' });
    }

    // Marketing cookies (Facebook Pixel, Google Ads, etc.)
    if (prefs.marketing) {
      // Enable marketing tracking
      console.log('Marketing cookies enabled');
      // Initialize marketing tools here
      // Example: fbq('consent', 'grant');
    } else {
      // Disable marketing tracking
      console.log('Marketing cookies disabled');
      // Disable marketing tools here
      // Example: fbq('consent', 'revoke');
    }
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    const newPreferences = {
      ...preferences,
      [key]: value
    };
    savePreferences(newPreferences);
  };

  const resetConsent = () => {
    localStorage.removeItem('simplychain_cookie_consent');
    localStorage.removeItem('simplychain_cookie_consent_date');
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    setHasConsent(false);
  };

  return {
    preferences,
    hasConsent,
    acceptAll,
    acceptNecessary,
    updatePreference,
    resetConsent,
    savePreferences,
  };
};
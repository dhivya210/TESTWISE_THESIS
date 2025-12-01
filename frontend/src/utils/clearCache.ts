/**
 * Utility function to clear all cached data from the application
 * This includes:
 * - All sessionStorage items (user data, pending users, etc.)
 * - All localStorage items (user data, evaluations, etc.)
 * - Firebase authentication state
 */
export const clearAllCache = async () => {
  try {
    // Sign out from Firebase if configured
    try {
      const { firebaseAuth } = await import('@/lib/firebaseAuth');
      if (firebaseAuth.isConfigured()) {
        await firebaseAuth.signOutUser();
      }
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
      // Continue with cache clearing even if Firebase signout fails
    }
    
    // Clear all sessionStorage items
    try {
      sessionStorage.removeItem('testwise_user');
      sessionStorage.removeItem('testwise_user_pending');
      sessionStorage.removeItem('resources_selected_tool');
      
      // Clear any other sessionStorage items related to the app
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('testwise_') || key.startsWith('firebase:')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
    
    // Clear all localStorage items
    try {
      localStorage.removeItem('testwise_user');
      localStorage.removeItem('testwise_evaluations');
      
      // Clear any other localStorage items related to the app
      const localKeys = Object.keys(localStorage);
      localKeys.forEach(key => {
        if (key.startsWith('testwise_') || key.startsWith('firebase:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    console.log('All cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

/**
 * Clear only authentication-related cache (user data, passwords, etc.)
 * Keeps evaluation history and other non-sensitive data
 */
export const clearAuthCache = async () => {
  try {
    // Sign out from Firebase if configured
    try {
      const { firebaseAuth } = await import('@/lib/firebaseAuth');
      if (firebaseAuth.isConfigured()) {
        await firebaseAuth.signOutUser();
      }
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
    
    // Clear authentication-related sessionStorage
    sessionStorage.removeItem('testwise_user');
    sessionStorage.removeItem('testwise_user_pending');
    
    // Clear authentication-related localStorage
    localStorage.removeItem('testwise_user');
    
    // Clear any Firebase-related storage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('firebase:')) {
        sessionStorage.removeItem(key);
      }
    });
    
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (key.startsWith('firebase:')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Authentication cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing auth cache:', error);
    return false;
  }
};


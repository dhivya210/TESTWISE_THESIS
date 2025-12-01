// Firebase configuration for email verification only
export const isFirebaseConfigured = (): boolean => {
  try {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    
    return !!(
      apiKey && 
      apiKey !== "your-api-key" &&
      apiKey !== "" &&
      projectId && 
      projectId !== "your-project-id" &&
      projectId !== "" &&
      authDomain &&
      authDomain !== "your-project.firebaseapp.com" &&
      authDomain !== ""
    );
  } catch {
    return false;
  }
};

// Lazy load Firebase modules only when needed
let firebaseApp: any = null;
let firebaseAuth: any = null;
let initializationPromise: Promise<{ app: any; auth: any }> | null = null;

export const initializeFirebase = async (): Promise<{ app: any; auth: any }> => {
  // Return cached instances if already initialized
  if (firebaseApp && firebaseAuth) {
    return { app: firebaseApp, auth: firebaseAuth };
  }

  // Return cached promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Check if Firebase is configured
  if (!isFirebaseConfigured()) {
    return { app: null, auth: null };
  }

  // Initialize Firebase
  initializationPromise = (async () => {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      firebaseApp = initializeApp(firebaseConfig);
      firebaseAuth = getAuth(firebaseApp);
      
      return { app: firebaseApp, auth: firebaseAuth };
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      firebaseApp = null;
      firebaseAuth = null;
      initializationPromise = null;
      return { app: null, auth: null };
    }
  })();

  return initializationPromise;
};

// Export getters
export const getFirebaseApp = () => firebaseApp;
export const getFirebaseAuth = () => firebaseAuth;

// Export for backward compatibility (will be null until initialized)
export const app = firebaseApp;
export const auth = firebaseAuth;
export default app;


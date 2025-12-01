import { isFirebaseConfigured, initializeFirebase } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName?: string | null;
}

export const firebaseAuth = {
  async signUp(email: string, password: string, _displayName?: string): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Email verification is not available.');
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        throw new Error('Firebase authentication is not available.');
      }

      const { createUserWithEmailAndPassword, sendEmailVerification, signOut: firebaseSignOut } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Configure action code settings for email verification
      // This sets the URL where users will be redirected after clicking the verification link
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };

      // Send email verification with action code settings
      await sendEmailVerification(user, actionCodeSettings);

      // IMPORTANT: Sign out the user immediately after sending verification email
      // This ensures they cannot log in until they verify their email
      await firebaseSignOut(auth);

      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
      };
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Firebase signup error details:', {
        code: error.code,
        message: error.message,
        error: error
      });
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please use a different email or try logging in.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password (at least 6 characters).');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password accounts are not enabled in Firebase. Please enable Email/Password authentication in Firebase Console.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.code === 'auth/invalid-api-key') {
        throw new Error('Invalid Firebase API key. Please check your .env file and Firebase configuration.');
      } else if (error.code === 'auth/app-not-authorized') {
        throw new Error('Firebase app is not authorized. Please check your Firebase configuration and authorized domains.');
      }
      
      // For unknown errors, include the error code and message
      const errorDetails = error.code ? ` (${error.code})` : '';
      throw new Error(`${error.message || 'Failed to create account'}${errorDetails}`);
    }
  },

  async checkEmailVerification(email: string): Promise<boolean> {
    if (!isFirebaseConfigured()) {
      // If Firebase is not configured, assume email is verified (fallback mode)
      return true;
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        return true; // Fallback: assume verified
      }

      const { fetchSignInMethodsForEmail } = await import('firebase/auth');
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length === 0) {
        return false; // User doesn't exist
      }

      // Check if current user is verified
      if (auth.currentUser) {
        return auth.currentUser.emailVerified;
      }

      // We can't check verification status without signing in
      // This is a limitation - we'll check during login
      return false;
    } catch (error: any) {
      console.error('Error checking email verification:', error);
      return false;
    }
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up Firebase for email verification.');
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        throw new Error('Firebase authentication is not available.');
      }

      const { signInWithEmailAndPassword, signOut: firebaseSignOut, reload } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // IMPORTANT: Reload user to get the latest email verification status
      // This ensures we have the most up-to-date verification status after clicking the link
      try {
        await reload(user);
        console.log('✅ User auth state reloaded - emailVerified:', user.emailVerified);
      } catch (reloadError: any) {
        console.warn('⚠️ Could not reload user (may already be up to date):', reloadError);
        // If reload fails, it might be because the user is already up to date
        // But we should still check the current status
      }

      // Double-check: Get fresh user data after reload
      // Sometimes the user object doesn't update immediately, so we check auth.currentUser
      const currentUser = auth.currentUser;
      const isVerified = currentUser?.emailVerified ?? user.emailVerified;
      
      console.log('📧 Email verification check:', {
        userEmailVerified: user.emailVerified,
        currentUserEmailVerified: currentUser?.emailVerified,
        finalIsVerified: isVerified
      });

      // Check if email is verified (after reload)
      if (!isVerified) {
        await firebaseSignOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link and click it to verify your account. If you just verified, wait a few seconds and try again.');
      }

      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
      };
    } catch (error: any) {
      // Preserve the original error with code
      const err = new Error(error.message || 'Failed to sign in');
      (err as any).code = error.code;
      throw err;
    }
  },

  async signOutUser(): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        return;
      }

      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  },

  async resendVerificationEmail(email: string, password: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Email verification is not available.');
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        throw new Error('Firebase authentication is not available.');
      }

      const { signInWithEmailAndPassword, sendEmailVerification, signOut: firebaseSignOut } = await import('firebase/auth');
      
      // Sign in to get the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if already verified
      if (user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error('Your email is already verified. You can log in now.');
      }

      // Configure action code settings for email verification
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };

      // Send verification email with action code settings
      await sendEmailVerification(user, actionCodeSettings);
      
      // Sign out after sending email
      await firebaseSignOut(auth);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please check your credentials.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please wait a few minutes before requesting another verification email.');
      }
      throw new Error(error.message || 'Failed to resend verification email');
    }
  },

  async checkAuthState(): Promise<AuthUser | null> {
    if (!isFirebaseConfigured()) {
      return null;
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        return null;
      }

      const { onAuthStateChanged } = await import('firebase/auth');
      
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) {
            resolve({
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              displayName: user.displayName,
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error: any) {
      console.error('Error checking auth state:', error);
      return null;
    }
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Password reset is not available.');
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        throw new Error('Firebase authentication is not available.');
      }

      const { sendPasswordResetEmail } = await import('firebase/auth');
      
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please wait a few minutes before requesting another password reset email.');
      }
      throw new Error(error.message || 'Failed to send password reset email');
    }
  },

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Password reset is not available.');
    }

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        throw new Error('Firebase authentication is not available.');
      }

      const { confirmPasswordReset } = await import('firebase/auth');
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error: any) {
      if (error.code === 'auth/expired-action-code') {
        throw new Error('The password reset link has expired. Please request a new password reset email.');
      } else if (error.code === 'auth/invalid-action-code') {
        throw new Error('The password reset link is invalid or has already been used. Please request a new password reset email.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      }
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  isConfigured(): boolean {
    return isFirebaseConfigured();
  },
};


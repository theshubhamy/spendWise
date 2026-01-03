/**
 * Authentication Service using Firebase
 * Handles Google Sign-In via Firebase Authentication
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { Storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

export interface User {
  id: string;
  email?: string;
  name?: string;
  photoURL?: string;
  createdAt: string;
}

class AuthService {
  private currentUser: User | null = null;

  /**
   * Initialize authentication service
   */
  async initialize(): Promise<void> {
    // Configure Google Sign-In
    // Get the web client ID from google-services.json or environment
    // For now, using the Android client ID - you may need to create a Web Client ID
    GoogleSignin.configure({
      webClientId: '725873219178-vuipdaael5avk4fnlq6420knrfpe7uhh.apps.googleusercontent.com', // Your Android Client ID
      offlineAccess: true,
    });

    // Listen for auth state changes
    auth().onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        await this.loadUserFromFirebaseUser(firebaseUser);
      } else {
        this.currentUser = null;
        Storage.delete(STORAGE_KEYS.USER_ID);
        Storage.delete(STORAGE_KEYS.USER_EMAIL);
        Storage.delete(STORAGE_KEYS.ACCESS_TOKEN);
        Storage.delete(STORAGE_KEYS.REFRESH_TOKEN);
      }
    });

    // Check for existing session
    const firebaseUser = auth().currentUser;
    if (firebaseUser) {
      await this.loadUserFromFirebaseUser(firebaseUser);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // Check if Google Play Services are available (Android)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Get the user's ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      if (!userCredential.user) {
        throw new Error('Failed to sign in with Google');
      }

      await this.loadUserFromFirebaseUser(userCredential.user);
      return this.currentUser!;
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with a different sign-in method');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid credential. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection.');
      }

      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      // Sign out from Google
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }

      // Sign out from Firebase
      await auth().signOut();

      this.currentUser = null;
      Storage.delete(STORAGE_KEYS.USER_ID);
      Storage.delete(STORAGE_KEYS.USER_EMAIL);
      Storage.delete(STORAGE_KEYS.ACCESS_TOKEN);
      Storage.delete(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && auth().currentUser !== null;
  }

  /**
   * Get Firebase auth token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const user = auth().currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Load user from Firebase user object
   */
  private async loadUserFromFirebaseUser(firebaseUser: FirebaseAuthTypes.User): Promise<void> {
    const token = await firebaseUser.getIdToken();

    this.currentUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      name: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };

    // Store user info
    Storage.setString(STORAGE_KEYS.USER_ID, firebaseUser.uid);
    if (firebaseUser.email) {
      Storage.setString(STORAGE_KEYS.USER_EMAIL, firebaseUser.email);
    }
    if (token) {
      Storage.setString(STORAGE_KEYS.ACCESS_TOKEN, token);
    }
  }
}

export const authService = new AuthService();


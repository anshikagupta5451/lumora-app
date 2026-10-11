import { Platform } from 'react-native'
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  isCancelledResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'

// Google Play Services' CommonStatusCodes.DEVELOPER_ERROR. Android reports it
// when no Android OAuth client matches this app's package name + signing
// SHA-1 in the same Google Cloud project as the web client ID below.
// See docs/GOOGLE_SIGN_IN.md.
const ANDROID_DEVELOPER_ERROR = '10'

let configured = false

function ensureConfigured() {
  if (configured) return

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  if (!webClientId) {
    throw new Error('Google sign-in is not configured')
  }

  GoogleSignin.configure({ webClientId, offlineAccess: false })
  configured = true
}

// Turns native sign-in failures into messages fit for a toast. The raw error
// is kept in dev logs, since "DEVELOPER_ERROR" means nothing to a user but
// everything to whoever is debugging the OAuth setup.
function toUserFacingError(err: unknown): Error {
  if (!isErrorWithCode(err)) {
    return err instanceof Error ? err : new Error('Google sign-in failed')
  }

  switch (err.code) {
    case statusCodes.IN_PROGRESS:
      return new Error('Google sign-in is already in progress')
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return new Error('Google Play Services is missing or out of date')
    case ANDROID_DEVELOPER_ERROR:
      if (__DEV__) {
        console.warn(
          '[googleAuth] DEVELOPER_ERROR: this build\'s package name / SHA-1 is not ' +
            'registered as an Android OAuth client in the Google Cloud project that ' +
            'owns EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. See docs/GOOGLE_SIGN_IN.md.',
        )
      }
      return new Error('Google sign-in is temporarily unavailable. Please use email instead.')
    default:
      if (__DEV__) console.warn('[googleAuth] sign-in failed', err.code, err.message)
      return new Error('Google sign-in failed. Please try again.')
  }
}

// Returns the Google ID token to send to the backend, or null if the user
// cancelled the flow. Native-only — there is no web build of this package.
export async function signInWithGoogle(): Promise<string | null> {
  if (Platform.OS === 'web') {
    throw new Error('Google sign-in is available in the mobile app only')
  }

  try {
    ensureConfigured()
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    const response = await GoogleSignin.signIn()

    if (isCancelledResponse(response)) {
      return null
    }
    if (isSuccessResponse(response) && response.data.idToken) {
      return response.data.idToken
    }
    throw new Error('Could not sign in with Google')
  } catch (err) {
    throw toUserFacingError(err)
  }
}

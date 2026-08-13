import { Strings } from "@/constants/Strings";
import {
  confirmPasswordReset,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * The single entry point for the "forgot password" flow. Everything that offers
 * a password reset should call `sendPasswordReset` rather than talking to
 * `firebase/auth` directly, so the wording and the enumeration behaviour below
 * stay consistent everywhere.
 *
 * Why it has to be an emailed link
 * --------------------------------
 * Firebase Auth exposes no "verify a code, then set a password" primitive. For
 * a user who is *signed out*, resetting a password is only possible with the
 * `oobCode` that Firebase mails out — `updatePassword` requires a live session
 * (that path is the signed-in "Change Password" screen, which goes through
 * `changePasswordAsync` and reauthenticates first). An in-app OTP flow would
 * mean a Cloud Function generating and storing codes plus the Admin SDK's
 * `updateUser`, i.e. a hand-rolled credential reset — not worth owning.
 *
 * Why no ActionCodeSettings
 * -------------------------
 * `sendPasswordResetEmail` accepts a continue URL, and the `android` / `iOS`
 * fields used to make that URL reopen the app — but that behaviour was built on
 * Firebase Dynamic Links, which has been shut down. A continue URL would now
 * only bounce the user to a web page (and its domain has to be on the
 * Authentication -> Settings -> Authorized domains list first). So we send the
 * plain email: the link opens Firebase's hosted reset page, the user sets the
 * password there and reopens Meal Cart themselves. Brand that page's copy via
 * Authentication -> Templates -> Password reset.
 */

/** Firebase rejects nothing on case, but stored emails are lowercased at sign-up. */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface PasswordResetResult {
  success: boolean;
  message: string;
}

/**
 * Mails a password reset link.
 *
 * Deliberately reports success for an unknown address. Saying "no account with
 * that email" turns the form into an account-existence oracle, and it is also
 * dead code on this project: with email enumeration protection enabled (the
 * default) Firebase resolves rather than throwing `auth/user-not-found`, so the
 * old branch could not fire anyway. Rate limiting and malformed input are still
 * reported, since those are the user's own request failing rather than a
 * statement about somebody else's account.
 */
export const sendPasswordReset = async (
  email: string,
): Promise<PasswordResetResult> => {
  try {
    await sendPasswordResetEmail(auth, normalizeEmail(email));
    return { success: true, message: Strings.resetPassword_linkSent };
  } catch (error: any) {
    switch (error?.code) {
      case "auth/user-not-found":
        return { success: true, message: Strings.resetPassword_linkSent };
      case "auth/invalid-email":
        return { success: false, message: Strings.resetPassword_invalidEmail };
      case "auth/too-many-requests":
        return { success: false, message: Strings.tooManyAttempts };
      case "auth/network-request-failed":
        return { success: false, message: Strings.resetPassword_networkError };
      default:
        return {
          success: false,
          message: error?.message || Strings.resetPassword_sendFailed,
        };
    }
  }
};

/**
 * Completes a reset from the `oobCode` in the emailed link.
 *
 * Unused while the link opens Firebase's hosted page — it exists for the
 * alternative setup where a custom action URL deep-links back into the app and
 * `NewPassword` collects the password instead. See the ActionCodeSettings note
 * above for what that setup costs.
 */
export const completePasswordReset = async (
  oobCode: string,
  newPassword: string,
): Promise<PasswordResetResult> => {
  if (!oobCode) {
    return { success: false, message: Strings.resetPassword_linkInvalid };
  }

  try {
    // Fail on a stale link before touching the password, so an expired code
    // reads as "request a new link" rather than a generic update failure.
    await verifyPasswordResetCode(auth, oobCode);
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true, message: Strings.newPassword_success };
  } catch (error: any) {
    switch (error?.code) {
      case "auth/expired-action-code":
      case "auth/invalid-action-code":
        return { success: false, message: Strings.resetPassword_linkInvalid };
      case "auth/weak-password":
        return { success: false, message: Strings.resetPassword_weakPassword };
      case "auth/user-disabled":
        return { success: false, message: "User account is disabled" };
      default:
        return {
          success: false,
          message: error?.message || Strings.newPassword_updateFailed,
        };
    }
  }
};

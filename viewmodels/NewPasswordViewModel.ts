import { completePasswordReset } from "@/services/passwordReset";
import { newPasswordValidationSchema } from "@/utils/validators/AuthValidators";
import * as yup from "yup";

export interface NewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export class NewPasswordViewModel {
  validationSchema = newPasswordValidationSchema;

  constructor() {}

  /**
   * Sets a new password from the `oobCode` in a reset email.
   *
   * The `oobCode` is not optional: Firebase has no way to change a signed-out
   * user's password without it. This previously returned
   * `{ success: true, message: "Password changed successfully" }` from a `TODO`
   * stub, so the screen showed a success toast and sent the user to sign in with
   * a password that had never been saved. Missing code now fails loudly.
   */
  async handleNewPassword(
    values: NewPasswordFormValues,
    oobCode: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof yup.ValidationError
            ? error.errors[0] || "Validation failed"
            : "Validation failed",
      };
    }

    return completePasswordReset(oobCode, values.password);
  }

  async validateField(
    fieldName: string,
    value: string,
  ): Promise<string | undefined> {
    try {
      const fieldSchema = yup.reach(this.validationSchema, fieldName);
      await (fieldSchema as any).validate(value);
      return undefined;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return error.message;
      }
      return "Invalid input";
    }
  }
}

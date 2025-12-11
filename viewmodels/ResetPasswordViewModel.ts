import { resetPasswordValidationSchema } from '@/utils/validators/authValidators';
import * as yup from 'yup';

export interface ResetPasswordFormValues {
  email: string;
}

export class ResetPasswordViewModel {
  validationSchema = resetPasswordValidationSchema;

  constructor() {}

  async handleResetPassword(values: ResetPasswordFormValues): Promise<{ success: boolean; message: string }> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });

      // TODO: Call API to send reset password email
      console.log('Reset password attempt:', {
        email: values.email,
      });

      return {
        success: true,
        message: 'Reset password email sent successfully',
      };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return {
          success: false,
          message: error.errors[0] || 'Validation failed',
        };
      }
      return {
        success: false,
        message: 'Failed to send reset password email',
      };
    }
  }

  async validateField(fieldName: string, value: string): Promise<string | undefined> {
    try {
      const fieldSchema = yup.reach(this.validationSchema, fieldName);
      await (fieldSchema as any).validate(value);
      return undefined;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return error.message;
      }
      return 'Invalid input';
    }
  }
}

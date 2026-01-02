import { newPasswordValidationSchema } from '@/utils/validators/AuthValidators';
import * as yup from 'yup';

export interface NewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export class NewPasswordViewModel {
  validationSchema = newPasswordValidationSchema;

  constructor() { }

  async handleNewPassword(values: NewPasswordFormValues): Promise<{ success: boolean; message: string }> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });

      // TODO: Call API to set new password
      console.log('New password set attempt');

      return {
        success: true,
        message: 'Password changed successfully',
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
        message: 'Failed to change password',
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

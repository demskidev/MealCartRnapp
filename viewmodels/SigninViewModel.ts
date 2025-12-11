import { signinValidationSchema } from '@/utils/validators/AuthValidators';
import * as yup from 'yup';

export interface SigninFormValues {
  email: string;
  password: string;
}

export class SigninViewModel {
  validationSchema = signinValidationSchema;

  constructor() {}

  async handleSignin(values: SigninFormValues): Promise<{ success: boolean; message: string }> {
    try {
      // Validate using schema
      await this.validationSchema.validate(values, { abortEarly: false });

      // TODO: Call API to authenticate user
      console.log('Signin attempt:', {
        email: values.email,
      });

      // Simulate API call
      return {
        success: true,
        message: 'Signin successful',
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
        message: 'Signin failed',
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

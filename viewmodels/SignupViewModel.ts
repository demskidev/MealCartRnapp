import { signupValidationSchema } from '@/utils/validators/AuthValidators';
import * as yup from 'yup';

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class SignupViewModel {
  validationSchema = signupValidationSchema;

  constructor() {}

  async handleSignup(values: SignupFormValues): Promise<{ success: boolean; message: string }> {
    try {
      // Validate using schema
      await this.validationSchema.validate(values, { abortEarly: false });

      // TODO: Call API to register user
      console.log('Signup attempt:', {
        name: values.name,
        email: values.email,
      });

      // Simulate API call
      return {
        success: true,
        message: 'Signup successful',
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
        message: 'Signup failed',
      };
    }
  }

  // Field validation is handled by Formik
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

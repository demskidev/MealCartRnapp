import { useAppDispatch } from '@/reduxStore/hooks';
import { registerAsync } from '@/reduxStore/slices/authSlice';
import * as yup from 'yup';

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class SignupViewModel {
  validationSchema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm password is required"),
  });

  dispatch = useAppDispatch();

  // async handleSignup(values: SignupFormValues): Promise<{ success: boolean; message: string }> {
  //   try {
  //     // Validate using schema
  //     await this.validationSchema.validate(values, { abortEarly: false });

  //     // TODO: Call API to register user
  //     console.log('Signup attempt:', {
  //       name: values.name,
  //       email: values.email,
  //     });

  //     // Simulate API call
  //     return {
  //       success: true,
  //       message: 'Signup successful',
  //     };
  //   } catch (error) {
  //     if (error instanceof yup.ValidationError) {
  //       return {
  //         success: false,
  //         message: error.errors[0] || 'Validation failed',
  //       };
  //     }
  //     return {
  //       success: false,
  //       message: 'Signup failed',
  //     };
  //   }
  // }

  // Field validation is handled by Formik


  async handleSignup(
    values: SignupFormValues,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });
      const resultAction = await this.dispatch(registerAsync({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        name: values.name,
      }));
      if (registerAsync.fulfilled.match(resultAction)) {
        onSuccess?.(resultAction.payload);
      } else {
        onError?.(resultAction.payload as string);
      }
    } catch (error: any) {
      onError?.(error.message || 'Validation error');
      console.log('Validation error:', error);
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

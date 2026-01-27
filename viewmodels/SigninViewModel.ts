import { useAppDispatch } from '@/reduxStore/hooks';
import { loadUserByUidAsync, loginAsync } from '@/reduxStore/slices/authSlice';
import { signinValidationSchema } from '@/utils/validators/AuthValidators';
import * as yup from 'yup';
export interface SigninFormValues {
  email: string;
  password: string;
}

export class SigninViewModel {
  validationSchema = signinValidationSchema;
  dispatch = useAppDispatch();

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


  async handleSignin(
    values: SigninFormValues,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });
      const resultAction = await this.dispatch(loginAsync({ email: values.email.trim().toLowerCase(), password: values.password }));
      if (loginAsync.fulfilled.match(resultAction)) {
        onSuccess?.(resultAction.payload);
      } else {
        onError?.(resultAction.payload as string);
      }
    } catch (error: any) {
      onError?.(error.message || 'Validation error');
    }
  }

  async loadUserData(
    uid: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const resultAction = await this.dispatch(loadUserByUidAsync(uid));
      if (loadUserByUidAsync.fulfilled.match(resultAction)) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: resultAction.payload as string 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to load user data' 
      };
    }
  }

}



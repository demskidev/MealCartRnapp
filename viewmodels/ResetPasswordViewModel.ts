import { resetPasswordValidationSchema } from '@/utils/validators/AuthValidators';
import { sendPasswordResetEmail } from 'firebase/auth';
import * as yup from 'yup';
import { auth } from "../services/firebase";
// import { useDispatch, useSelector } from "react-redux";
// import { changePasswordAsync } from "@/store/slices/authSlice";
// import { RootState, AppDispatch } from "@/store";
// import { changePasswordAsync } from "@/store/slices/authSlice";
// import { RootState, AppDispatch } from "@/store";



export interface ResetPasswordFormValues {
  email: string;
}

export class ResetPasswordViewModel {
  validationSchema = resetPasswordValidationSchema;

  constructor() { }

  // async handleResetPassword(values: ResetPasswordFormValues): Promise<{ success: boolean; message: string }> {
  //   try {
  //     await this.validationSchema.validate(values, { abortEarly: false });

  //     // TODO: Call API to send reset password email
  //     console.log('Reset password attempt:', {
  //       email: values.email,
  //     });

  //     return {
  //       success: true,
  //       message: 'Reset password email sent successfully',
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
  //       message: 'Failed to send reset password email',
  //     };
  //   }
  // }

  async handleResetPassword(values: ResetPasswordFormValues): Promise<{ success: boolean; message: string }> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });

      const email = values.email.trim().toLowerCase();

      await sendPasswordResetEmail(auth, email);

      console.log('Password reset email sent to:', email);

      return {
        success: true,
        message: 'Reset password email sent successfully',
      };
    } catch (error: any) {
      console.error('Error sending reset password email:', error);

      let errorMessage = 'Failed to send reset password email';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format';
      }

      if (error instanceof yup.ValidationError) {
        errorMessage = error.errors[0] || 'Validation failed';
      }

      return {
        success: false,
        message: errorMessage,
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

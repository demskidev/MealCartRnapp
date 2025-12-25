import { signinValidationSchema } from '@/utils/validators/AuthValidators';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import * as yup from 'yup';
import { auth, db } from "../firebase";
export interface SigninFormValues {
  email: string;
  password: string;
}

export class SigninViewModel {
  validationSchema = signinValidationSchema;

  constructor() { }

  // async handleSignin(values: SigninFormValues): Promise<{ success: boolean; message: string }> {
  //   try {
  //     // Validate using schema
  //     await this.validationSchema.validate(values, { abortEarly: false });

  //     // TODO: Call API to authenticate user
  //     console.log('Signin attempt:', {
  //       email: values.email,
  //     });

  //     // Simulate API call
  //     return {
  //       success: true,
  //       message: 'Signin successful',
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
  //       message: 'Signin failed',
  //     };
  //   }
  // }

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


  async handleSignin(values: SigninFormValues): Promise<{ success: boolean; message: string }> {
    console.log('handleSignin called with values:', values);

    try {
      await this.validationSchema.validate(values, { abortEarly: false });

      const email = values.email.trim().toLowerCase();

      const userCredential = await signInWithEmailAndPassword(auth, email, values.password);
      console.log("Firebase signed-in user:", userCredential.user);

      if (userCredential.user) {
        const userUid = userCredential.user.uid;
        console.log("Authenticated user UID:", userUid);

        const userDocRef = doc(db, "users", userUid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (!userDocSnapshot.exists()) {
          console.log("No user found in Firestore with UID:", userUid);
          return { success: false, message: "User is not registered in the database" }; // User not found in Firestore
        }

        console.log("User data found in Firestore:", userDocSnapshot.data());

        return { success: true, message: "Signin successful" };
      } else {
        console.log("User sign-in failed (userCredential.user is null)");
        return { success: false, message: "Signin failed" };
      }

    } catch (error: any) {
      let errorMessage = "Signin failed";

      if (error.code === "auth/user-not-found") errorMessage = "User not found";
      else if (error.code === "auth/wrong-password") errorMessage = "Incorrect password";
      else if (error.code === "auth/invalid-email") errorMessage = "Invalid email address";

      if (error instanceof yup.ValidationError) errorMessage = error.errors[0] || "Validation failed";

      console.log("Error during signin:", error);

      return { success: false, message: errorMessage };
    }
  }

}
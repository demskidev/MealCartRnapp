import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import * as yup from 'yup';
import { auth, db } from "../firebase";

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

  constructor() { }

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


  async handleSignup(values: SignupFormValues): Promise<{ success: boolean; message: string }> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email: values.email,
        name: values.name,
        createdAt: new Date(),
      });

      return { success: true, message: "Signup successful" };
    } catch (error: any) {
      let errorMessage = "Signup failed";
      if (error.code === "auth/email-already-in-use") errorMessage = "Email already in use";
      if (error.code === "auth/invalid-email") errorMessage = "Invalid email address";
      if (error.code === "auth/weak-password") errorMessage = "Password should be at least 6 characters";
      if (error instanceof yup.ValidationError) errorMessage = error.errors[0] || "Validation failed";

      return { success: false, message: errorMessage };
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

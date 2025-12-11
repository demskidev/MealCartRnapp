# MealCart App - Quick Reference Guide

## 🎯 Project Overview

**Architecture**: MVVM (Model-View-ViewModel)
**Framework**: React Native + Expo Router
**Form Management**: Formik + Yup
**Styling**: Custom theme system
**State Management**: React Context (Auth)

---

## 📁 Directory Structure

```
MealCartRnapp/
├── app/                          # Expo Router entry point
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry screen
│   ├── screens/                 # Authentication screens
│   │   ├── first_screen.tsx
│   │   ├── sign_up.tsx
│   │   ├── sign_in.tsx
│   │   ├── reset_password.tsx
│   │   ├── verify_otp.tsx
│   │   └── new_password.tsx
│   └── (tabs)/                  # Bottom tab navigator
│       ├── _layout.tsx
│       ├── home_screen.tsx
│       ├── meals.tsx
│       ├── plans.tsx
│       └── lists.tsx
├── components/                   # Reusable UI components
│   ├── BaseTextInput.tsx        # Text input with error support
│   ├── BaseButton.tsx           # Button with loading state
│   ├── BaseDropdown.tsx         # Searchable dropdown
│   ├── BaseOTPField.tsx         # OTP 6-digit input
│   ├── Header.tsx
│   ├── Divider.tsx
│   ├── AuthFooter.tsx
│   └── BackButton.tsx
├── viewmodels/                   # MVVM business logic
│   ├── SignupViewModel.ts
│   ├── SigninViewModel.ts
│   ├── OTPViewModel.ts
│   ├── ResetPasswordViewModel.ts
│   └── NewPasswordViewModel.ts
├── models/                       # Data models
│   └── User.ts
├── utils/                        # Utility functions
│   └── validators/
│       └── authValidators.ts    # Yup validation schemas
├── constants/                    # App constants
│   ├── theme.ts                 # Colors, fonts
│   ├── strings.ts               # Localization strings
│   ├── constants.ts             # Scale utilities
│   └── appRoutes.ts             # Route definitions
├── context/                      # React Context
│   └── AuthContext.tsx          # Authentication context
├── navigation/                   # Navigation setup (Expo Router)
│   ├── root_navigator.tsx
│   ├── auth_navigator.tsx
│   └── app_navigator.tsx
└── assets/                       # Images, fonts, SVGs
    ├── images/
    ├── fonts/
    └── svg/
```

---

## 🛠️ Available Commands

```bash
# Start development server
npm start

# iOS simulator
npm run ios

# Android emulator
npm run android

# Web browser
npm run web

# Run linting
npm run lint

# Reset project (clear cache)
npm run reset-project
```

---

## 🔐 Authentication Flow

### Sign Up Process
1. User enters: name, email, password, confirm password
2. Formik validates using `signupValidationSchema`
3. `SignupViewModel.handleSignup()` processes
4. Navigate to OTP verification
5. User enters 6-digit OTP
6. Navigate to password reset confirmation
7. User logs in

### Sign In Process
1. User enters: email, password
2. Formik validates using `signinValidationSchema`
3. `SigninViewModel.handleSignin()` processes
4. Update `AuthContext` to set `isAuthenticated = true`
5. Navigate to home tab screen

### Password Reset
1. User enters email
2. `ResetPasswordViewModel` sends reset code
3. Navigate to OTP verification with email param
4. Verify OTP
5. Set new password using `NewPasswordViewModel`

---

## 📝 Form Validation Rules

### Email
- Must be valid email format
- Pattern: `^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i`

### Password
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Example: `Pass@123`

### Confirm Password
- Must match password field exactly

### Name
- Minimum 2 characters
- Maximum 50 characters

### OTP
- Exactly 6 digits
- Numeric only

---

## 🎨 Theming

### Colors (constants/theme.ts)
```typescript
export const Colors = {
  text: "#08120F",
  secondaryText: '#696F77',
  background: '#fff',
  primary: "#9DAF89",        // Main brand color
  lightGray: "#F5F5F5",
  error: '#ED1717',
  // ... more colors
};
```

### Using Colors
```tsx
import { Colors } from "@/constants/theme";

<View style={{ backgroundColor: Colors.background }}>
  <Text style={{ color: Colors.text }}>Hello</Text>
</View>
```

---

## 🧩 Component Usage

### BaseTextInput
```tsx
<BaseTextInput
  value={value}
  onChangeText={setValue}
  placeholder="Enter text"
  keyboardType="email-address"
  error={errorMessage}
  onBlur={() => {}}
/>
```

### BaseButton
```tsx
<BaseButton
  title="Submit"
  onPress={handleSubmit}
  gradientButton={true}
  textColor={Colors.white}
  disabled={isLoading}
/>
```

### BaseDropdown
```tsx
<BaseDropdown
  label="Category"
  placeholder="Select..."
  data={[
    { key: "1", value: "Breakfast" },
    { key: "2", value: "Lunch" },
  ]}
  value={selectedValue}
  onSelect={setSelectedValue}
  error={errorMsg}
/>
```

### BaseOTPField
```tsx
<BaseOTPField
  value={otp}
  onChange={setOtp}
  error={errorMsg}
/>
```

---

## 🔄 MVVM Pattern Example

### ViewModel
```typescript
export class SignupViewModel {
  validationSchema = signupValidationSchema;
  
  async handleSignup(values: SignupFormValues) {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });
      // Call API
      return { success: true, message: "Signup successful" };
    } catch (error) {
      return { success: false, message: "Validation failed" };
    }
  }
}
```

### View Component
```tsx
const SignupScreen = () => {
  const viewModel = new SignupViewModel();
  
  return (
    <Formik
      validationSchema={viewModel.validationSchema}
      onSubmit={(values) => viewModel.handleSignup(values)}
    >
      {/* Form JSX */}
    </Formik>
  );
};
```

---

## 🧠 State Management

### Authentication Context
```tsx
// Get auth state
const { isAuthenticated, login, logout } = useAuth();

// Update auth state
login("auth_token_here");  // Sets isAuthenticated = true
logout();                  // Sets isAuthenticated = false
```

### Navigation Based on Auth
```tsx
// In root_navigator.tsx
const RootNavigator = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};
```

---

## 🚀 Adding New Screens

### 1. Create Screen File
```tsx
// app/screens/my_screen.tsx
import React from "react";
import { View, Text } from "react-native";

const MyScreen = () => {
  return (
    <View>
      <Text>My Screen</Text>
    </View>
  );
};

export default MyScreen;
```

### 2. Add Route
```tsx
// constants/appRoutes.ts
export const APP_ROUTES = {
  // ...
  MY_SCREEN: "/screens/my_screen",
};
```

### 3. Register in Navigator
```tsx
// navigation/auth_navigator.tsx
<Stack.Screen name="my_screen" options={{ headerShown: false }} />
```

---

## 🛠️ Creating New ViewModels

```typescript
import { myValidationSchema } from '@/utils/validators/myValidators';
import * as yup from 'yup';

export interface MyFormValues {
  field1: string;
  field2: string;
}

export class MyViewModel {
  validationSchema = myValidationSchema;

  async handleSubmit(values: MyFormValues): Promise<{ success: boolean; message: string }> {
    try {
      await this.validationSchema.validate(values, { abortEarly: false });
      // TODO: Call API
      return { success: true, message: "Success" };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return { success: false, message: error.errors[0] };
      }
      return { success: false, message: "Error" };
    }
  }
}
```

---

## 📦 Dependencies

- **expo-router**: File-based routing
- **formik**: Form state management
- **yup**: Schema validation
- **react-native-dropdown-select-list**: Dropdown component
- **@react-native-async-storage/async-storage**: Local storage
- **@expo/vector-icons**: Icon library
- **react-native-safe-area-context**: Safe area support
- **react-native-reanimated**: Animations

---

## 🔗 Navigation

### Type-Safe Routing
```tsx
import { APP_ROUTES } from "@/constants/appRoutes";
import { useRouter } from "expo-router";

const router = useRouter();

// Navigate
router.push(APP_ROUTES.SIGNIN);

// Replace (remove from stack)
router.replace(APP_ROUTES.HOME);

// Go back
router.back();
```

---

## ⚡ Performance Tips

1. **Memoize Components**
   - Use `React.memo()` for list items
   - Use `useMemo()` for expensive calculations

2. **Lazy Loading**
   - Use dynamic imports for large screens

3. **Image Optimization**
   - Use `expo-image` for better performance
   - Optimize image sizes

4. **State Management**
   - Keep Context data minimal
   - Use local state when possible

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| TypeScript errors | Update `tsconfig.json` with `jsx: "react-jsx"` |
| Navigation not working | Check `appRoutes.ts` has route defined |
| Formik not validating | Ensure `validationSchema` is passed |
| Dropdown not showing | Install `react-native-dropdown-select-list` |
| Styles not applying | Check colors are imported from `theme.ts` |

---

## 📚 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Formik Guide](https://formik.org/docs/overview)
- [Yup Validation](https://github.com/jquense/yup)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: December 10, 2025
**App Version**: 1.0.0

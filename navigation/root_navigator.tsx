import { AuthContextProvider, useAuth } from "@/context/AuthContext"
import AppNavigator from "@/navigation/app_navigator";
import AuthNavigator from "@/navigation/auth_navigator";
import { Stack } from "expo-router"

const RootNavigator = () => {

  const {isAuthenticated} = useAuth();
  return(
    isAuthenticated ? <AppNavigator/> : <AuthNavigator/>
  )
}



export default function Layout() {
  return (
    <AuthContextProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthContextProvider>
  );
}




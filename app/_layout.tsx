import { AuthContextProvider } from "@/context/AuthContext";
import RootNavigator from "@/navigation/root_navigator";

const RootLayout = () => {
  return (
    <AuthContextProvider>
      <RootNavigator/>
    </AuthContextProvider>
  )
}

export default RootLayout;
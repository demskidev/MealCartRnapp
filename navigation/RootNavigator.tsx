import { Colors } from "@/constants/Theme";
import { useAuth } from "@/context/AuthContext";
import AppNavigator from "@/navigation/AppNavigator";
import AuthNavigator from "@/navigation/AuthNavigator";
import { ActivityIndicator, View } from "react-native";

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors._586E3F} />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;



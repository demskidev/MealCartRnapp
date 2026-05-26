import { BackIcon, KrogerIcon } from "@/assets/svg";
import BaseTextInput from "@/components/BaseTextInput";
import Divider from "@/components/Divider";
import Header from "@/components/Header";
import KrogerSelectedStoreCard from "@/components/KrogerSelectedStoreCard";
import SelectKrogerStore from "@/components/SelectKrogerStore";
import ThemeGradientButton from "@/components/ThemeGradientButton";
import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import * as appKeys from "@/reduxStore/appKeys";
import {
  connectKrogerAccount,
  getKrogerConnectionStatus,
  saveKrogerSelectedStore,
  searchKrogerStores,
} from "@/services/krogerApi";
import { fontSize } from "@/utils/Fonts";
import { pushNavigation } from "@/utils/Navigation";
import { showToast } from "@/utils/Toast";
import { SignupViewModel } from "@/viewmodels/SignupViewModel";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type KrogerLocationsResponse = {
  data?: any[];
};

const KrogerSignupScreen = () => {
  const [startedConnecting, setStartedConnecting] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [zip, setZip] = useState("");
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const signupViewModel = new SignupViewModel();
  const openedFromProfile = params.source === "profile";

  useEffect(() => {
    const loadConnectionStatus = async () => {
      try {
        const status = await getKrogerConnectionStatus();
        const connected = Boolean(status.connected);

        setStartedConnecting(connected);
        setSelectedStore(connected ? status.selectedStore || null : null);
      } catch (error: any) {
      } finally {
        setIsCheckingConnection(false);
      }
    };

    loadConnectionStatus();
  }, []);

  useEffect(() => {
    const status = typeof params.status === "string" ? params.status : "";
    const message = typeof params.message === "string" ? params.message : "";

    if (!status) {
      return;
    }

    const handleOAuthReturn = async () => {
      setIsConnecting(false);

      if (status === "success") {
        try {
          const connected = await refreshConnectionStatus();

          if (connected) {
            showToast("success", "Kroger account connected.");
            return;
          }
        } catch (error) {}

        showToast(
          "error",
          "Kroger sign-in did not complete.",
          "Please try again.",
        );
        return;
      }

      if (status === "error") {
        showToast(
          "error",
          "Kroger sign-in failed.",
          message || "Please try again.",
        );
      }
    };

    handleOAuthReturn();
  }, [params.message, params.status]);

  const handleSkip = () => {
    if (openedFromProfile) {
      navigation.goBack();
      return;
    }

    pushNavigation(APP_ROUTES.HOME);
  };

  const refreshConnectionStatus = async () => {
    const status = await getKrogerConnectionStatus();
    const connected = Boolean(status.connected);

    setStartedConnecting(connected);
    setSelectedStore(connected ? status.selectedStore || null : null);

    return connected;
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      const result = await connectKrogerAccount();

      if (result.type === "cancel" || result.type === "dismiss") {
        setIsConnecting(false);
        showToast("info", "Kroger sign-in was cancelled.");
        return;
      }
    } catch (error: any) {
      setIsConnecting(false);
      showToast(
        "error",
        "Unable to connect Kroger.",
        error?.message || "Please try again.",
      );
    }
  };

  const handleSearch = async (values: { zip: string }) => {
    try {
      setIsSearching(true);

      const response = (await searchKrogerStores(
        values.zip.trim(),
      )) as KrogerLocationsResponse;
      const mappedStores = response.data || [];

      if (!mappedStores.length) {
        showToast("info", "No Kroger stores found.", "Try another ZIP code.");
        return;
      }

      setStores(mappedStores);
      setShowStoreModal(true);
    } catch (error: any) {
      showToast(
        "error",
        "Unable to search stores.",
        error?.message || "Please try again.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleStoreSelect = async (store: any) => {
    try {
      const result = await saveKrogerSelectedStore(store);
      setSelectedStore(result?.selectedStore || store);
      setZip("");
      setShowStoreModal(false);
      showToast("success", "Default Kroger store saved.");
    } catch (error: any) {
      showToast(
        "error",
        "Unable to save Kroger store.",
        error?.message || "Please try again.",
      );
    }
  };

  const handleMainButtonPress = () => {
    if (selectedStore) {
      if (navigation.canGoBack() && openedFromProfile) {
        navigation.goBack();
      } else {
        pushNavigation(APP_ROUTES.HOME);
      }
    } else {
      handleConnect();
    }
  };

  const mainButtonTitle = isCheckingConnection
    ? "Checking..."
    : isConnecting
      ? "Connecting..."
      : isSearching
        ? "Searching..."
        : selectedStore
          ? Strings.continue
          : startedConnecting
            ? Strings.search
            : Strings.connectToKroger;

  const handleBackPress = () => {
    if (selectedStore) {
      setSelectedStore(null);
    } else if (startedConnecting) {
      setStartedConnecting(false);
    } else {
      navigation.goBack();
    }
  };

  const desc = selectedStore
    ? Strings.selected_store_desc
    : startedConnecting
      ? Strings.find_store_desc
      : Strings.kroger_signup_desc;

  const title = selectedStore
    ? Strings.location_selected
    : startedConnecting
      ? Strings.find_your_location
      : Strings.connectTo;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <BackIcon style={styles.backIcon} onPress={handleBackPress} />
      <View style={styles.container}>
        <Header title={title} />
        <View style={styles.logoContainer}>
          <KrogerIcon />
        </View>
        <Text style={styles.description}>{desc}</Text>

        <Formik
          initialValues={{ zip }}
          enableReinitialize
          validationSchema={signupViewModel.validateFieldZipSchema}
          onSubmit={handleSearch}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
            setTouched,
            submitForm,
          }) => (
            <>
              {startedConnecting && !selectedStore && (
                <BaseTextInput
                  value={values.zip}
                  onChangeText={(text) => {
                    setZip(text);
                    handleChange(appKeys.ZIP_KEY)(text);
                  }}
                  onBlur={() => {
                    handleBlur(appKeys.ZIP_KEY);
                    setTouched({ ...touched, zip: true });
                  }}
                  keyboardType="numeric"
                  placeholder={Strings.zipCode}
                  error={touched.zip && errors.zip ? errors.zip : undefined}
                />
              )}

              {selectedStore && (
                <KrogerSelectedStoreCard store={selectedStore} />
              )}
              <ThemeGradientButton
                title={mainButtonTitle}
                onPress={async () => {
                  if (startedConnecting && !selectedStore) {
                    submitForm();
                  } else {
                    handleMainButtonPress();
                  }
                }}
                buttonGradient={styles.connectButton}
                textStyle={{ color: Colors.white }}
                disabled={
                  isCheckingConnection ||
                  isConnecting ||
                  isSearching ||
                  (startedConnecting && !selectedStore && !isValid)
                }
              />
            </>
          )}
        </Formik>

        {!selectedStore && !openedFromProfile && (
          <>
            <Divider style={styles.dividerStyle} />

            <Pressable onPress={handleSkip}>
              <Text style={styles.skipText}>{Strings.skip_for_now}</Text>
            </Pressable>
          </>
        )}
      </View>
      <SelectKrogerStore
        visible={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        stores={stores}
        onSelect={handleStoreSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  container: {
    paddingHorizontal: moderateScale(20),
    gap: verticalScale(30),
  },
  backIcon: {
    flex: 1,
    position: "absolute",
    top: verticalScale(70),
    left: moderateScale(20),
  },
  dividerStyle: {
    marginTop: verticalScale(15),
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  krogerLogo: {
    fontSize: fontSize(48),
    color: "#004785", // Kroger blue
    fontWeight: "bold",
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    letterSpacing: 1,
  },
  description: {
    fontSize: fontSize(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    textAlign: "center",
    marginHorizontal: moderateScale(30),
    lineHeight: moderateScale(18),
  },
  connectButton: {
    // marginTop: verticalScale(10),
    // width: "100%",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(20),
    width: "100%",
    justifyContent: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.tertiary,
    opacity: 0.2,
  },
  orText: {
    marginHorizontal: moderateScale(10),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: fontSize(14),
  },
  skipText: {
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: fontSize(18),
    textAlign: "center",
    marginTop: verticalScale(10),
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    margin: horizontalScale(5),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: verticalScale(3),
  },
  storeImage: {
    borderTopLeftRadius: moderateScale(8),
    borderBottomLeftRadius: moderateScale(8),
    marginRight: horizontalScale(12),
    width: horizontalScale(65),
    height: verticalScale(55),
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    flex: 1,
    textAlignVertical: "center",
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
});

export default KrogerSignupScreen;

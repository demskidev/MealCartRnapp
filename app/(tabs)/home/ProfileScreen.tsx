import {
  closeIcon,
  forwardicon,
  iconedit,
  Profileimage,
} from "@/assets/images";
import { KrogerIcon } from "@/assets/svg";
import AppImage from "@/components/AppImage";
import ConfirmationModal from "@/components/ConfirmationModal";
import DefaultServingsModal from "@/components/DefaultServingsModal";
import Divider from "@/components/Divider";
import KrogerSelectedStoreCard from "@/components/KrogerSelectedStoreCard";
import { hideLoader, showLoader } from "@/components/Loader";
import SelectKrogerStore from "@/components/SelectKrogerStore";
import ThemeGradientButton from "@/components/ThemeGradientButton";
import UpdateProfileModal from "@/components/UpdateProfileModal";
import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  capitalizeFirstLetter,
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import { deleteAccountAsync } from "@/reduxStore/slices/profileSlice";
import {
  disconnectKrogerAccount,
  getKrogerConnectionStatus,
  saveKrogerSelectedStore,
  searchKrogerStores,
} from "@/services/krogerApi";
import { performLogout } from "@/utils/auth";
import { pushNavigation, resetAndNavigate } from "@/utils/Navigation";
import { showErrorToast, showSuccessToast, showToast } from "@/utils/Toast";
import { useProfileViewModel } from "@/viewmodels/ProfileViewModel";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [exitGuest, setExitGuest] = useState(false);
  const [disconnectKroger, setDisconnectKroger] = useState(false);
  const [defaultServings, setDefaultServings] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [isSavingServings, setIsSavingServings] = useState(false);
  const [krogerStatus, setKrogerStatus] = useState<any>(null);
  const [krogerLoading, setKrogerLoading] = useState(true);
  const [krogerDisconnecting, setKrogerDisconnecting] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [krogerStores, setKrogerStores] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  // Guests reach this screen too (meals / plans / lists are open to them), but
  // everything that is genuinely account based is swapped for a sign-up CTA.
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const {
    user,
    loading,
    dietaryPreferences,
    profileLoading,
    updateUserData,
    fetchDietaryPreferences,
  } = useProfileViewModel();

  useEffect(() => {
    // Fetch the list of all dietary preferences from Firestore
    fetchDietaryPreferences(
      () => {
        setPreferencesLoaded(true);
      },
      (error) => {
        setPreferencesLoaded(true);
      },
    );
  }, []);

  const loadKrogerStatus = async () => {
    // A guest has no Kroger link to check — skip the callable entirely.
    if (isGuest) {
      setKrogerStatus(null);
      setKrogerLoading(false);
      return;
    }
    try {
      setKrogerLoading(true);
      const status = await getKrogerConnectionStatus();
      setKrogerStatus(status);
    } catch (error: any) {
      setKrogerStatus(null);
    } finally {
      setKrogerLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadKrogerStatus();
    }, []),
  );

  // Format allergies for display
  const getAllergiesDisplay = () => {
    if (!user?.allergies || user.allergies.length === 0) {
      return Strings.nA;
    }

    return user.allergies.map(capitalizeFirstLetter).join(", ");
  };

  const getPreferencesDisplay = () => {
    if (!preferencesLoaded) {
      return "Loading...";
    }

    if (!user?.dietaryPreferences || user.dietaryPreferences.length === 0) {
      return Strings.nA;
    }

    return user.dietaryPreferences
      .map((id: string) => {
        const preference = dietaryPreferences.find(
          (pref) => pref.id.toString() === id,
        );
        return preference?.name || "";
      })
      .filter((name: string) => name !== "")
      .join(", ");
  };

  const preferencesData = [
    {
      id: "1",
      title: "Dietary Preferences",
      subtitle: getPreferencesDisplay(),
    },
    {
      id: "2",
      title: Strings.profile_allergies,
      subtitle: getAllergiesDisplay(),
    },
    {
      id: "3",
      title: Strings.profile_mealPlanSettings,
      subtitle: "",
    },
    {
      id: "4",
      title: Strings.profile_defaultServings,
      subtitle: user?.servings
        ? `${user?.servings} ${Strings.profile_servings}`
        : `1 ${Strings.profile_servings}`,
    },
  ];
  const onPressItem = (index: any) => {
    if (index === 0) {
      pushNavigation(APP_ROUTES.DietaryPreferences);
    } else if (index === 1) {
      pushNavigation(APP_ROUTES.AllergiesIntolerance);
    } else if (index === 2) {
      pushNavigation(APP_ROUTES.MealPlanSettings);
    } else if (index === 3) {
      setDefaultServings(true);
      //    router.push('');
    }
  };

  const handleSaveServings = (selectedServings: number) => {
    setIsSavingServings(true);
    updateUserData(
      { servings: selectedServings },
      () => {
        setIsSavingServings(false);
        setDefaultServings(false);
        showToast("success", "Servings saved successfully!");
      },
      (error) => {
        setIsSavingServings(false);
        showToast("error", error || "Failed to save servings");
      },
    );
  };

  const isKrogerConnected = Boolean(krogerStatus?.connected);
  const selectedKrogerStore = krogerStatus?.selectedStore || null;

  const handleOpenKrogerFlow = () => {
    pushNavigation(APP_ROUTES.KROGER_SIGNUP, {
      source: "profile",
    });
  };

  // The auth screens still live under `app/screens/`, and expo-router routes by
  // file rather than by the <Stack.Screen> list, so this resolves from inside
  // AppNavigator even though AuthNavigator is the stack that registers it.
  const handleCreateAccount = () => {
    pushNavigation(APP_ROUTES.SIGNUP);
  };

  const [isSearchingStores, setIsSearchingStores] = useState(false);

  const handleSearchStores = async (zipCode: string) => {
    try {
      setIsSearchingStores(true);
      const response = (await searchKrogerStores(zipCode)) as { data?: any[] };
      const mappedStores = response.data || [];
      if (!mappedStores.length) {
        showToast("info", "No Kroger stores found.", "Try another ZIP code.");
        return;
      }
      setKrogerStores(mappedStores);
    } catch (error: any) {
      showErrorToast(error?.message || "Unable to search stores.");
    } finally {
      setIsSearchingStores(false);
    }
  };

  const handleChangeStore = async () => {
    const zipCode = selectedKrogerStore?.address?.zipCode;
    if (!zipCode) {
      setKrogerStores([]);
      setShowStoreModal(true);
      return;
    }
    try {
      showLoader();
      const response = (await searchKrogerStores(zipCode)) as { data?: any[] };
      const mappedStores = response.data || [];
      setKrogerStores(mappedStores);
      setShowStoreModal(true);
    } catch (error: any) {
      showErrorToast(error?.message || "Unable to search stores.");
      setKrogerStores([]);
      setShowStoreModal(true);
    } finally {
      hideLoader();
    }
  };

  const handleStoreSelect = async (store: any) => {
    try {
      showLoader();
      const result = await saveKrogerSelectedStore(store);
      const updatedStore = result?.selectedStore || store;
      setKrogerStatus((prev: any) => ({
        ...prev,
        selectedStore: updatedStore,
      }));
      setShowStoreModal(false);
      showSuccessToast("Default Kroger store saved.");
    } catch (error: any) {
      showErrorToast(error?.message || "Unable to save Kroger store.");
    } finally {
      hideLoader();
    }
  };

  const getSelectedStoreId = () => {
    if (!selectedKrogerStore) return null;
    return selectedKrogerStore.locationId || null;
  };

  const handleDisconnectKroger = async () => {
    try {
      setKrogerDisconnecting(true);
      await disconnectKrogerAccount();
      setDisconnectKroger(false);
      setKrogerStatus(null);
      showSuccessToast("Kroger account disconnected.");
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to disconnect Kroger account");
    } finally {
      setKrogerDisconnecting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.parentCreateMealText}>
        <Text style={styles.header}>{Strings.profile_title}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={closeIcon}
            style={styles.closeIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          disabled={isGuest}
        >
          <View style={styles.imageParentStyle}>
            <AppImage
              source={user?.imageUrl ? { uri: user.imageUrl } : Profileimage}
              style={styles.profileImage}
              resizeMode="cover"
            />
            {/* The pencil implies a tap target; a guest has no profile to edit. */}
            {!isGuest && (
              <Image
                source={iconedit}
                style={styles.editIconImage}
                tintColor={Colors.white}
                resizeMode="cover"
              />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>
          {isGuest ? Strings.guest_badgeLabel : user?.name}
        </Text>
        <Text style={styles.email}>
          {isGuest ? Strings.guest_profileLocked : user?.email}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {isGuest && (
          <>
            <Text style={styles.sectionHeader}>
              {Strings.guest_accountSectionTitle}
            </Text>
            <View style={styles.card}>
              <View style={styles.guestUpgradeBody}>
                <Text style={styles.guestUpgradeText}>
                  {Strings.guest_accountSectionSubtitle}
                </Text>
                <ThemeGradientButton
                  title={Strings.guest_createAccountCta}
                  onPress={handleCreateAccount}
                  textStyle={{ color: Colors.white }}
                />
              </View>
            </View>
          </>
        )}

        <Text style={styles.sectionHeader}>
          {Strings.profile_mealCookingPreferences}
        </Text>

        <View style={styles.card}>
          <FlatList
            data={preferencesData}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => onPressItem(index)}
                >
                  <View>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    {!!item.subtitle && (
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>

                  <Image
                    source={forwardicon}
                    style={styles.forwardIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                {index !== preferencesData.length - 1 && (
                  <View style={styles.divider} />
                )}
              </>
            )}
          />
        </View>
        <View style={styles.krogerTitle}>
          <KrogerIcon width={horizontalScale(51)} height={verticalScale(29)} />
          <Text style={styles.sectionHeader}>
            {Strings.profile_krogerAccount}
          </Text>
        </View>

        <View style={styles.krogerCard}>
          <View style={styles.krogerHeaderRow}>
            <View style={styles.krogerTitleRow}>
              <Text style={styles.krogerStatusLabel}>
                {Strings.profile_krogerStatus}
              </Text>
            </View>
            <Pressable
              style={[
                styles.krogerStatusPill,
                isKrogerConnected
                  ? styles.krogerConnectedPill
                  : styles.krogerDisconnectedPill,
              ]}
              onPress={() => {}}
              disabled={krogerLoading}
            >
              <Text style={styles.krogerStatusText}>
                {krogerLoading
                  ? "Checking..."
                  : isKrogerConnected
                    ? Strings.profile_krogerConnected
                    : Strings.profile_krogerDisconnected}
              </Text>
            </Pressable>
          </View>

          {isGuest ? (
            <View style={styles.krogerEmptyState}>
              <Text style={styles.krogerEmptyText}>
                {Strings.guest_krogerSubtitle}
              </Text>
              <ThemeGradientButton
                title={Strings.guest_createAccountCta}
                onPress={handleCreateAccount}
                buttonGradient={styles.krogerPrimaryButton}
                textStyle={{ color: Colors.white }}
              />
            </View>
          ) : !isKrogerConnected ? (
            <View style={styles.krogerEmptyState}>
              <Text style={styles.krogerEmptyText}>
                {Strings.profile_krogerDisconnectedSubtitle}
              </Text>
              <ThemeGradientButton
                title={Strings.profile_krogerConnect}
                onPress={handleOpenKrogerFlow}
                buttonGradient={styles.krogerPrimaryButton}
                textStyle={{ color: Colors.white }}
                disabled={krogerLoading}
              />
            </View>
          ) : (
            <View style={styles.krogerConnectedBody}>
              <Text style={styles.krogerStoreLabel}>
                {Strings.profile_krogerDefaultStore}
              </Text>
              <Divider showText={false} style={{ gap: 0 }} />
              {selectedKrogerStore ? (
                <KrogerSelectedStoreCard
                  store={selectedKrogerStore}
                  actionLabel={Strings.profile_krogerChange}
                  onActionPress={handleChangeStore}
                />
              ) : (
                <View style={styles.krogerEmptyState}>
                  <Text style={styles.krogerEmptyText}>
                    {Strings.profile_krogerNoStore}
                  </Text>
                  <ThemeGradientButton
                    title={Strings.profile_krogerSelectStore}
                    onPress={handleOpenKrogerFlow}
                    buttonGradient={styles.krogerPrimaryButton}
                    textStyle={{ color: Colors.white }}
                  />
                </View>
              )}
            </View>
          )}

          {isKrogerConnected ? (
            <TouchableOpacity
              style={styles.krogerDisconnectRow}
              onPress={() => setDisconnectKroger(true)}
              disabled={krogerDisconnecting}
            >
              <Text style={styles.krogerDisconnectText}>
                {Strings.profile_krogerDisconnectAccount}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.sectionHeader}>
          {Strings.profile_accountSecurity}
        </Text>
        <View style={styles.card}>
          {/* A guest has no password to change and no account to delete —
              showing either would dead-end them in a Firebase error. */}
          {!isGuest && (
            <>
              <TouchableOpacity
                style={styles.row}
                onPress={() => pushNavigation(APP_ROUTES.PasswordReset)}
              >
                <Text style={styles.rowTitle}>
                  {Strings.profile_changePassword}
                </Text>
                <Image
                  source={forwardicon}
                  style={styles.forwardIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.row}
                onPress={() => setDeleteAccount(true)}
              >
                <Text style={styles.deleteText}>
                  {Strings.profile_deleteAccount}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.row}
            onPress={async () => {
              // Signing out of a guest session abandons the anonymous uid, and
              // with it everything the guest saved — confirm before doing that.
              if (isGuest) {
                setExitGuest(true);
                return;
              }
              showLoader();
              await performLogout();
              hideLoader();
            }}
          >
            <Text style={styles.deleteText}>
              {isGuest ? Strings.guest_exitGuest : Strings.profile_logout}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>{Strings.profile_appSettings}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              Linking.openURL(
                "https://sites.google.com/mealcartapps.com/mealcartapps/privacy-policy",
              ).catch(() => showErrorToast(Strings.error_unableToOpenLink))
            }
          >
            <Text style={styles.rowTitle}>{Strings.profile_privacyPolicy}</Text>
            <Image
              source={forwardicon}
              style={styles.forwardIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              Linking.openURL(
                "https://sites.google.com/mealcartapps.com/mealcartapps/terms-of-service",
              ).catch(() => showErrorToast(Strings.error_unableToOpenLink))
            }
          >
            <Text style={styles.rowTitle}>
              {Strings.profile_termsOfService}
            </Text>
            <Image
              source={forwardicon}
              style={styles.forwardIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* <View style={styles.bottomNav}></View> */}
      <UpdateProfileModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onUnlinkSocialAccount={async () => {
          showLoader();
          await performLogout();
          hideLoader();
          setShowModal(false);
        }}
      />
      <ConfirmationModal
        visible={disconnectKroger}
        title={Strings.profile_krogerDisconnectTitle}
        description={Strings.profile_krogerDisconnectDescription}
        cancelText={Strings.profile_cancel}
        confirmText={Strings.profile_confirmDelete}
        onCancel={() => setDisconnectKroger(false)}
        onConfirm={handleDisconnectKroger}
      />
      <ConfirmationModal
        visible={exitGuest}
        title={Strings.guest_exitTitle}
        description={Strings.guest_exitDescription}
        cancelText={Strings.profile_cancel}
        confirmText={Strings.guest_exitConfirm}
        onCancel={() => setExitGuest(false)}
        onConfirm={async () => {
          setExitGuest(false);
          showLoader();
          await performLogout(APP_ROUTES.WelcomeScreen);
          hideLoader();
        }}
      />
      <ConfirmationModal
        visible={deleteAccount}
        title={Strings.profile_deleteAccountTitle}
        description={Strings.profile_deleteAccountDescription}
        cancelText={Strings.profile_cancel}
        confirmText={Strings.profile_confirmDelete}
        onCancel={() => setDeleteAccount(false)}
        onConfirm={async () => {
          //   setDeleteAccount(false);
          showLoader();
          try {
            await dispatch(deleteAccountAsync()).unwrap(); // ✅ async + unwrap
            showSuccessToast("Account deleted successfully");
            resetAndNavigate(APP_ROUTES.WelcomeScreen); // redirect to welcome/login
          } catch (error: any) {
            // ✅ ensure we pass string to toast
            const message =
              typeof error === "string"
                ? error
                : error?.message || "Failed to delete account";
            showErrorToast(message);
          } finally {
            hideLoader();
          }
        }}
      />
      <SelectKrogerStore
        visible={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        stores={krogerStores}
        onSelect={handleStoreSelect}
        initialSelectedStoreId={getSelectedStoreId()}
        onSearch={handleSearchStores}
        isSearching={isSearchingStores}
        initialZipCode={selectedKrogerStore?.address?.zipCode || ""}
      />
      <DefaultServingsModal
        visible={defaultServings}
        onClose={() => setDefaultServings(false)}
        onSave={(selectedServings: number) =>
          handleSaveServings(selectedServings)
        }
        isSaving={isSavingServings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: horizontalScale(20),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(18),
    marginHorizontal: horizontalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
  },
  closeIcon: {
    fontSize: moderateScale(24),
    color: Colors.error,
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: verticalScale(8),
    marginBottom: verticalScale(10),
  },

  name: {
    fontSize: moderateScale(21),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginTop: verticalScale(2),
  },
  email: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    marginTop: verticalScale(2),
  },
  sectionHeader: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.tertiary,
  },
  krogerCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginTop: verticalScale(4),
    marginBottom: verticalScale(15),
    marginHorizontal: horizontalScale(2),
    paddingVertical: verticalScale(18),
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  krogerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(5),
  },
  krogerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",
    marginBottom: verticalScale(18),
    marginHorizontal: horizontalScale(18),
  },
  krogerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  krogerTitleText: {
    fontSize: moderateScale(18),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.tertiary,
    letterSpacing: 0.4,
  },
  krogerStatusLabel: {
    fontSize: moderateScale(16),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  krogerStoreLabel: {
    fontSize: moderateScale(16),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    textAlign: "center",
  },
  krogerStatusPill: {
    minWidth: horizontalScale(126),
    borderRadius: moderateScale(24),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  krogerConnectedPill: {
    backgroundColor: Colors._2E6937,
  },
  krogerDisconnectedPill: {
    backgroundColor: Colors.secondaryButtonBackground,
  },
  krogerStatusText: {
    color: Colors.white,
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
  },
  krogerConnectedBody: {
    gap: verticalScale(8),
  },
  krogerEmptyState: {
    gap: verticalScale(12),
    marginHorizontal: horizontalScale(18),
  },
  guestUpgradeBody: {
    gap: verticalScale(12),
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(16),
  },
  guestUpgradeText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    lineHeight: moderateScale(20),
  },
  krogerEmptyText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    lineHeight: moderateScale(20),
  },
  krogerPrimaryButton: {
    flex: 0,
    minHeight: verticalScale(48),
  },
  krogerDisconnectRow: {
    marginTop: verticalScale(18),
    paddingTop: verticalScale(10),
    marginHorizontal: horizontalScale(18),
  },
  krogerDisconnectText: {
    fontSize: moderateScale(16),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.error,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(15),
    marginHorizontal: horizontalScale(2),
    paddingVertical: verticalScale(11),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(13),
  },
  rowTitle: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  rowSubtitle: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    marginTop: verticalScale(2),
  },
  arrow: {
    fontSize: moderateScale(18),
    color: Colors.tertiary,
    marginLeft: horizontalScale(8),
  },
  divider: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
  },
  deleteText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.error,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    marginBottom: 2,
  },
  navLabel: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
  },
  selectedNav: {
    color: Colors.olive,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
  },
  header: {
    fontSize: moderateScale(21),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
  },
  parentCreateMealText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: verticalScale(20),
  },
  closeIconImage: {
    width: verticalScale(24),
    height: verticalScale(24),
  },
  imageParentStyle: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: verticalScale(95),
    height: verticalScale(95),
    borderRadius: verticalScale(50),
  },
  editIconImage: {
    width: moderateScale(30),
    height: moderateScale(30),
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [
      { translateX: -moderateScale(15) },
      { translateY: -moderateScale(15) },
    ],
    zIndex: 1,
  },
  scrollViewContent: {
    paddingBottom: 32,
  },
  forwardIcon: {
    width: verticalScale(8),
    height: verticalScale(12),
  },
});

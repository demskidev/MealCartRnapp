import { closeIcon, forwardicon, Profileimage } from '@/assets/images';
import ConfirmationModal from '@/components/ConfirmationModal';
import DefaultServingsModal from '@/components/DefaultServingsModal';
import UpdateProfileModal from '@/components/UpdateProfileModal';
import { APP_ROUTES } from '@/constants/AppRoutes';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useAppDispatch } from '@/reduxStore/hooks';
import { performLogout } from '@/utils/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const preferencesData = [
    {
        id: '1',
        title: 'Dietary Preferences',
        subtitle: 'Vegetarian',
    },
    {
        id: '2',
        title: Strings.profile_allergies,
        subtitle: Strings.profile_peanuts,
    },
    {
        id: '3',
        title: Strings.profile_mealPlanSettings,
        subtitle: '',
    },
    {
        id: '4',
        title: Strings.profile_defaultServings,
        subtitle: Strings.profile_defaultServingsSubtitle,
    },
];

export default function ProfileScreen() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [deleteAccount, setDeleteAccount] = useState(false);
    const [defaultServings, setDefaultServings] = useState(false);
    const dispatch = useAppDispatch();



    const onPressItem = (index: any) => {
        if (index === 0) {
            router.push(APP_ROUTES.DietaryPreferences);
        } else if (index === 1) {
            router.push(APP_ROUTES.AllergiesIntolerance);

        } else if (index === 2) {
            router.push(APP_ROUTES.MealPlanSettings);

        } else if (index === 3) {
            setDefaultServings(true);
            //    router.push('');
        }
    }
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.parentCreateMealText}>
                <Text style={styles.header}>{Strings.profile_title}</Text>
                <TouchableOpacity onPress={() => router.back()} >
                    <Image
                        source={closeIcon}
                        style={styles.closeIconImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>


            </View>
            <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={() => setShowModal(true)} >
                    <Image
                        source={Profileimage}
                        style={styles.profileImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={styles.name}>{Strings.profile_name}</Text>
                <Text style={styles.email}>{Strings.profile_email}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionHeader}>{Strings.profile_mealCookingPreferences}</Text>

                <View style={styles.card}>
                    <FlatList
                        data={preferencesData}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <>
                                <TouchableOpacity style={styles.row} onPress={() => onPressItem(index)} >
                                    <View>
                                        <Text style={styles.rowTitle}>{item.title}</Text>
                                        {!!item.subtitle && <Text style={styles.rowSubtitle}>{item.subtitle}</Text>}
                                    </View>

                                    <Image
                                        source={forwardicon}
                                        style={styles.forwardIcon}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                                {index !== preferencesData.length - 1 && <View style={styles.divider} />}
                            </>
                        )}
                    />
                </View>

                <Text style={styles.sectionHeader}>{Strings.profile_accountSecurity}</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => router.push(APP_ROUTES.PasswordReset)}
                    >
                        <Text style={styles.rowTitle}>{Strings.profile_changePassword}</Text>
                        <Image
                            source={forwardicon}
                            style={styles.forwardIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} onPress={() => setDeleteAccount(true)}>
                        <Text style={styles.deleteText}>{Strings.profile_deleteAccount}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={async () => {

                        await performLogout();
                    }}>
                        <Text style={styles.deleteText}>{Strings.profile_logout}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>{Strings.profile_appSettings}</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowTitle}>{Strings.profile_helpSupport}</Text>
                        <Image
                            source={forwardicon}
                            style={styles.forwardIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowTitle}>{Strings.profile_aboutLegal}</Text>
                        <Image
                            source={forwardicon}
                            style={styles.forwardIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={styles.bottomNav}>
            </View>
            <UpdateProfileModal
                visible={showModal}
                onClose={() => setShowModal(false)}
            />
            <ConfirmationModal
                visible={deleteAccount}
                title={Strings.profile_deleteAccountTitle}
                description={Strings.profile_deleteAccountDescription}
                cancelText={Strings.profile_cancel}
                confirmText={Strings.profile_confirmDelete}
                onCancel={() => setDeleteAccount(false)}
                onConfirm={() => {
                    setDeleteAccount(false);

                }}
            />
            <DefaultServingsModal
                visible={defaultServings}
                onClose={() => setDefaultServings(false)}
                onSave={(selected) => {
                    setDefaultServings(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: horizontalScale(20)
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        fontWeight: 'bold',
    },
    avatarContainer: {
        alignItems: 'center',
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
        marginTop: verticalScale(18),
        marginBottom: verticalScale(6),
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        marginVertical: verticalScale(6),
        paddingVertical: verticalScale(11),

        elevation: 4,

        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
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
    header: { fontSize: moderateScale(21), color: Colors.primary, fontFamily: FontFamilies.ROBOTO_SEMI_BOLD },
    parentCreateMealText: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: verticalScale(20),
    },
    closeIconImage: {
        width: verticalScale(24),
        height: verticalScale(24),
    },
    profileImage: {
        width: verticalScale(112),
        height: verticalScale(112),
    },
    scrollViewContent: {
        paddingBottom: 32,
    },
    forwardIcon: {
        width: verticalScale(8),
        height: verticalScale(12),
    },
});

import ConfirmationModal from '@/components/ConfirmationModal';
import DefaultServingsModal from '@/components/DefaultServingsModal';
import UpdateProfileModal from '@/components/UpdateProfileModal';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
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
        title: 'Allergies & Intolerances',
        subtitle: 'Peanuts',
    },
    {
        id: '3',
        title: 'Meal Plan Settings',
        subtitle: '',
    },
    {
        id: '4',
        title: 'Default Servings',
        subtitle: '2 People',
    },
];

export default function ProfileScreen() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [deleteAccount, setDeleteAccount] = useState(false);
    const [defaultServings, setDefaultServings] = useState(false);



    const onPressItem = (index: any) => {
        if (index === 0) {
            router.push('/appscreens/DietaryPreferences');
        } else if (index === 1) {
            router.push('/appscreens/AllergiesIntolerance');

        } else if (index === 2) {
            router.push('/appscreens/MealPlanSettings');

        } else if (index === 3) {
            setDefaultServings(true);
            //    router.push('');
        }
    }
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.parentCreateMealText}>
                <Text style={styles.header}> Profile </Text>
                <TouchableOpacity onPress={() => router.back()} >
                    <Image
                        source={require("@/assets/images/close-icon.png")}
                        style={{ width: verticalScale(24), height: verticalScale(24) }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>


            </View>
            <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={() => setShowModal(true)} >
                    <Image
                        source={require("@/assets/images/Profileimage.png")}
                        style={{ width: verticalScale(112), height: verticalScale(112) }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={styles.name}>Alex Doe</Text>
                <Text style={styles.email}>alex.doe@email.com</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionHeader}>MEAL & COOKING PREFERENCES</Text>

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
                                        source={require("@/assets/images/forwardicon.png")}
                                        style={{ width: verticalScale(8), height: verticalScale(12) }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                                {index !== preferencesData.length - 1 && <View style={styles.divider} />}
                            </>
                        )}
                    />
                </View>

                <Text style={styles.sectionHeader}>ACCOUNT & SECURITY</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => router.push('/appscreens/PasswordReset')}
                    >
                        <Text style={styles.rowTitle}>Change Password</Text>
                        <Image
                            source={require("@/assets/images/forwardicon.png")}
                            style={{ width: verticalScale(8), height: verticalScale(12) }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} onPress={() => setDeleteAccount(true)}>
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.sectionHeader}>APP SETTINGS</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowTitle}>Help & Support</Text>
                        <Image
                            source={require("@/assets/images/forwardicon.png")}
                            style={{ width: verticalScale(8), height: verticalScale(12) }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowTitle}>About & Legal</Text>
                        <Image
                            source={require("@/assets/images/forwardicon.png")}
                            style={{ width: verticalScale(8), height: verticalScale(12) }}
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
                title="Delete Account?"
                description="This action is permanent and cannot be undone. All your meals, plans, and lists will be lost."
                cancelText="Cancel"
                confirmText="Delete"
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

        // Android
        elevation: 4,

        // iOS
        shadowColor: '#000',
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
});

import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    return (
        <View style={styles.container}>
            {/* Header */}
           <View style={styles.parentCreateMealText}>
                     <Text style={styles.header}> "Edit Meal" </Text>
                     <TouchableOpacity   >
                       <Image
                         source={require("@/assets/images/close-icon.png")}
                         style={{ width: verticalScale(24), height: verticalScale(24) }}
                         resizeMode="contain"
                       />
                     </TouchableOpacity>
           
           
                   </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {/* <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                        style={styles.avatar}
                    /> */}
                    <Text style={styles.name}>Alex Doe</Text>
                    <Text style={styles.email}>alex.doe@email.com</Text>
                </View>

                {/* Preferences Section */}
                <Text style={styles.sectionHeader}>MEAL & COOKING PREFERENCES</Text>
                <View style={styles.card}>
                    <FlatList
                        data={preferencesData}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <>
                                <TouchableOpacity style={styles.row}>
                                    <View>
                                        <Text style={styles.rowTitle}>{item.title}</Text>
                                        {!!item.subtitle && <Text style={styles.rowSubtitle}>{item.subtitle}</Text>}
                                    </View>
                                    <Text style={styles.arrow}>{'>'}</Text>
                                </TouchableOpacity>
                                {index !== preferencesData.length - 1 && <View style={styles.divider} />}
                            </>
                        )}
                    />
                </View>

                {/* Account & Security Section */}
                <Text style={styles.sectionHeader}>ACCOUNT & SECURITY</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.rowTitle}>Change Password</Text>
                        <Text style={styles.arrow}>{'>'}</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {/* Bottom Navigation Placeholder */}
            <View style={styles.bottomNav}>
                {/* <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/home.png')} style={styles.navIcon} /><Text style={styles.navLabel}>Home</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/meals.png')} style={styles.navIcon} /><Text style={styles.navLabel}>Meals</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/plans.png')} style={styles.navIcon} /><Text style={styles.navLabel}>Plans</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navItem}><Image source={require('@/assets/images/lists.png')} style={styles.navIcon} /><Text style={[styles.navLabel, styles.selectedNav]}>Lists</Text></TouchableOpacity> */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        marginTop: verticalScale(18),
        marginBottom: verticalScale(10),
    },
    avatar: {
        width: moderateScale(90),
        height: moderateScale(90),
        borderRadius: moderateScale(45),
        backgroundColor: Colors.greysoft,
    },
    name: {
        fontSize: moderateScale(20),
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        color: Colors.primary,
        marginTop: verticalScale(2),
    },
    email: {
        fontSize: moderateScale(13),
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        color: Colors.tertiary,
        marginTop: verticalScale(2),
    },
    sectionHeader: {
        fontSize: moderateScale(12),
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.tertiary,
        marginTop: verticalScale(18),
        marginBottom: verticalScale(6),
        marginLeft: horizontalScale(20),
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: moderateScale(12),
        marginHorizontal: horizontalScale(14),
        marginBottom: verticalScale(14),
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        paddingVertical: verticalScale(2),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(13),
    },
    rowTitle: {
        fontSize: moderateScale(15),
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
        height: 1,
        backgroundColor: Colors.divider,
        marginHorizontal: horizontalScale(16),
    },
    deleteText: {
        fontSize: moderateScale(15),
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: verticalScale(20), marginHorizontal: moderateScale(20)
  },
});

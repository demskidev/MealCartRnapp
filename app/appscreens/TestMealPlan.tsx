import ConfirmationModal from '@/components/ConfirmationModal';
import GradientText from '@/components/GradientText';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FONT_FAMILY = 'Poppins-SemiBold';
const FONT_FAMILY_REGULAR = 'Poppins-Regular';
const TITLE_COLOR = '#222';
const SUBTITLE_COLOR = '#888';
const HIGHLIGHT_COLOR = '#7A9256';
const CARD_BG = '#F2F3F4';
const CARD_SHADOW = '#E6E6E6';
const BG_COLOR = '#fff';

const sections = [
    {
        title: 'Monday',
        data: [
            {
                type: 'Breakfast',
                title: 'My special Morning Toast',
                time: '10 min',
                difficulty: 'Easy',
                image: require('@/assets/images/burger.png'), // Replace with your image path
            },
            {
                type: 'Launch',
                title: 'My Special Burger',
                time: '15 min',
                difficulty: 'Medium',
                image: require('@/assets/images/foodimage.png'), // Replace with your image path
            },
        ],
    },
    {
        title: 'Tuesday',
        data: [
            {
                type: 'Breakfast',
                title: 'My special Morning Toast',
                time: '10 min',
                difficulty: 'Easy',
                image: require('@/assets/images/foodimage.png'),
            },
            {
                type: 'Launch',
                title: 'My Special Burger',
                time: '15 min',
                difficulty: 'Medium',
                image: require('@/assets/images/burger.png'),
            },
        ],
    },
    {
        title: 'Wednesday',
        data: [
            {
                type: 'Breakfast',
                title: 'My special Morning Toast',
                time: '10 min',
                difficulty: 'Easy',
                image: require('@/assets/images/foodimage.png'),
            },
            {
                type: 'Launch',
                title: 'My Special Burger',
                time: '15 min',
                difficulty: 'Medium',
                image: require('@/assets/images/burger.png'),
            },
        ],
    },
];

export default function TestMealPlan({ navigation }) {
    const [removePlan, setRemovePlan] = useState(false);
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>



            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image
                        source={require("@/assets/images/iconback.png")}
                        resizeMode="contain"
                        style={{
                            width: moderateScale(24),
                            height: moderateScale(24),
                            alignSelf: 'flex-end',
                            marginRight: horizontalScale(-11),
                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.backText}>Back to Plans</Text>
            </View>

            <View style={styles.titleRow}>
                <View>
                    <Text style={styles.planTitle}>Test Plan</Text>
                    <Text style={styles.planSubTitle}>Started on 27/09/2025</Text>
                </View>
                <View style={styles.editdelete}>
                    <TouchableOpacity style={{ marginRight: horizontalScale(20) }} onPress={() => router.push('./CreateMealPlan')}   >
                        <Image source={require("@/assets/images/iconedit.png")} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24), alignSelf: 'flex-end', }} />

                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRemovePlan(true)}>
                        <Image source={require("@/assets/images/delete.png")} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24), alignSelf: 'flex-end', }} />


                    </TouchableOpacity>
                </View>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(_, index) => index.toString()}
                renderSectionHeader={({ section: { title } }) => (
                    <View>
                        <Text style={styles.dayTitle}>{title}</Text>
                        <View style={styles.dividerRow} />
                    </View>

                )}
                renderItem={({ item }) => (
                    <View style={styles.mealCard}>
                        <Image source={item.image} style={styles.mealImage} resizeMode='cover' />
                        <View style={styles.mealInfo}>
                            <GradientText
                                text={item.type}
                                startColor={Colors._667D4C}
                                endColor={Colors._9DAF89}
                                fontSize={moderateScale(12)}
                            // angle="vertical"
                            />
                            {/* <Text style={styles.mealType}>{item.type}</Text> */}
                            <Text style={styles.mealName}>{item.title}</Text>
                            <Text style={styles.mealMeta}>
                                {item.time} · {item.difficulty}
                            </Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: verticalScale(32) }}
                showsVerticalScrollIndicator={false}
                style={{ marginTop: verticalScale(8) }}
            />
            <ConfirmationModal
                visible={removePlan}
                title="Remove Meal Plan?"
                description="Meal Plan will be removed and can no longer be accessible."
                cancelText="Cancel"
                confirmText="Remove"
                onCancel={() => setRemovePlan(false)}
                onConfirm={() => {
                    setRemovePlan(false);

                }}
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backText: {
        fontSize: moderateScale(14),
        color: Colors.tertiary,
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        marginLeft: horizontalScale(30),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: verticalScale(10)
        // backgroundColor:'red'
        // marginBottom: 2,
        // marginTop: 8,
    },
    planTitle: {
        fontSize: moderateScale(21),
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        color: Colors.primary,
        // flex: 1,
    },
    planSubTitle: {
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        marginTop: verticalScale(10)
        // marginBottom: 16,
    },
    dayTitle: {
        fontSize: moderateScale(14),
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.primary,
        marginTop: moderateScale(16),
        marginBottom: moderateScale(8),
    },
    mealCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        marginBottom: moderateScale(8),
        alignItems: 'center',
        elevation: 4,

        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mealImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: '#ccc',
    },
    mealInfo: {
        flex: 1,
        paddingVertical: verticalScale(12)
    },
    mealType: {
        fontSize: moderateScale(12),
        color: '#667D4C',
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        // marginBottom: 2,
        // marginTop: 6
    },
    mealName: {
        fontSize: moderateScale(14),
        color: Colors.primary,
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        marginBottom: verticalScale(3),
    },
    mealMeta: {
        fontSize: moderateScale(10),
        color: Colors.tertiary,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
    },
    editdelete: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    dividerRow: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,

        marginTop: verticalScale(2),
        marginBottom: verticalScale(15)

    },
});
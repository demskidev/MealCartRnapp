import { burger, deleteicon, foodimage, iconback, iconedit } from '@/assets/images';
import ConfirmationModal from '@/components/ConfirmationModal';
import GradientText from '@/components/GradientText';
import { APP_ROUTES } from '@/constants/AppRoutes';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const sections = [
    {
        title: 'Monday',
        data: [
            {
                type: 'Breakfast',
                title: 'My special Morning Toast',
                time: '10 min',
                difficulty: 'Easy',
                image: burger,
            },
            {
                type: 'Launch',
                title: 'My Special Burger',
                time: '15 min',
                difficulty: 'Medium',
                image: foodimage,
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
                image: foodimage,
            },
            {
                type: 'Launch',
                title: 'My Special Burger',
                time: '15 min',
                difficulty: 'Medium',
                image: burger,
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
                image: foodimage,
            },
            {
                type: 'Launch',
                title: 'My Special Burger',
                time: '15 min',
                difficulty: 'Medium',
                image: burger,
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
                        source={iconback}
                        resizeMode="contain"
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.backText}>{Strings.testMealPlan_backToPlans}</Text>
            </View>

            <View style={styles.titleRow}>
                <View>
                    <Text style={styles.planTitle}>{Strings.testMealPlan_title}</Text>
                    <Text style={styles.planSubTitle}>{Strings.testMealPlan_startedOn}</Text>
                </View>
                <View style={styles.editdelete}>
                    <TouchableOpacity style={styles.editButton} onPress={() => router.push(APP_ROUTES.CreateMealPlan)}   >
                        <Image source={iconedit} resizeMode="contain" style={styles.editIcon} />

                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRemovePlan(true)}>
                        <Image source={deleteicon} resizeMode="contain" style={styles.deleteIcon} />


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
                            />
                            <Text style={styles.mealName}>{item.title}</Text>
                            <Text style={styles.mealMeta}>
                                {item.time} · {item.difficulty}
                            </Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.sectionListContent}
                showsVerticalScrollIndicator={false}
                style={styles.sectionListStyle}
            />
            <ConfirmationModal
                visible={removePlan}
                title={Strings.testMealPlan_removeTitle}
                description={Strings.testMealPlan_removeDescription}
                cancelText={Strings.testMealPlan_cancel}
                confirmText={Strings.testMealPlan_remove}
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

    },
    planTitle: {
        fontSize: moderateScale(21),
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        color: Colors.primary,
    },
    planSubTitle: {
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        marginTop: verticalScale(10)
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

        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mealImage: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(10),
        marginRight: horizontalScale(12),
        backgroundColor: Colors._ccc,
    },
    mealInfo: {
        flex: 1,
        paddingVertical: verticalScale(12)
    },
    mealType: {
        fontSize: moderateScale(12),
        color: Colors._667D4C,
        fontFamily: FontFamilies.ROBOTO_MEDIUM,

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
    backIcon: {
        width: moderateScale(24),
        height: moderateScale(24),
        alignSelf: 'flex-end',
        marginRight: horizontalScale(-11),
    },
    editButton: {
        marginRight: horizontalScale(20),
    },
    editIcon: {
        width: moderateScale(24),
        height: moderateScale(24),
        alignSelf: 'flex-end',
    },
    deleteIcon: {
        width: moderateScale(24),
        height: moderateScale(24),
        alignSelf: 'flex-end',
    },
    sectionListContent: {
        paddingBottom: verticalScale(32),
    },
    sectionListStyle: {
        marginTop: verticalScale(8),
    },
});
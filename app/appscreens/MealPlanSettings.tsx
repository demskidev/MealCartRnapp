import { deleteicon, icon_edit, iconback, plusblackicon, tikicon } from '@/assets/images';
import BaseButton from '@/components/BaseButton';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');



export default function MealPlanSettings({ navigation }) {
    const [removePlan, setRemovePlan] = useState(false);
    const router = useRouter();

    const fixedMeals = ['Breakfast', 'Lunch', 'Dinner'];
    const [mealTypes, setMealTypes] = useState([]);

    const MAX_TOTAL_MEALS = 9;
    const MAX_USER_MEALS = MAX_TOTAL_MEALS - fixedMeals.length;

    const [addMore, setAddMore] = useState(false);


    const isLimitReached = mealTypes.length >= MAX_USER_MEALS;


    const handleAddType = () => {
        if (mealTypes.length >= MAX_USER_MEALS) return;

        setMealTypes(prev => [
            ...prev,
            { label: '', isEditing: true }
        ]);
    };


    const handleSaveType = (idx) => {
        const updated = [...mealTypes];
        updated[idx].isEditing = false;
        setMealTypes(updated);
    };

    const handleEditType = (idx) => {
        const updated = [...mealTypes];
        updated[idx].isEditing = true;
        setMealTypes(updated);
    };

    const handleDeleteType = (idx) => {
        const updated = [...mealTypes];
        updated.splice(idx, 1);
        setMealTypes(updated);
    };

    const combinedMeals = [
        ...fixedMeals.map(item => ({ label: item, editable: false })),
        ...mealTypes.map(item => ({
            label: item.label,
            editable: true,
            isEditing: item.isEditing
        })),
    ];



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
                <Text style={styles.backText}>{Strings.mealPlanSettings_title}</Text>
            </View>

            <Text style={styles.customizeText}>{Strings.mealPlanSettings_customize}</Text>


            <FlatList
                data={combinedMeals}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item, index }) => {
                    const userIndex = index - fixedMeals.length;

                    return (
                        <View style={styles.inputRow}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        !item.isEditing && styles.inputWithIcon,
                                    ]}
                                    value={item.label}
                                    editable={item.editable && item.isEditing}
                                    selectTextOnFocus={item.isEditing}
                                    placeholder={
                                        item.editable
                                            ? Strings.mealPlanSettings_addEveningSnacks
                                            : ''
                                    }
                                    placeholderTextColor={Colors.tertiary}
                                    onChangeText={text => {
                                        if (item.editable && item.isEditing) {
                                            handleChangeType(text, userIndex);
                                        }
                                    }}
                                />


                                {item.editable && !item.isEditing && (
                                    <TouchableOpacity
                                        onPress={() => handleEditType(userIndex)}
                                        style={styles.editIcon}
                                    >
                                        <Image
                                            source={icon_edit}
                                            style={styles.editImage}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {item.editable && item.isEditing && (
                                <TouchableOpacity
                                    onPress={() => handleSaveType(userIndex)}
                                    style={styles.deleteBtn}
                                >
                                    <Image
                                        source={tikicon}
                                        style={styles.tikIcon}
                                    />
                                </TouchableOpacity>
                            )}

                            {item.editable && !item.isEditing && (
                                <TouchableOpacity
                                    onPress={() => handleDeleteType(userIndex)}
                                    style={styles.deleteBtn}
                                >
                                    <Image
                                        source={deleteicon}
                                        style={styles.deleteIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                    );
                }}


                ListFooterComponent={
                    <>
                        <TouchableOpacity
                            style={styles.addMeal}
                            onPress={handleAddType}
                        >
                            <Text style={styles.addMoreText}>
                                {isLimitReached
                                    ? Strings.mealPlanSettings_limitReached
                                    : Strings.mealPlanSettings_addMoreType}
                            </Text>
                            {isLimitReached ? null : <Image
                                source={plusblackicon}
                                style={styles.plusBlackIcon}
                                resizeMode="contain"
                            />}

                        </TouchableOpacity>

                        <BaseButton
                            title={Strings.mealPlanSettings_save}
                            gradientButton={true}
                            textStyle={styles.savePreference}
                            width={width * 0.92}
                        />
                    </>
                }
                contentContainerStyle={styles.flatListContent}
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
        fontSize: moderateScale(21),
        color: Colors.primary,
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        marginLeft: horizontalScale(30),
    },
    savePreference: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        color: Colors.white
    },
    customizeText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.tertiary,
        fontSize: moderateScale(14),
        marginTop: verticalScale(16),
        marginBottom: verticalScale(12)
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.greysoft,
        borderRadius: moderateScale(8),
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(14),
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        borderWidth: moderateScale(1),
        borderColor: Colors.borderColor,
    },
    deleteBtn: {
        marginLeft: moderateScale(10),

        alignItems: 'center',
        justifyContent: 'center',
    },


    addMeal: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.buttonBackground,
        borderRadius: moderateScale(8),

        paddingHorizontal: horizontalScale(12),
        marginBottom: verticalScale(18),
        justifyContent: 'center',
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        marginTop: verticalScale(10),
        height: verticalScale(48),
        marginHorizontal: horizontalScale(5)
    },
    addMoreText: {
        color: Colors.textBlack,
        marginRight: horizontalScale(12),
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(16)
    },
    inputWrapper: {
        position: 'relative',
        flex: 1,
    },

    inputWithIcon: {
        paddingRight: horizontalScale(40),
    },

    editIcon: {
        position: 'absolute',
        right: horizontalScale(12),
        top: '50%',
        transform: [{ translateY: -11 }],
    },

    editImage: {
        width: verticalScale(22),
        height: verticalScale(22),
        tintColor: Colors.primary,
    },
    backIcon: {
        width: moderateScale(24),
        height: moderateScale(24),
        alignSelf: 'flex-end',
    },
    tikIcon: {
        width: verticalScale(24),
        height: verticalScale(24),
    },
    deleteIcon: {
        width: verticalScale(22),
        height: verticalScale(22),
    },
    plusBlackIcon: {
        width: verticalScale(12),
        height: verticalScale(12),
    },
    flatListContent: {
        paddingBottom: 32,
    },



});
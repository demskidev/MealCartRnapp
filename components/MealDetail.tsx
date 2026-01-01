import BaseButton from '@/components/BaseButton';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, } from '@/constants/Theme';
import { FontFamily } from '@/utils/Fonts';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfirmationModal from './ConfirmationModal';
import CreateMealBottomSheet from './CreateMealBottomSheet';
import SendToShoppingList from './SendShoppingList';
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

const MealDetail = ({ meal, onBack }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSendShoppingList, setShowSendShoppingList] = useState(false);


    const bottomSheetRef = useRef<BottomSheet>(null);

    const [selectedMeal, setSelectedMeal] = useState(null);

    const handleEditPress = () => {

        setSelectedMeal(meal);
        bottomSheetRef.current?.expand();
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerImageContainer}  >


                <ImageBackground
                    source={meal.image}
                    style={{ height: verticalScale(300), width: '100%' }}
                >

                    <TouchableOpacity onPress={onBack} style={styles.backButton} >


                        <Image
                            source={require('@/assets/images/backIcon.png')}
                            style={styles.backImage}
                            resizeMode="contain"

                        />


                    </TouchableOpacity>

                    <View style={styles.headerOverlayContent1}>
                        <View style={styles.parentOfname} >
                            <Text style={styles.title}>{meal.title}</Text>
                            <Text style={styles.info}>{meal.time} • 4 Servings • Medium</Text>
                        </View>
                        <View style={styles.parentOfAddList}>
                            <Image
                                source={require('@/assets/images/addtomeallist.png')}
                                style={styles.imageMeallist}
                                resizeMode="contain"
                            />
                            <TouchableOpacity onPress={() => setShowSendShoppingList(true)}>
                                <Image
                                    source={require('@/assets/images/addwishlisticon.png')}
                                    style={styles.imageaddToList}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>

                        </View>

                    </View>
                    <View >

                    </View>

                </ImageBackground>
            </View>

            <ScrollView style={styles.detailContent} contentContainerStyle={{ paddingBottom: 32 }}>
                <Text style={styles.description}>
                    A rich and meaty sauce served over a bed of perfectly cooked spaghetti. A timeless family favorite that everyone will love.
                </Text>
                <View style={styles.buttonRow}>
                    <BaseButton
                        title="Edit"
                        gradientButton={true}
                        textColor="#fff"
                        width={width * 0.43}
                        textStyle={styles.editButton}
                        rightChild={
                            <Image
                                source={require('@/assets/images/icon_edit.png')}
                                style={styles.editImage}
                                resizeMode="contain"
                            />
                        }
                        onPress={handleEditPress}
                    />


                    <BaseButton
                        title="Delete"
                        gradientButton={true}
                        width={width * 0.43}
                        gradientStartColor="#A62A2A"
                        gradientEndColor="#FD4B4B"
                        gradientStart={{ x: 0, y: 0 }}
                        gradientEnd={{ x: 1, y: 0 }}
                        textColor="#fff"
                        textStyle={styles.deleteButton}
                        onPress={() => setShowDeleteModal(true)}
                    />

                </View>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.divider} />
                <View style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>Spaghetti</Text>
                    <View style={styles.dividerRow} />

                    <Text style={styles.ingredientValue}>400 g</Text>
                </View>
                <View style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>Ground Beef</Text>
                    <View style={styles.dividerRow} />

                    <Text style={styles.ingredientValue}>500 g</Text>
                </View>
                <View style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>Onion</Text>
                    <View style={styles.dividerRow} />

                    <Text style={styles.ingredientValue}>1 large</Text>
                </View>
                <View style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>Garlic Cloves</Text>
                    <View style={styles.dividerRow} />

                    <Text style={styles.ingredientValue}>2</Text>
                </View>
                <View style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>Chopped Tomatoes</Text>
                    <View style={styles.dividerRow} />

                    <Text style={styles.ingredientValue}>800 g</Text>
                </View>
                <View style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>Tomato Paste</Text>
                    <View style={styles.dividerRow} />

                    <Text style={styles.ingredientValue}>2 tbsp</Text>
                </View>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <View style={styles.divider} />
                <View style={styles.instructionRow}>
                    <Text style={styles.instructionNumber}>1.</Text>
                    <Text style={styles.instructionText}>Heat olive oil in a large pan. Sauté diced onion and garlic.</Text>
                </View>
                <View style={styles.instructionRow}>
                    <Text style={styles.instructionNumber}>2.</Text>
                    <Text style={styles.instructionText}>Add ground beef and cook until browned.</Text>
                </View>
                <View style={styles.instructionRow}>
                    <Text style={styles.instructionNumber}>3.</Text>
                    <Text style={styles.instructionText}>Stir in chopped tomatoes and tomato paste. Simmer for 20 minutes.</Text>
                </View>
            </ScrollView>


            <ConfirmationModal
                visible={showDeleteModal}
                title="Delete Meal"
                description="This action is permanent and cannot be undone. You will lose access to this meal."
                cancelText="Cancel"
                confirmText="Delete"
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    setShowDeleteModal(false);

                }}
            />
            <CreateMealBottomSheet
                ref={bottomSheetRef}
                isEdit={true}
                mealData={selectedMeal}
            />
            <SendToShoppingList
                visible={showSendShoppingList}
                onClose={() => setShowSendShoppingList(false)}
            />

        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    imageMeallist: {
        width: moderateScale(56),
        height: moderateScale(42),
    },
    imageaddToList: {
        width: moderateScale(56),
        height: moderateScale(42),
    },
    backButton: {

        marginTop: verticalScale(15),



        position: 'absolute',
        top: verticalScale(24),
        left: horizontalScale(10),
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
    },
    backButtonText: {
        fontSize: 28,
        color: '#fff',
    },
    tagContainer: {

    },
    tagText: {
        fontSize: moderateScale(13),
        fontFamily: FontFamily.ROBOTO_MEDIUM,
        color: Colors.primary,
    },
    detailContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        padding: 20,
        flex: 1,
    },
    title: {
        fontSize: moderateScale(21),
        fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
        color: Colors.white,
    },
    info: {
        fontSize: moderateScale(12),
        color: Colors.white,
        marginTop: moderateScale(4),
        fontFamily: FontFamily.ROBOTO_MEDIUM,
    },
    description: {
        fontSize: moderateScale(14),
        color: Colors.tertiary,
        marginTop: moderateScale(16),
        fontFamily: FontFamily.ROBOTO_REGULAR,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 16,
        gap: 16,
    },
    editButton: {

        fontFamily: FontFamily.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        color: Colors.white
    },
    editIcon: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
    deleteButton: {

        fontFamily: FontFamily.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        color: Colors.white
    },
    sectionTitle: {
        fontSize: moderateScale(21),
        fontFamily: FontFamily.ROBOTO_MEDIUM,
        color: Colors.primary,
        marginTop: moderateScale(12),
        marginBottom: moderateScale(8),
    },
    divider: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        marginBottom: moderateScale(8),
    },
    dividerRow: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        flex: 1,
        marginHorizontal: horizontalScale(12)

    },
    ingredientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        paddingVertical: 2,
    },
    ingredientName: {
        fontSize: moderateScale(14),
        fontFamily: FontFamily.ROBOTO_MEDIUM,
        color: Colors.primary,
    },
    ingredientValue: {
        fontSize: moderateScale(14),
        fontFamily: FontFamily.ROBOTO_REGULAR,
        color: Colors.tertiary,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        marginTop: 4,
    },
    instructionNumber: {
        fontSize: moderateScale(14),
        fontFamily: FontFamily.ROBOTO_MEDIUM,
        color: Colors.primary,
        marginRight: horizontalScale(8),
        marginTop: verticalScale(2),
    },
    instructionText: {
        fontSize: moderateScale(14),
        fontFamily: FontFamily.ROBOTO_REGULAR,
        color: Colors.tertiary,
        flex: 1,
    },
    parentOfAddList: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.30,
        justifyContent: 'space-between'
    },
    image: {
        width: '100%',
        height: verticalScale(300)
    },
    headerImageContainer: {

    },
    headerOverlayContent: {

    },
    headerOverlayContent1: {

        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: verticalScale(40),
        left: horizontalScale(16),
        width: width * 0.92

    },

    backImage: {
        width: moderateScale(20),
        height: moderateScale(20)
    },
    parentOfname: {
        width: width * 0.5,
    },
    editImage: {
        width: moderateScale(20),
        height: moderateScale(20)
    }
});

export default MealDetail;
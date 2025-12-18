import BaseButton from '@/components/BaseButton';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, } from '@/constants/Theme';
import { FontFamily } from '@/utils/Fonts';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

const MealDetail = ({ meal, onBack }) => (

    <View style={styles.container}>
        <View style={styles.headerImageContainer}>
            <Image source={meal.image} style={styles.image} resizeMode="cover" />
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                {/* <Text style={styles.backButtonText}>{'←'}</Text> */}
         <Image
                        source={require('@/assets/images/backIcon.png')}
                        style={styles.backImage}
                        resizeMode="contain"
                    />
            </TouchableOpacity>
            {/* <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{meal.tag}</Text>
            </View> */}
            <View style={styles.headerOverlayContent}>
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
                    <Image
                        source={require('@/assets/images/addwishlisticon.png')}
                        style={styles.imageaddToList}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
        <ScrollView style={styles.detailContent} contentContainerStyle={{ paddingBottom: 32 }}>
            <Text style={styles.description}>
                A rich and meaty sauce served over a bed of perfectly cooked spaghetti. A timeless family favorite that everyone will love.
            </Text>
            <View style={styles.buttonRow}>
                <BaseButton
                    title="Edit"
                    gradientButton={false}
                    backgroundColor={Colors.olive}
                    textColor="#fff"
                    textStyle={styles.editButton}
                    leftChild={<Text style={styles.editIcon}>✎</Text>}
                />
                <BaseButton
                    title="Delete"
                    gradientButton={false}
                    backgroundColor={Colors.primary || '#D32F2F'}
                    textColor="#fff"
                    textStyle={styles.deleteButton}
                />
            </View>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.divider} />
            {/* Example ingredients, replace with meal.ingredients if available */}
            <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Spaghetti</Text>
            <View style={styles.dividerRow} />

                <Text style={styles.ingredientValue}>400 g</Text>
            </View>
            <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Ground Beef</Text>
                
                <Text style={styles.ingredientValue}>500 g</Text>
            </View>
            <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Onion</Text>
                <Text style={styles.ingredientValue}>1 large</Text>
            </View>
            <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Garlic Cloves</Text>
                <Text style={styles.ingredientValue}>2</Text>
            </View>
            <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Chopped Tomatoes</Text>
                <Text style={styles.ingredientValue}>800 g</Text>
            </View>
            <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Tomato Paste</Text>
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
    </View >
);

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
        position: 'absolute',
        top: verticalScale(24),
        left: horizontalScale(16),
        zIndex: 2,
        // backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 4,
    },
    backButtonText: {
        fontSize: 28,
        color: '#fff',
    },
    tagContainer: {
        position: 'absolute',
        top: verticalScale(24),
        right: horizontalScale(16),
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
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
        color:Colors.white,
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
        backgroundColor: Colors.olive,
        borderRadius: 8,
        paddingHorizontal: 32,
        paddingVertical: 10,
        fontFamily: FontFamily.ROBOTO_MEDIUM,
        fontSize: 16,
    },
    editIcon: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
    deleteButton: {
        backgroundColor: Colors.primary || '#D32F2F',
        borderRadius: 8,
        paddingHorizontal: 32,
        paddingVertical: 10,
        fontFamily: FontFamily.ROBOTO_MEDIUM,
        fontSize: 16,
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
        // marginBottom: moderateScale(8),
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
        flex: 1,
    },
    ingredientValue: {
        fontSize: moderateScale(14),
        fontFamily: FontFamily.ROBOTO_REGULAR,
        color: Colors.tertiary,
        marginLeft: horizontalScale(8),
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
        width:width *0.30,
        justifyContent:'space-between'
    },
    image: {
        width: '100%',
        height: verticalScale(300)
    },
    headerImageContainer: {
        position: 'relative',
        width: '100%',
        height: verticalScale(300),
        backgroundColor: Colors.background,
        marginBottom:verticalScale(20)
    },
    headerOverlayContent: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: verticalScale(16),
        paddingHorizontal: horizontalScale(16),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    imageMeallist: {
        width: moderateScale(56),
        height: moderateScale(42),
        marginRight: moderateScale(8),
    },
    imageaddToList: {
        width: moderateScale(56),
        height: moderateScale(42),
    },
    backImage:{
        width:moderateScale(20),
        height:moderateScale(20)
    },
    parentOfname:{
        width:width *0.58,
    }
});

export default MealDetail;
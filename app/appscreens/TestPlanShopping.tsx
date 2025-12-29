
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { Checkbox, IconButton, ProgressBar } from 'react-native-paper';
import ProgressBar from '@/components/ProgressBar';
import { SafeAreaView } from 'react-native-safe-area-context';
const data = [
    { id: '1', category: 'Bakery', name: 'Whole-grain bread', amount: '1 slice (Avocado Toast with Egg)' },
    { id: '2', category: 'Dairy', name: 'Egg', amount: '1 (Avocado Toast with Egg)' },
    { id: '3', category: 'Pantry', name: 'Red pepper flakes', amount: '1 pinch (Avocado Toast with Egg)' },
    { id: '4', category: 'Produce', name: 'Avocado', amount: '0.5 (Avocado Toast with Egg)' },

];
export default function TestPlanShopping() {
    const [checked, setChecked] = useState<number[]>([]);
    const router = useRouter();


    const toggleCheck = (id: number) => {
        setChecked((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const renderIngredientItem = ({ item }: { item: { id: string; category: string; name: string; amount: string } }) => (
        <View>
            <Text style={styles.sectionTitle}>{item.category}</Text>
            <View style={styles.dividerRow} />
            <View style={styles.cardCategory}>
                <View style={styles.checkboxRow}>
                    <View style={styles.checkbox} />
                    <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.amount}>{item.amount}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
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
                <Text style={styles.backText}>Back to Lists</Text>
            </View>

            <View style={styles.titleRow}>

                <Text style={styles.planTitle}>Test Plan ShoppingList</Text>

                <View style={styles.editdelete}>
                    <TouchableOpacity style={{ marginRight: horizontalScale(20) }} onPress={() => router.push('./CreateMealPlan')}   >
                        <Image source={require("@/assets/images/iconedit.png")} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24), alignSelf: 'flex-end', }} />

                    </TouchableOpacity>
                    <TouchableOpacity >
                        <Image source={require("@/assets/images/delete.png")} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24), alignSelf: 'flex-end', }} />


                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.planSubTitle}>1 meal</Text>



            <ProgressBar
                progress={0.6}
                label="Progress"
                progressText="2/4"
                containerStyle={styles.progressbar}


            />


            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={renderIngredientItem}
                scrollEnabled={false}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: horizontalScale(20) },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 8 },
    actions: { flexDirection: 'row' },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10 },
    progressLabel: { color: '#888', fontWeight: '600', fontSize: 14 },
    progressCount: { marginLeft: 'auto', color: '#888', fontWeight: '600', fontSize: 14 },
    progressBar: { height: 7, borderRadius: 5, marginHorizontal: 16, marginTop: 2, backgroundColor: '#E6EDE1' },
    listContainer: { flex: 1, marginTop: 10 },
    itemBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FBF6', marginHorizontal: 12, marginVertical: 4, borderRadius: 12, padding: 12, elevation: 1 },
    itemName: { fontWeight: 'bold', fontSize: 16, color: '#222' },
    itemDetail: { color: '#888', fontSize: 13 },
    bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 70, backgroundColor: '#F8FBF6', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    selectedTab: { alignItems: 'center', justifyContent: 'center' },
    selectedTabText: { color: '#3B5D3A', fontSize: 13, fontWeight: '600', marginTop: -6 },

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
    editdelete: {
        flexDirection: 'row',
        alignItems: 'center'
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
    sectionTitle: { fontSize: moderateScale(12), fontFamily: FontFamilies.ROBOTO_SEMI_BOLD, color: Colors.primary, marginBottom: verticalScale(10) },
    dividerRow: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        flex: 1,

        marginBottom: verticalScale(10)

    },
    cardCategory: {








        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        padding: moderateScale(10),
        marginBottom: verticalScale(10),
        elevation: 2,
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        marginHorizontal: moderateScale(3)
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: moderateScale(19),
        height: moderateScale(19),
        borderWidth: moderateScale(1),
        borderColor: Colors.tertiary,
        borderRadius: moderateScale(1),
        marginRight: horizontalScale(10),
    },
    name: {
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        fontSize: moderateScale(12),
        color: Colors.primary,
    },
    amount: {
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(10),
        color: Colors.primary,
        marginTop: moderateScale(2),
    },
    progressbar: {
        marginVertical: verticalScale(20)
    }
});
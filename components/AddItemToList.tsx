
import { CheckBox, SearchIcon } from '@/assets/svg';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, } from 'react-native';
import BaseButton from './BaseButton';
import CustomStepper from './CustomStepper';
import CustomTextInput from './CustomTextInput';

const mealsData = [
    { id: '1', name: 'Classic Spaghetti Bolognese', image: require('@/assets/images/burger.png') },
    { id: '2', name: 'Classic Spaghetti Bolognese', image: require('@/assets/images/burger.png') },
    { id: '3', name: 'Classic Spaghetti Bolognese', image: require('@/assets/images/burger.png') },
];
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window')
const renderMealItem = ({ item }) => (
    <View style={styles.mealCard}>
        <Image source={item.image} style={styles.mealImage} resizeMode='cover' />
        <Text style={styles.mealName}>{item.name}</Text>
        {/* <View style={styles.checkbox} /> */}
        <CheckBox width={verticalScale(22)} height={verticalScale(22)} color={Colors.tertiary} style={styles.checkboxIcon} />

    </View>
);

const AddItemToList = ({ visible, onClose }) => {
    const [search, setSearch] = useState('');

    const [manualInput, setManualInput] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [pendingItems, setPendingItems] = useState<{ id: string; value: string }[]>([]);
    const [manualList, setManualList] = useState<{ id: string; value: string }[]>([]);
    const [unitWeight, setUnitweight] = useState('100 grms');
    const unitWeightOptions = ['100grm', '200grm', '1kg'];
    const unitWeightIndex = unitWeightOptions.indexOf(unitWeight);
    const [itemWeights, setItemWeights] = useState<Record<string, number>>({});


    useEffect(() => {
        const initialWeights: Record<string, number> = {};
        suggestions.forEach(item => {
            initialWeights[item] = 0;
        });
        setItemWeights(initialWeights);
    }, [suggestions]);

    // Selected from suggestions but NOT added yet
    const handleSearch = (text: string) => {
        setSearchText(text);

        if (!text.trim()) {
            setSuggestions([]);
            return;
        }

        const filtered = INGREDIENTS.filter(item =>
            item.toLowerCase().includes(text.toLowerCase())
        );

        setSuggestions(filtered);
    };
    const handleSelectSuggestion = (value: string) => {
        // prevent duplicates
        if (
            pendingItems.some(i => i.value === value) ||
            manualList.some(i => i.value === value)
        ) {
            setSuggestions([]);
            setSearchText('');
            return;
        }

        setPendingItems(prev => [
            ...prev,
            { id: Date.now().toString(), value }
        ]);

        setSearchText('');
        setSuggestions([]);
    };


    const manualItems = [
        { id: '1', value: '1 egg' },
    ];
    const handleAddPendingItem = (item: { id: string; value: string }) => {
        setManualList(prev => [...prev, item]);
        setPendingItems(prev => prev.filter(i => i.id !== item.id));
    };

    const INGREDIENTS = [
        'Tomato',
        'Onion',
        'Potato',
        'Garlic',
        'Carrot',
        'Capsicum',
        'Cucumber',

        'Olive Oil',
    ];




    const handleAddItem = (value: string) => {
        if (!value.trim()) return;

        setManualList(prev => [
            ...prev,
            { id: Date.now().toString(), value },
        ]);

        setManualInput('');
        setFilteredSuggestions([]);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >


            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFillObject} />
                </TouchableWithoutFeedback>

                <View style={styles.container}>
                    <Text style={styles.title}>Select Meals to Shop For</Text>
                    <Text style={styles.subtitle}>
                        Choose one or more meals to generate a combined list.
                    </Text>

                    <View style={styles.searchBox}>
                        <SearchIcon width={verticalScale(22)} height={verticalScale(22)} color={Colors.tertiary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search your meals..."
                            placeholderTextColor={Colors.tertiary}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <View style={styles.dividerRow} />


                    <FlatList
                        data={mealsData}
                        keyExtractor={item => item.id}
                        renderItem={renderMealItem}
                        contentContainerStyle={{ paddingBottom: verticalScale(12) }}
                        ItemSeparatorComponent={() => <View style={{ height: verticalScale(10) }} />}
                        style={{ marginTop: verticalScale(10) }}
                    />

                    <View style={styles.divider} />

                    <Text style={styles.addManualLabel}>Add item Manually</Text>

                    <CustomTextInput
                        placeholder="Search Ingredient"
                        style={styles.manualInput}
                        placeholderTextColor={Colors.tertiary}
                        onChangeText={handleSearch}
                        value={searchText}
                    />

                    {/* {suggestions.length > 0 && (
                        <View style={styles.suggestionContainer}>
                            {suggestions.map(item => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => handleSelectSuggestion(item)}
                                    style={styles.suggestionItem}
                                >
                                    <Text style={styles.suggestionText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )} */}

                    {suggestions.length > 0 && (
                        <FlatList
                            data={suggestions}
                            keyExtractor={item => item}
                            style={{ maxHeight: 200 }}
                            renderItem={({ item }) => (
                                <View>

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: Colors.white,
                                            // borderRadius: moderateScale(8),
                                            //  borderWidth: 1,
                                            // borderColor: Colors.borderColor,
                                            // marginBottom: verticalScale(8),
                                            paddingHorizontal: horizontalScale(12),
                                            // height: verticalScale(48),
                                            justifyContent: 'space-between',
                                        }}
                                    >

                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => handleSelectSuggestion(item)}
                                            style={{ width: width * 0.5, height: verticalScale(40), justifyContent: 'center', }}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: FontFamilies.ROBOTO_REGULAR,
                                                    fontSize: moderateScale(12),
                                                    color: Colors.tertiary,
                                                }}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>


                                        <View style={styles.rowItem}>
                                            <CustomStepper
                                                value={unitWeightOptions[itemWeights[item] ?? 0]} // <-- Correct value per item
                                                onIncrement={() => {
                                                    setItemWeights(prev => {
                                                        const current = prev[item] ?? 0;
                                                        return {
                                                            ...prev,
                                                            [item]: Math.min(current + 1, unitWeightOptions.length - 1),
                                                        };
                                                    });
                                                }}
                                                onDecrement={() => {
                                                    setItemWeights(prev => {
                                                        const current = prev[item] ?? 0;
                                                        return {
                                                            ...prev,
                                                            [item]: Math.max(current - 1, 0),
                                                        };
                                                    });
                                                }}
                                                containerStyle={{
                                                    backgroundColor: Colors.white,
                                                    borderRadius: moderateScale(8),
                                                    elevation: 4,
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.25,
                                                    shadowRadius: 3.84,
                                                }}
                                            />



                                        </View>
                                    </View>

                                    <View style={styles.dividerRowList} />
                                </View>


                            )}
                        />

                    )}




                    <FlatList
                        data={[...pendingItems, ...manualList]}
                        keyExtractor={item => item.id}
                        style={{ maxHeight: verticalScale(250) }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const isPending = pendingItems.some(i => i.id === item.id);

                            return (
                                <View style={styles.manualAddRow}>
                                    {isPending ? (
                                        <>
                                            <TextInput
                                                style={styles.manualAddInput}
                                                value={item.value}
                                                editable={isPending}
                                            />
                                            <TouchableOpacity
                                                style={styles.addButton}
                                                onPress={() => handleAddPendingItem(item)}
                                            >
                                                <Text style={styles.addButtonText}>Add</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
                                            <TextInput
                                                style={[styles.manualAddInput, { marginRight: 0, paddingRight: 36 }]}
                                                value={item.value}
                                                editable={false}
                                            />
                                            <TouchableOpacity
                                                onPress={() =>
                                                    setManualList(prev => prev.filter(i => i.id !== item.id))
                                                }
                                                style={{
                                                    position: 'absolute',
                                                    right: 10,
                                                    top: 0,
                                                    height: '100%',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Image
                                                    source={require("@/assets/images/close-icon.png")}
                                                    style={{ width: 22, height: 22 }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                    />



                    <View style={styles.footer}>


                        <BaseButton
                            title="Cancel"
                            gradientButton={false}
                            // backgroundColor={Colors.olive}
                            textColor="#fff"
                            width={width * 0.42}
                            textStyle={styles.cancelButton}
                            textStyleText={styles.cancelButtonText}
                        // rightChild={
                        //     <IconCart width={moderateScale(20)} height={moderateScale(20)} />
                        // }
                        // onPress={handleEditPress}
                        />
                        <BaseButton
                            title="Generate List"
                            gradientButton={true}
                            // backgroundColor={Colors.olive}
                            textColor="#fff"
                            width={width * 0.42}
                            textStyle={styles.confirmButton}
                            textStyleText={styles.confirmButtonText}
                        // rightChild={
                        //     <IconCart width={moderateScale(20)} height={moderateScale(20)} />
                        // }
                        // onPress={handleEditPress}
                        />

                    </View>
                </View>
            </View>


        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: Colors.white,
        borderRadius: moderateScale(18),
        paddingHorizontal: horizontalScale(18),
        paddingTop: verticalScale(5),
        paddingBottom: verticalScale(15),
        width: '92%',
        alignSelf: 'center',
    },
    title: {
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        fontSize: moderateScale(18),
        color: Colors.primary,
        marginTop: verticalScale(10),
        marginBottom: verticalScale(2),
    },
    subtitle: {
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        marginBottom: verticalScale(16),
        marginTop: verticalScale(8)
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(30),
        borderWidth: moderateScale(1),
        borderColor: Colors.borderColor,
        paddingHorizontal: horizontalScale(12),
        height: verticalScale(44),
        marginBottom: verticalScale(8),
    },
    searchInput: {
        flex: 1,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(15),
        color: Colors.primary,
        marginLeft: horizontalScale(8),
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(12),
        marginRight: horizontalScale(2),
        marginLeft: horizontalScale(1),
        // paddingHorizontal: horizontalScale(10),
        elevation: 4,

        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: verticalScale(3)
    },
    mealImage: {
        // width: verticalScale(48),
        // height: verticalScale(48),
        borderRadius: moderateScale(8),
        marginRight: horizontalScale(12),
    },
    mealName: {
        flex: 1,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(14),
        color: Colors.primary,
    },
    checkbox: {
        width: verticalScale(24),
        height: verticalScale(24),
        borderWidth: moderateScale(2),
        borderColor: Colors.borderColor,
        borderRadius: moderateScale(6),
        backgroundColor: Colors.white,
    },
    divider: {
        marginTop: verticalScale(9),
        marginBottom: verticalScale(18),
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        // flex: 1,

    },
    addManualLabel: {
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(14),
        color: Colors.primary,
        marginBottom: verticalScale(6),
    },
    manualInput: {
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        borderWidth: moderateScale(1),
        borderColor: Colors.borderColor,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(12),
        color: Colors.primary,
        paddingHorizontal: horizontalScale(10),
        height: verticalScale(40),
        marginBottom: verticalScale(6),
    },
    manualItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        borderWidth: moderateScale(1),
        borderColor: Colors.borderColor,
        paddingHorizontal: horizontalScale(10),
        height: verticalScale(40),
        marginBottom: verticalScale(6),
    },
    manualItemText: {
        flex: 1,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(15),
        color: Colors.primary,
    },
    manualAddRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    manualAddInput: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        // borderWidth: moderateScale(1),
        // borderColor: Colors.borderColor,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        paddingHorizontal: horizontalScale(10),
        height: verticalScale(40),
        marginRight: horizontalScale(8),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButton: {
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        // borderWidth: moderateScale(1),
        // borderColor: Colors.primary,
        paddingHorizontal: horizontalScale(18),
        height: verticalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(14),
        color: Colors.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(10),
    },
    cancelButton: {
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        borderWidth: moderateScale(1),
        borderColor: Colors.borderColor,
        // flex: 1,
        marginRight: horizontalScale(8),
        // height: verticalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(14),
        color: Colors.primary,
    },
    generateButton: {
        backgroundColor: '#7B8756',
        borderRadius: moderateScale(8),
        flex: 1,
        marginLeft: horizontalScale(8),
        height: verticalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    generateButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        color: Colors.white,
    },
    checkboxIcon: {
        marginRight: horizontalScale(10)
    },
    dividerRow: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        // flex: 1,

        marginVertical: verticalScale(15)

    },
    confirmButton: {
        //  flex: 1,
        // backgroundColor: '#9DAF89',
        borderRadius: moderateScale(8),
        // paddingVertical: verticalScale(12),
        alignItems: 'center',
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.white,
        fontSize: moderateScale(14),
        // marginLeft: horizontalScale(8),
    },
    confirmButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.white,
        fontSize: moderateScale(14),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(18),
    },
    rowItem: {
        minWidth: 100, alignSelf: 'center', marginBottom: verticalScale(-8)


    },
    label: { fontSize: moderateScale(12), marginTop: moderateScale(8), marginBottom: moderateScale(4), fontFamily: FontFamilies.ROBOTO_REGULAR, color: Colors.primary },
    suggestionButton: {
        backgroundColor: 'red'
    },
    dividerRowList: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        flex: 1,

        marginVertical: verticalScale(8)
    }


});

export default AddItemToList;
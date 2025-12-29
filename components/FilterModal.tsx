import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BaseButton from './BaseButton';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const difficulties = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const prepTimes = ['< 5 Mins', '5 - 10 Mins', '10 - 15 Mins', '> 15 Mins'];

const FilterModal = ({ visible, onClose, onConfirm, onReset }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [selectedPrepTime, setSelectedPrepTime] = useState(null);
    const handleReset = () => {
        setSelectedCategory(null);
        setSelectedDifficulty(null);
        setSelectedPrepTime(null);
        if (onReset) onReset();
        if (onClose) onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFillObject} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                    <View style={styles.filterWithClose}>

                        <Text style={styles.title}>Filters</Text>
                        <TouchableOpacity onPress={onClose} >
                            <Image
                                source={require("@/assets/images/close-icon.png")}
                                style={{ width: verticalScale(24), height: verticalScale(24) }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.chipRow}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.chip,
                                    selectedCategory === cat && styles.chipSelected,
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedCategory === cat && styles.chipTextSelected,
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Difficulty</Text>
                    <View style={styles.chipRow}>
                        {difficulties.map(diff => (
                            <TouchableOpacity
                                key={diff}
                                style={[
                                    styles.chip,
                                    selectedDifficulty === diff && styles.chipSelected,
                                ]}
                                onPress={() => setSelectedDifficulty(diff)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedDifficulty === diff && styles.chipTextSelected,
                                    ]}
                                >
                                    {diff}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Prep Time</Text>
                    <View style={styles.chipRow}>
                        {prepTimes.map(time => (
                            <TouchableOpacity
                                key={time}
                                style={[
                                    styles.chip,
                                    selectedPrepTime === time && styles.chipSelected,
                                ]}
                                onPress={() => setSelectedPrepTime(time)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedPrepTime === time && styles.chipTextSelected,
                                    ]}
                                >
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.footer}>


                        <BaseButton
                            title="Reset"
                            gradientButton={false}
                            textColor="#fff"
                            width={width * 0.42}
                            textStyle={styles.cancelButton}
                            textStyleText={styles.cancelButtonText}
                            onPress={handleReset}
                        />
                        <BaseButton
                            title="Confirm"
                            gradientButton={true}
                            textColor="#fff"
                            width={width * 0.42}
                            textStyle={styles.confirmButton}
                            textStyleText={styles.confirmButtonText}
                            onPress={() => {
                                if (onConfirm) {
                                    onConfirm({
                                        category: selectedCategory,
                                        difficulty: selectedDifficulty,
                                        prepTime: selectedPrepTime,
                                    });
                                }
                                if (onClose) onClose();
                            }}
                        />

                    </View>


                </View>
            </View>
        </Modal>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.10)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.92,
        backgroundColor: Colors.white,
        borderRadius: moderateScale(22),
        padding: horizontalScale(20),
        paddingTop: verticalScale(24),
        paddingBottom: verticalScale(18),
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        right: horizontalScale(16),
        top: verticalScale(14),
        zIndex: 2,
    },
    title: {
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        fontSize: moderateScale(21),
        color: Colors.primary,
        // marginBottom: verticalScale(10),
    },
    label: {
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        fontSize: moderateScale(14),
        color: Colors.primary,
        marginTop: verticalScale(12),
        marginBottom: verticalScale(13)

        // marginTop: verticalScale(10),
        // marginBottom: verticalScale(6),
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: verticalScale(8),
    },
    chip: {
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: moderateScale(20),
        paddingHorizontal: horizontalScale(11),
        paddingVertical: verticalScale(7),
        marginRight: horizontalScale(10),
        marginBottom: verticalScale(8),
        backgroundColor: Colors.white,
    },
    chipSelected: {
        backgroundColor: '#EAF1E2',
        borderColor: '#7B8756',
    },
    chipText: {
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(14),
        color: Colors.primary,
    },
    chipTextSelected: {
        color: '#7B8756',
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: verticalScale(12),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(8),
    },
    resetBtn: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        borderRadius: moderateScale(10),
        paddingVertical: verticalScale(12),
        marginRight: horizontalScale(10),
        alignItems: 'center',
    },
    resetText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(17),
        color: Colors.tertiary,
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#7B8756',
        borderRadius: moderateScale(10),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
    },
    confirmText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(17),
        color: Colors.white,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(18),
    },
    cancelButton: {
        // flex: 1,
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        borderWidth: moderateScale(1),
        borderRadius: moderateScale(8),
        paddingVertical: verticalScale(12),
        marginRight: horizontalScale(8),
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.primary,
        fontSize: moderateScale(14),
    },
    confirmButton: {
        //  flex: 1,
        // backgroundColor: '#9DAF89',
        borderRadius: moderateScale(8),
        // paddingVertical: verticalScale(12),
        alignItems: 'center',
        // marginLeft: horizontalScale(8),
    },
    confirmButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.white,
        fontSize: moderateScale(14),
    },
    filterWithClose: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

export default FilterModal;
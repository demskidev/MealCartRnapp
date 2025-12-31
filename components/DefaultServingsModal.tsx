import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import BaseButton from './BaseButton';
import CustomStepper from './CustomStepper';
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');
export default function DefaultServingsModal({ visible, onClose, onSave }) {
    const [selected, setSelected] = useState('1');
    const servingsOptions = ['1', '2', '3', '4', '5', '6'];
    const [servings, setServings] = useState('1');


    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFillObject} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Default Servings</Text>
                    <Text style={styles.subtitle}>
                        You can set your meals servings for all your new meals.
                    </Text>
                    {/* <Text style={styles.label}>Servings</Text> */}
                    {/* <View style={styles.dropdownBox}>
                        <TouchableOpacity
                            style={styles.dropdown}
                            activeOpacity={0.7}
                        // You can replace this with a real dropdown if you have one
                        >
                            <Text style={styles.dropdownText}>{selected}</Text>
                            <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                   
                    </View> */}
                    <View >
                        <Text style={styles.label}>Servings</Text>
                        <CustomStepper value={servings} onIncrement={() => setServings(s => String(Number(s) + 1))} onDecrement={() => setServings(s => String(Math.max(1, Number(s) - 1)))} />
                    </View>

                    <View style={styles.footer}>


                        <BaseButton
                            title="Cancel"
                            gradientButton={false}
                            textColor="#fff"
                            width={width * 0.35}
                            textStyle={styles.cancelButton}
                            textStyleText={styles.cancelButtonText}
                            onPress={onClose}
                        />
                        <BaseButton
                            title="Save"
                            gradientButton={true}
                            textColor="#fff"
                            width={width * 0.35}
                            textStyle={styles.confirmButton}
                            textStyleText={styles.confirmButtonText}
                            onPress={onClose}
                        />

                    </View>

                </View>

            </View>

        </Modal >
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(30,30,30,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(16),
        padding: moderateScale(22),
        alignItems: 'stretch',
        elevation: 8,
    },
    title: {
        fontSize: moderateScale(21),
        marginBottom: verticalScale(6),
        color: Colors.primary,
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD
    },
    subtitle: {
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        marginBottom: verticalScale(18),
    },
    label: {
        fontSize: moderateScale(12),
        color: Colors.primary,
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        marginBottom: 6,
        fontWeight: '500',
    },
    dropdownBox: {
        marginBottom: 24,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAF7',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 14,
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontSize: 15,
        color: '#222',
    },
    dropdownArrow: {
        fontSize: 16,
        color: '#586E3F',
        marginLeft: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 14,
        alignItems: 'center',
        marginRight: 8,
    },
    cancelText: {
        color: '#222',
        fontSize: 16,
        fontWeight: '500',
    },
    saveBtn: {
        flex: 1,
        backgroundColor: '#7a9256',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginLeft: 8,
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(18),
    },
    cancelButton: {
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
    // rowItem: { flex: 1, minWidth: 80, },

});
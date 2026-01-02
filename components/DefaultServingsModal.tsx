import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
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
                    <Text style={styles.title}>{Strings.defaultServings_title}</Text>
                    <Text style={styles.subtitle}>
                        {Strings.defaultServings_subtitle}
                    </Text>

                    <View >
                        <Text style={styles.label}>{Strings.defaultServings_label}</Text>
                        <CustomStepper value={servings} onIncrement={() => setServings(s => String(Number(s) + 1))} onDecrement={() => setServings(s => String(Math.max(1, Number(s) - 1)))} />
                    </View>

                    <View style={styles.footer}>


                        <BaseButton
                            title={Strings.defaultServings_cancel}
                            gradientButton={false}
                            textColor={Colors.background}
                            width={width * 0.35}
                            textStyle={styles.cancelButton}
                            textStyleText={styles.cancelButtonText}
                            onPress={onClose}
                        />
                        <BaseButton
                            title={Strings.defaultServings_save}
                            gradientButton={true}
                            textColor={Colors.background}
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


    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
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
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    confirmButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.white,
        fontSize: moderateScale(14),
    },

});
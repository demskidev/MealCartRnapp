import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import BaseButton from './BaseButton';

const { width } = Dimensions.get('window');

type ConfirmationModalProps = {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    cancelText?: string;
    confirmText?: string;
    confirmGradientStart?: string;
    confirmGradientEnd?: string;
};

const ConfirmationModal = ({
    visible,
    onCancel,
    onConfirm,
    title = Strings.confirmationModal_title,
    description = Strings.confirmationModal_description,
    cancelText = Strings.confirmationModal_cancel,
    confirmText = Strings.confirmationModal_confirm,
    confirmGradientStart = Colors._A62A2A,
    confirmGradientEnd = Colors._FD4B4B,
}: ConfirmationModalProps) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
    >
        <View style={styles.overlay}>
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                    {description}
                </Text>


                <View style={styles.buttonRow}>

                    <BaseButton
                        title={cancelText}
                        gradientButton={false}
                        textColor={Colors.background}
                        width={width * 0.38}
                        textStyle={styles.editButton}
                        textStyleText={styles.textstyle}
                        onPress={onCancel}
                    />


                    <BaseButton
                        title={confirmText}
                        gradientButton={true}
                        width={width * 0.38}
                        gradientStartColor={Colors._A62A2A}
                        gradientEndColor={Colors._FD4B4B}
                        gradientStart={{ x: 0, y: 0 }}
                        gradientEnd={{ x: 1, y: 0 }}
                        textColor={Colors.background}
                        textStyle={styles.deleteButton}
                        onPress={onConfirm}
                    />

                </View>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        backgroundColor: Colors.white,
        borderRadius: moderateScale(14),
        padding: moderateScale(22),
        alignItems: 'center',
    },
    title: {
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        fontSize: moderateScale(21),
        color: Colors.primary,
        marginBottom: verticalScale(10),
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        textAlign: 'center',
        marginBottom: verticalScale(24),
        lineHeight: moderateScale(20),
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 16,
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        borderWidth: 1,
        borderRadius: moderateScale(8),
        paddingVertical: verticalScale(12),
        marginRight: horizontalScale(8),
        alignItems: 'center',
    },
    cancelText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.primary,
        fontSize: moderateScale(16),
    },

    deleteText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.white,
        fontSize: moderateScale(16),
    },
    editButton: {

        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        borderWidth: moderateScale(1),
        borderColor: Colors.borderColor
    },
    deleteButton: {

        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        color: Colors.white
    },
    textstyle: {
        color: Colors.primary,
        fontSize: moderateScale(14),

        fontFamily: FontFamilies.ROBOTO_MEDIUM
    }

});

export default ConfirmationModal;
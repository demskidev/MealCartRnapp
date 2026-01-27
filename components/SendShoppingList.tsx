import { createlist } from '@/assets/images';
import BaseButton from '@/components/BaseButton';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRef } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import CreateNewListBottomSheet, { CreateNewListBottomSheetRef } from './CreateNewListBottomSheet';

const shoppingLists = [
    { id: '1', name: 'Test Plan', created: 'October 2, 2025' },
    { id: '2', name: 'Test Plan 2', created: 'October 1, 2025' },
];
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window')

interface SendToShoppingListProps {
    visible: boolean;
    onClose: () => void;
}

const SendToShoppingList = ({ visible, onClose }: SendToShoppingListProps) => {

    const createNewListRef = useRef<CreateNewListBottomSheetRef>(null);

    return (
        <View>
            <Modal
                transparent
                animationType="fade"
                visible={visible}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{Strings.sendShoppingList_title}</Text>

                    </View>

                    <Text style={styles.subtitle}>
                        {Strings.sendShoppingList_subtitle}
                    </Text>


                    <BaseButton
                        title={Strings.sendShoppingList_createNewList}
                        gradientButton={true}
                        textColor={Colors.background}
                        textStyle={styles.createButtonText}
                        rightChild={
                            <Image source={createlist} resizeMode="contain" style={styles.createListIcon} />
                        }
                        onPress={() => {
                            createNewListRef.current?.expand();
                        }}
                    />
                    <View style={styles.dividerRow} />

                    <Text style={styles.availableLists}>{Strings.sendShoppingList_availableLists}</Text>

                    <FlatList
                        data={shoppingLists}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.listItem}>
                                <View>
                                    <Text style={styles.listTitle}>{item.name}</Text>
                                    <Text style={styles.listDate}>{Strings.sendShoppingList_created} {item.created}</Text>
                                </View>


                                <BaseButton
                                    title={Strings.sendShoppingList_add}
                                    gradientButton={false}
                                    textColor={Colors.background}
                                    width={width * 0.35}
                                    textStyle={styles.addButton}
                                    textStyleText={styles.addButtonText}
                                />

                            </View>
                        )}

                    />

                    <View style={styles.footer}>


                        <BaseButton
                            title={Strings.sendShoppingList_cancel}
                            gradientButton={false}
                            textColor={Colors.background}
                            width={width * 0.35}
                            textStyle={styles.cancelButton}
                            textStyleText={styles.cancelButtonText}
                            onPress={onClose}
                        />
                        <BaseButton
                            title={Strings.sendShoppingList_confirm}
                            gradientButton={true}
                            textColor={Colors.background}
                            width={width * 0.35}
                            textStyle={styles.confirmButton}
                            textStyleText={styles.confirmButtonText}
                            onPress={onClose}
                        />

                    </View>
                </View>
                <CreateNewListBottomSheet ref={createNewListRef} />

            </Modal>

        </View>
    );
};

export default SendToShoppingList;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -0.5 * 350 }, { translateY: -0.5 * 500 }], // Adjust width/height
        width: moderateScale(350),
        maxHeight: verticalScale(500),
        backgroundColor: Colors.white,
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    title: {
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        fontSize: moderateScale(21),
        color: Colors.primary,
    },
    subtitle: {
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        marginBottom: verticalScale(14),
        marginVertical: verticalScale(9)
    },

    createButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.white,
        fontSize: moderateScale(16),
    },
    createListIcon: {
        width: moderateScale(18),
        height: moderateScale(18),
    },
    availableLists: {
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        fontSize: moderateScale(14),
        color: Colors.tertiary,
        marginBottom: verticalScale(11),
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        marginVertical: verticalScale(6),
        paddingHorizontal: moderateScale(9),
        marginHorizontal: horizontalScale(2),

        elevation: 4,

        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    listTitle: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(14),
        color: Colors.primary,
    },
    listDate: {
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        fontSize: moderateScale(10),
        color: Colors.tertiary,
        marginTop: verticalScale(4),
    },
    addButton: {
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        borderWidth: moderateScale(1),
        borderRadius: moderateScale(8),
        paddingVertical: verticalScale(3),
        paddingHorizontal: horizontalScale(4),

    },
    addButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.primary,
        fontSize: moderateScale(14),

    },
    separator: {
        height: verticalScale(1),
        backgroundColor: Colors.borderColor,
        marginVertical: verticalScale(2),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(18),
    },
    cancelButton: {
        flex: 1,
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
    dividerRow: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        flex: 1,

        marginVertical: verticalScale(18)

    },

});

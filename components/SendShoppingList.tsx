import { IconCart } from '@/assets/svg';
import BaseButton from '@/components/BaseButton';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRef } from 'react';
import { Dimensions, FlatList, Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
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
                <View style={styles.overlay}  />
                </TouchableWithoutFeedback>

                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Send To Shopping List</Text>
                        {/* <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={moderateScale(20)} color={Colors.primary} />
                    </TouchableOpacity> */}
                    </View>

                    <Text style={styles.subtitle}>
                        You can choose from existing list to add this item’s shopping requirements.
                    </Text>

                    {/* <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText}>Create New List</Text>
                    <Ionicons name="cart-outline" size={verticalScale(18)} color={Colors.white} style={{ marginLeft: horizontalScale(8) }} />
                </TouchableOpacity> */}
                    <BaseButton
                        title="Create New List"
                        gradientButton={true}
                        // backgroundColor={Colors.olive}
                        textColor="#fff"
                        // width={width * 0.43}
                        textStyle={styles.createButtonText}
                        rightChild={
                            <IconCart width={moderateScale(20)} height={moderateScale(20)} />
                        }
                        onPress={() => {
                          
                            createNewListRef.current?.expand();
                        }}
                    />
                    <View style={styles.dividerRow} />

                    <Text style={styles.availableLists}>Available Lists</Text>

                    <FlatList
                        data={shoppingLists}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.listItem}>
                                <View>
                                    <Text style={styles.listTitle}>{item.name}</Text>
                                    <Text style={styles.listDate}>Created: {item.created}</Text>
                                </View>
                                {/* <TouchableOpacity style={styles.addButton}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity> */}

                                <BaseButton
                                    title="Add"
                                    gradientButton={false}
                                    // backgroundColor={Colors.olive}
                                    textColor="#fff"
                                    width={width * 0.35}
                                    textStyle={styles.addButton}
                                    textStyleText={styles.addButtonText}
                                // rightChild={
                                //     <IconCart width={moderateScale(20)} height={moderateScale(20)} />
                                // }
                                // onPress={handleEditPress}
                                />

                            </View>
                        )}
                    //     ItemSeparatorComponent={() => <View style={styles.separator} />

                    // }
                    />

                    <View style={styles.footer}>
                        {/* <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton}>
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity> */}

                        <BaseButton
                            title="Cancel"
                            gradientButton={false}
                            // backgroundColor={Colors.olive}
                            textColor="#fff"
                            width={width * 0.35}
                            textStyle={styles.cancelButton}
                            textStyleText={styles.cancelButtonText}
                        // rightChild={
                        //     <IconCart width={moderateScale(20)} height={moderateScale(20)} />
                        // }
                        // onPress={handleEditPress}
                        />
                        <BaseButton
                            title="Confirm"
                            gradientButton={true}
                            // backgroundColor={Colors.olive}
                            textColor="#fff"
                            width={width * 0.35}
                            textStyle={styles.confirmButton}
                            textStyleText={styles.confirmButtonText}
                        // rightChild={
                        //     <IconCart width={moderateScale(20)} height={moderateScale(20)} />
                        // }
                        // onPress={handleEditPress}
                        />

                    </View>
                </View>
                <CreateNewListBottomSheet ref={createNewListRef} />

                {/* Move bottom sheet inside Modal so it appears above overlay */}
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
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9DAF89',
        borderRadius: moderateScale(8),
        paddingVertical: verticalScale(10),
        justifyContent: 'center',
        marginBottom: verticalScale(18),
    },
    createButtonText: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.white,
        fontSize: moderateScale(16),
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
        marginVertical: verticalScale(6), // top + bottom spacing
        paddingHorizontal: moderateScale(9),
        marginHorizontal: horizontalScale(2),

        // Android
        elevation: 4,

        // iOS
        shadowColor: '#000',
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
    dividerRow: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
        flex: 1,
        // width:width*0.9,
        // marginHorizontal: horizontalScale(12),
        marginVertical: verticalScale(18)
        // marginHorizontal: 8 

        // marginBottom: moderateScale(8),
    },

});

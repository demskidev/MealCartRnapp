import { iconback } from '@/assets/images';
import { CheckBox, FilledCheckBox } from '@/assets/svg';
import BaseButton from '@/components/BaseButton';
import Loader from '@/components/Loader';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { showToast } from '@/utils/Toast';
import { useProfileViewModel } from '@/viewmodels/ProfileViewModel';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DietaryPreferences({ navigation }) {
    const [removePlan, setRemovePlan] = useState(false);
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { user, loading, dietaryPreferences, updateUserData } = useProfileViewModel();

    useEffect(() => {
        // Load user's existing dietary preferences
        if (user?.dietaryPreferences) {
            setSelectedIds(user.dietaryPreferences);
        }
    }, [user]);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((selectedId) => selectedId !== id)
                : [...prev, id]
        );
    };

    const handleSavePreferences = () => {
        updateUserData(
            { dietaryPreferences: selectedIds },
            (payload) => {
                showToast('success', 'Preferences saved successfully!');
                router.back();
            },
            (error) => {
                showToast('error', error || 'Failed to save preferences');
            }
        );
    };

    const renderDietaryItem = ({ item, index }) => (
        <>
            <TouchableOpacity style={styles.row} onPress={() => toggleSelection(item.id)}>
                <View>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                </View>

                {selectedIds.includes(item.id) ? (
                    <FilledCheckBox
                        width={verticalScale(22)}
                        height={verticalScale(22)}
                        color={Colors.tertiary}
                    />
                ) : (
                    <CheckBox
                        width={verticalScale(22)}
                        height={verticalScale(22)}
                        color={Colors.tertiary}
                    />
                )}

            </TouchableOpacity>
            {index !== (dietaryPreferences?.length || 0) - 1 && <View style={styles.divider} />}
        </>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>


            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image
                        source={iconback}
                        resizeMode="contain"
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.backText}>{Strings.dietaryPreferences_title}</Text>
            </View>
            <View style={styles.card}>

                <FlatList
                    data={dietaryPreferences || []}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    renderItem={renderDietaryItem}


                />

            </View>


            <BaseButton
                title={Strings.dietaryPreferences_save}
                gradientButton={true}
                textStyle={styles.savePreference}
                onPress={handleSavePreferences}
            />

            {loading && <Loader />}
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: horizontalScale(20),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backText: {
        fontSize: moderateScale(21),
        color: Colors.primary,
        fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
        marginLeft: horizontalScale(30),
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        marginTop: verticalScale(23),
        marginBottom: verticalScale(18),

        elevation: 4,

        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(20),
    },
    rowTitle: {
        fontSize: moderateScale(14),
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        color: Colors.primary,
    },
    rowSubtitle: {
        fontSize: moderateScale(12),
        fontFamily: FontFamilies.ROBOTO_REGULAR,
        color: Colors.tertiary,
        marginTop: verticalScale(2),
    },
    divider: {
        height: moderateScale(1),
        backgroundColor: Colors.divider,
    },
    savePreference: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        color: Colors.white
    },
    backIcon: {
        width: moderateScale(24),
        height: moderateScale(24),
        alignSelf: 'flex-end',
    },

});
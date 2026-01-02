import { iconback, profileiconclose } from '@/assets/images';
import BaseButton from '@/components/BaseButton';
import GradientText from '@/components/GradientText';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';





export default function AllergiesIntolerance({ navigation }) {
    const [removePlan, setRemovePlan] = useState(false);
    const router = useRouter();

    const [tags, setTags] = useState(['Peanuts']);
    const [input, setInput] = useState('');

    const handleAddTag = () => {
        if (input.trim() && !tags.includes(input.trim())) {
            setTags([...tags, input.trim()]);
            setInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };
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
                <Text style={styles.backText}>{Strings.allergies_title}</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.tagInputContainer}>
                    {tags.map((item) => (
                        <View style={styles.tag} key={item}>
                            <GradientText
                                text={item}
                                startColor={Colors._586E3F}
                                endColor={Colors._5F6C51}
                                fontSize={moderateScale(12)}
                            />
                            <TouchableOpacity >
                                <Image
                                    source={profileiconclose}
                                    style={styles.closeIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TextInput
                        style={styles.input}
                        value={input}
                        placeholder={tags.length === 0 ? Strings.allergies_placeholder : ''}
                        onChangeText={setInput}
                        onSubmitEditing={handleAddTag}
                        returnKeyType="done"
                    />
                </View>

                <Text style={styles.inputHint}>{Strings.allergies_placeholder}</Text>
            </View>




            <BaseButton
                title={Strings.allergies_save}
                gradientButton={true}
                textStyle={styles.savePreference}
            />


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
        // marginVertical: verticalScale(6),
        paddingVertical: verticalScale(17),
        marginTop: verticalScale(23),
        marginBottom: verticalScale(18),
        paddingHorizontal: horizontalScale(15),

        // Android
        elevation: 4,

        // iOS
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    savePreference: {
        fontFamily: FontFamilies.ROBOTO_MEDIUM,
        fontSize: moderateScale(16),
        color: Colors.white
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 44,
        borderWidth: moderateScale(1),
        borderColor: Colors.borderColor,
        borderRadius: moderateScale(8),
        paddingHorizontal: 8,
        backgroundColor: Colors.white,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors._e6f7d9,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginVertical: 6,
    },
    input: { minWidth: 100, padding: 0, margin: 0, fontSize: 16, backgroundColor: 'transparent' },
    inputHint: { color: Colors.tertiary, fontSize: moderateScale(12), marginTop: 4, fontFamily: FontFamilies.ROBOTO_REGULAR },

    inputWrapper: {
        position: 'relative',
        height: verticalScale(40),
        justifyContent: 'center',
    },

    hiddenInput: {
        color: 'transparent',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },

    gradientOverlay: {
        position: 'absolute',
    },
    backIcon: {
        width: moderateScale(24),
        height: moderateScale(24),
        alignSelf: 'flex-end',
    },
    closeIcon: {
        width: verticalScale(14),
        height: verticalScale(14),
        marginLeft: 6,
    },


});
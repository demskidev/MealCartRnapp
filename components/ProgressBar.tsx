import { moderateScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function ProgressBar({
    progress = 0,
    height = 12,
    backgroundColor = Colors.borderColor,
    fillColors = [Colors._586E3F, Colors._5F6C51],
    label = "Progress",
    progressText = "",
    labelStyle = {},
    progressTextStyle = {},
    containerStyle = {},
}) {
    const radius = height / 2;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    return (
        <View style={containerStyle}>
            <View style={styles.row}>
                <Text style={[styles.label, labelStyle]}>{label}</Text>
                <Text style={[styles.progressText, progressTextStyle]}>{progressText}</Text>
            </View>
            <View
                style={[
                    styles.container,
                    {
                        height,
                        borderRadius: radius,
                        backgroundColor,
                    },
                ]}
            >
                <View style={[styles.fillContainer, { width: `${clampedProgress * 100}%` }]}>
                    <LinearGradient
                        colors={fillColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles.gradient,
                            { borderRadius: radius },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
        alignItems: "center",
    },
    label: {
        fontSize: moderateScale(10),
        color: Colors.tertiary,
        fontFamily: FontFamilies.ROBOTO_MEDIUM
    },
    progressText: {
        fontSize: moderateScale(10),
        color: Colors.tertiary,
        fontFamily: FontFamilies.ROBOTO_MEDIUM

    },
    container: {
        width: "100%",
        overflow: "hidden",
    },
    fillContainer: {
        height: "100%",
    },
    gradient: {
        width: "100%",
        height: "100%",
    },
});
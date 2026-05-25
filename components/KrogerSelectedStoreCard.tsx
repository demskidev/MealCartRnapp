import { krogerStore } from "@/assets/images";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface KrogerSelectedStoreCardProps {
  store: any;
  actionLabel?: string;
  onActionPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const formatStoreAddress = (store: any) =>
  [
    store?.address?.addressLine1,
    store?.address?.city,
    store?.address?.state,
    store?.address?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

export default function KrogerSelectedStoreCard({
  store,
  actionLabel,
  onActionPress,
  disabled,
  style,
}: KrogerSelectedStoreCardProps) {
  if (!store) {
    return null;
  }

  const storeNumber = store?.storeNumber || "";
  const address = formatStoreAddress(store);

  return (
    <View style={[styles.storeCard, style]}>
      <Image
        source={krogerStore}
        style={styles.storeImage}
        resizeMode="cover"
      />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={2} ellipsizeMode="tail">
          {Strings.store} {storeNumber} {address ? ` - ${address}` : ""}
        </Text>
      </View>
      {actionLabel && onActionPress ? (
        <View style={styles.actionWrap}>
          <TouchableOpacity
            style={[styles.actionButton]}
            onPress={onActionPress}
            disabled={disabled}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    margin: horizontalScale(5),
    paddingRight: horizontalScale(12),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    marginTop: verticalScale(3),
  },
  storeImage: {
    borderTopLeftRadius: moderateScale(8),
    borderBottomLeftRadius: moderateScale(8),
    marginRight: horizontalScale(12),
    width: horizontalScale(65),
    height: verticalScale(55),
  },
  storeInfo: {
    flex: 1,
    paddingVertical: verticalScale(12),
  },
  storeName: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  actionWrap: {
    width: horizontalScale(92),
    marginLeft: horizontalScale(8),
  },
  actionButton: {
    paddingVertical: verticalScale(10),
    backgroundColor: Colors._004A9B,
    borderRadius: moderateScale(19),
  },
  actionText: {
    color: Colors.white,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: fontSize(13),
  },
});

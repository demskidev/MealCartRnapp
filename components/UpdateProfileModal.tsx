import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BaseButton from './BaseButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

export default function UpdateProfileModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <View style={styles.container}>

          <Text style={styles.headerTitle}>Update Profile</Text>
          <Text style={styles.headerSubtitle}>
            You can set your meals servings for all your new meals.
          </Text>

          <View style={styles.avatarRow}>
            <Image
              source={require("@/assets/images/updateprofile.png")}
              style={{ width: verticalScale(112), height: verticalScale(112) }}
              resizeMode="contain"
            />
            <View style={styles.avatarBtnCol}>

              <BaseButton
                title="Update"
                gradientButton={false}
                backgroundColor={Colors.white}

                textStyle={[styles.updateBtn]}
                textStyleText={styles.updateBtnText}

              />

              <BaseButton
                title="Remove"
                gradientButton={true}
                backgroundColor={Colors.white}
                gradientStartColor="#A62A2A"
                gradientEndColor="#FD4B4B"
                textStyle={styles.gradientbtnText}

              />


            </View>
          </View>

          <Text style={styles.label}>Update Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={Colors.tertiary}
          />

          <Text style={styles.label}>Update Email</Text>
          <TextInput
            style={styles.input}
            placeholder="youemail@example.com"
            placeholderTextColor={Colors.tertiary}
            keyboardType="email-address"
          />

          <Text style={styles.socialLabel}>Social</Text>
          <View style={styles.socialBox}>
            <View>
              <Image
                source={require("@/assets/images/googleicon.png")}
                style={{ width: verticalScale(16), height: verticalScale(16) }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.socialText}>Connected with Google</Text>
            <TouchableOpacity>
              <TouchableOpacity  >
                <Image
                  source={require("@/assets/images/close-icon.png")}
                  style={{ width: verticalScale(24), height: verticalScale(24) }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>


            <BaseButton
              title="Cancel"
              gradientButton={false}
              textColor="#fff"
              width={width * 0.4}
              textStyle={styles.cancelButton}
              textStyleText={styles.cancelButtonText}
              onPress={onClose}
            />
            <BaseButton
              title="Update"
              gradientButton={true}
              textColor="#fff"
              width={width * 0.4}
              textStyle={styles.confirmButton}
              textStyleText={styles.confirmButtonText}
              onPress={onClose}
            />

          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({

  headerTitle: {
    fontSize: moderateScale(21),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: verticalScale(4),
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    marginBottom: verticalScale(18),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  avatar: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: Colors.greysoft,
    marginRight: horizontalScale(18),
  },
  avatarBtnCol: {
    flex: 1,
    justifyContent: 'center',
  },
  updateBtn: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(10),
    alignItems: 'center',
    borderColor: Colors.borderColor,
    borderWidth: moderateScale(1)

  },
  updateBtnText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  gradientbtnText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
    fontSize: moderateScale(16)
  },
  removeBtn: {
    backgroundColor: 'linear-gradient(90deg, #D9534F 0%, #C0392B 100%)', 
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: moderateScale(18),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
  },
  label: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.primary,
    marginTop: verticalScale(8),
    marginBottom: verticalScale(2),
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: Colors.divider,
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(8),
  },
  socialLabel: {
    fontSize: moderateScale(13),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    textAlign: 'center',
    marginVertical: verticalScale(8),
  },
  socialBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.buttonBackground,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(12),
    marginBottom: verticalScale(18),
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  googleIcon: {
    fontSize: moderateScale(22),
    fontFamily: FontFamilies.ROBOTO_BLACK,
    color: Colors.primary,
    marginRight: horizontalScale(8),
  },
  socialText: {
    fontSize: moderateScale(16),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.textBlack,
  },
  socialRemove: {
    fontSize: moderateScale(22),
    color: Colors.error,
    marginLeft: horizontalScale(8),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    marginRight: horizontalScale(8),
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cancelBtnText: {
    fontSize: moderateScale(18),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  updateProfileBtn: {
    flex: 1,
    backgroundColor: Colors.olive,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    marginLeft: horizontalScale(8),
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  updateProfileBtnText: {
    fontSize: moderateScale(18),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
  },

  closeBtn: {
    position: 'absolute',
    top: verticalScale(12),
    right: horizontalScale(12),
    zIndex: 10,
  },
  closeText: {
    fontSize: moderateScale(22),
    color: Colors.tertiary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: horizontalScale(20),
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(18),
    paddingHorizontal: horizontalScale(18),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(24),

    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
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
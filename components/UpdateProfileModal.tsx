import { closeIcon, googleicon, updateprofile } from '@/assets/images';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useLoader } from '@/context/LoaderContext';
import { showErrorToast, showSuccessToast } from '@/utils/Toast';
import { useProfileViewModel } from '@/viewmodels/ProfileViewModel';
import { useEffect, useState } from 'react';
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
import ImagePickerModal from './ImagePickerModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

export default function UpdateProfileModal({ visible, onClose }: Props) {
  const { showLoader, hideLoader } = useLoader();
  const { updateUserData, user } = useProfileViewModel();
  const [name, setName] = useState('');
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Load current user name when modal opens
  useEffect(() => {
    if (visible && user?.name) {
      setName(user.name);
    }
  }, [visible, user?.name]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      showErrorToast('Please enter a name');
      return;
    }

    showLoader();

    await updateUserData(
      { name: name.trim() },
      () => {
        hideLoader();
        showSuccessToast('Profile updated successfully!');
        onClose();
      },
      (error) => {
        hideLoader();
        showErrorToast(error || 'Failed to update profile');
      }
    );
  };
   const handleUpload = () => {
    setShowImagePickerModal(true);
  };

  const handleImagePicked = (url: string) => {
    console.log('Selected Image URI:', url);
    console.log('Image Details:', {
      uri: url,
      type: url.includes('data:') ? 'base64' : 'file',
      extension: url.split('.').pop(),
      timestamp: new Date().toISOString()
    });
    setImageUri(url);
  };

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
           <ImagePickerModal
            visible={showImagePickerModal}
            onClose={() => setShowImagePickerModal(false)}
            onImagePicked={handleImagePicked}
          />

          <Text style={styles.headerTitle}>{Strings.updateProfileModal_title}</Text>
          <Text style={styles.headerSubtitle}>
            {Strings.updateProfileModal_subtitle}
          </Text>

          <View style={styles.avatarRow}>
            <TouchableOpacity onPress={handleUpload}>
              <Image
                source={imageUri ? { uri: imageUri } : updateprofile}
                style={styles.updateProfileImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.avatarBtnCol}>

              <BaseButton
                title={Strings.updateProfileModal_update}
                gradientButton={false}
                backgroundColor={Colors.white}
                textStyle={[styles.updateBtn]}
                textStyleText={styles.updateBtnText}
              />
              <BaseButton
                title={Strings.updateProfileModal_remove}
                gradientButton={true}
                backgroundColor={Colors.white}
                gradientStartColor={Colors._A62A2A}
                gradientEndColor={Colors._FD4B4B}
                textStyle={styles.gradientbtnText}
              />


            </View>
          </View>

          <Text style={styles.label}>{Strings.updateProfileModal_updateName}</Text>
          <TextInput
            style={styles.input}
            placeholder={Strings.updateProfileModal_namePlaceholder}
            placeholderTextColor={Colors.tertiary}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>{Strings.updateProfileModal_updateEmail}</Text>
          <TextInput
            style={styles.input}
            placeholder={Strings.updateProfileModal_emailPlaceholder}
            placeholderTextColor={Colors.tertiary}
            keyboardType="email-address"
            editable={false}
          />

          <Text style={styles.socialLabel}>{Strings.updateProfileModal_social}</Text>
          <View style={styles.socialBox}>
            <View>
              <Image
                source={googleicon}
                style={styles.googleIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.socialText}>{Strings.updateProfileModal_connectedWithGoogle}</Text>
            <TouchableOpacity>
              <TouchableOpacity  >
                <Image
                  source={closeIcon}
                  style={styles.closeIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>


            <BaseButton
              title={Strings.updateProfileModal_cancel}
              gradientButton={false}
              textColor={Colors.background}
              width={width * 0.4}
              textStyle={styles.cancelButton}
              textStyleText={styles.cancelButtonText}
              onPress={onClose}
            />
            <BaseButton
              title={Strings.updateProfileModal_update}
              gradientButton={true}
              textColor={Colors.background}
              width={width * 0.4}
              textStyle={styles.confirmButton}
              textStyleText={styles.confirmButtonText}
              onPress={handleUpdate}
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
  updateProfileImage: {
    width: verticalScale(112),
    height: verticalScale(112),
  },
  googleIconImage: {
    width: verticalScale(16),
    height: verticalScale(16),
  },
  closeIconImage: {
    width: verticalScale(24),
    height: verticalScale(24),
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
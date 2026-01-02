import { Strings } from '@/constants/Strings';
import { Colors } from '@/constants/Theme';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import BaseButton from './BaseButton';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImagePicked: (uri: string) => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ visible, onClose, onImagePicked }) => {
  const pickImage = async (type: 'camera' | 'gallery') => {
    let result;
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert(Strings.imagePickerModal_cameraPermission);
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert(Strings.imagePickerModal_mediaLibraryPermission);
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }
    if (!result.canceled && result.assets && result.assets.length > 0) {
      onImagePicked(result.assets[0].uri);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.modalContainer}>
        <Text style={styles.title}>{Strings.imagePickerModal_selectImage}</Text>
        <BaseButton title={Strings.imagePickerModal_takePhoto} onPress={() => pickImage('camera')} />
        <View style={styles.spacer} />
        <BaseButton title={Strings.imagePickerModal_chooseFromGallery} onPress={() => pickImage('gallery')} />
        <View style={styles.spacer} />
        <BaseButton title={Strings.imagePickerModal_cancel} gradientButton={false} backgroundColor={Colors._eee} textColor={Colors._333} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  spacer: {
    height: 12,
  },
});

export default ImagePickerModal;

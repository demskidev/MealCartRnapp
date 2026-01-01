import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import BaseButton from './BaseButton';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImagePicked: (uri: string) => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ visible, onClose, onImagePicked }) => {
  const pickImage = async (type: 'camera' | 'gallery') => {
 ///  onClose();
    let result;
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Camera permission is required!');
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
        alert('Media library permission is required!');
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
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={onClose} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Select Image</Text>
        <BaseButton title="Take Photo" onPress={() => pickImage('camera')} />
        <View style={{ height: 12 }} />
        <BaseButton title="Choose from Gallery" onPress={() => pickImage('gallery')} />
        <View style={{ height: 12 }} />
        <BaseButton title="Cancel" gradientButton={false} backgroundColor="#eee" textColor="#333" onPress={onClose} />
      </View>
    </Modal>
  );
};

export default ImagePickerModal;

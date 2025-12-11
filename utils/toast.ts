import { Colors } from '@/constants/theme';
import Toast from 'react-native-toast-message';

interface ToastConfig {
  type: 'success' | 'error' | 'info' | 'warning';
  text1: string;
  text2?: string;
  backgroundColor: string;
  text1Color: string;
  text2Color: string;
  borderRadius: number;
  borderLeftColor: string;
  borderLeftWidth: number;
}

const getToastConfig = (
  type: 'success' | 'error' | 'info' | 'warning',
  text1: string,
  text2?: string
): ToastConfig => {
  const baseConfig = {
    type,
    text1,
    text2,
    borderRadius: 12,
  };

  switch (type) {
    case 'success':
      return {
        ...baseConfig,
        backgroundColor: '#F0F7ED',
        text1Color: Colors.primary,
        text2Color: Colors.secondaryText,
        borderLeftColor: Colors.primary,
        borderLeftWidth: 4,
      };
    case 'error':
      return {
        ...baseConfig,
        backgroundColor: '#FFEBEE',
        text1Color: Colors.error,
        text2Color: Colors.secondaryText,
        borderLeftColor: Colors.error,
        borderLeftWidth: 4,
      };
    case 'warning':
      return {
        ...baseConfig,
        backgroundColor: '#FFF8E1',
        text1Color: '#F57C00',
        text2Color: Colors.secondaryText,
        borderLeftColor: '#F57C00',
        borderLeftWidth: 4,
      };
    case 'info':
      return {
        ...baseConfig,
        backgroundColor: '#E8F5E9',
        text1Color: Colors.primary,
        text2Color: Colors.secondaryText,
        borderLeftColor: Colors.primary,
        borderLeftWidth: 4,
      };
  }
};

export const showToast = (
  type: 'success' | 'error' | 'info' | 'warning',
  text1: string,
  text2?: string
) => {
  const config = getToastConfig(type, text1, text2);

  (Toast as any).show({
    type,
    text1,
    text2,
    position: 'top',
    topOffset: 60,
    visibilityTime: 4000,
    autoHide: true,
    backgroundColor: config.backgroundColor,
    text1Color: config.text1Color,
    text2Color: config.text2Color,
    borderRadius: config.borderRadius,
    borderLeftColor: config.borderLeftColor,
    borderLeftWidth: config.borderLeftWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  });
};

export const showSuccessToast = (message: string, subMessage?: string) => {
  showToast('success', message, subMessage);
};

export const showErrorToast = (message: string, subMessage?: string) => {
  showToast('error', message, subMessage);
};

export const showInfoToast = (message: string, subMessage?: string) => {
  showToast('info', message, subMessage);
};

export const showWarningToast = (message: string, subMessage?: string) => {
  showToast('warning', message, subMessage);
};

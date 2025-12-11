import Toast from "react-native-toast-message";

export const showToast = (
  type: "success" | "error" | "info" | "warning",
  text1: string,
  text2?: string
) => {
  (Toast as any).show({
    type,
    text1,
    text2,
    position: "top",
    topOffset: 60,
    visibilityTime: 4000,
    autoHide: true,
  });
};

export const showSuccessToast = (message: string, subMessage?: string) => {
  showToast("success", message, subMessage);
};

export const showErrorToast = (message: string, subMessage?: string) => {
  showToast("error", message, subMessage);
};

export const showInfoToast = (message: string, subMessage?: string) => {
  showToast("info", message, subMessage);
};

export const showWarningToast = (message: string, subMessage?: string) => {
  showToast("warning", message, subMessage);
};

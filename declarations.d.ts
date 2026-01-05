declare module "*.svg" {
  import * as React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.png" {
  const value: number;
  export default value;
}

declare module "react-native-circular-slider";

declare module "react-native-toast-message" {
  import React from "react";

  export interface ToastOptions {
    type?: "success" | "error" | "info" | "warning";
    text1?: string;
    text2?: string;
    position?: "top" | "bottom";
    topOffset?: number;
    visibilityTime?: number;
  }

  export interface ToastRef {
    show(options: ToastOptions): void;
    hide(): void;
  }

  const Toast: React.FC<any>;

  export default Toast;
}

import { FontFamilies } from "@/constants/Theme";
import React from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

interface GradientTextProps {
  text: string;
  startColor: string;
  endColor: string;
  fontSize?: number;
  fontFamily?: string;
  angle?: "horizontal" | "vertical" | "diagonal";
  style?: ViewStyle;
}

const GradientText = React.memo(
  ({
    text,
    startColor,
    endColor,
    fontSize = 12,
    fontFamily = FontFamilies.ROBOTO_MEDIUM,
    angle = "diagonal",
    style,
  }: GradientTextProps) => {
    // Define gradient direction based on angle
    const getGradientCoords = () => {
      switch (angle) {
        case "horizontal":
          return { x1: "0%", y1: "0%", x2: "100%", y2: "0%" };
        case "vertical":
          return { x1: "0%", y1: "0%", x2: "0%", y2: "100%" };
        case "diagonal":
        default:
          return { x1: "0%", y1: "0%", x2: "100%", y2: "100%" };
      }
    };

    const coords = getGradientCoords();
    const svgWidth = text.length * (fontSize * 0.52);
    const svgHeight = fontSize + 4;

    return (
      <View style={style}>
        <Svg width={svgWidth} height={svgHeight}>
          <Defs>
            <LinearGradient
              id="textGradient"
              x1={coords.x1}
              y1={coords.y1}
              x2={coords.x2}
              y2={coords.y2}
            >
              <Stop offset="0%" stopColor={startColor} />
              <Stop offset="100%" stopColor={endColor} />
            </LinearGradient>
          </Defs>
          <SvgText
            x={0}
            y={fontSize - 2}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fill="url(#textGradient)"
          >
            {text}
          </SvgText>
        </Svg>
      </View>
    );
  }
);

export default GradientText;

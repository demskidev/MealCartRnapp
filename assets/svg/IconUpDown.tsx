import Svg, { Path } from 'react-native-svg';

export const IconUp = (props) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Path d="M8 5l4 4H4l4-4z" fill="#222" />
  </Svg>
);

export const IconDown = (props) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Path d="M8 11l-4-4h8l-4 4z" fill="#222" />
  </Svg>
);

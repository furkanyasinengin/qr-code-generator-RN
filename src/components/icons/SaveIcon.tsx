import Svg, { Path } from 'react-native-svg';

export const SaveIcon = ({ color = 'white', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill={color} />
  </Svg>
);

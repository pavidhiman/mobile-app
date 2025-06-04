import { Text, Pressable, Image, View } from 'react-native';
import { useResponsiveFontSize } from 'react-native-responsive-dimensions';
import { useResponsiveHeight, useResponsiveWidth } from 'react-native-responsive-dimensions';
import { textStyles } from '../styles/textStyles';

export default function CustomButton({
  isLargeScreen,
  styles,
  buttonText,
  height,
  width,
  marginTop,
  marginBottom,
  onPress,
  icon,
  buttonColor,
  fontSize,
}) {
  const largeFont = useResponsiveFontSize(3);
  const smallFont = useResponsiveFontSize(2.5);
  const componentWidth = useResponsiveWidth(6.5);
  const componentHeight = useResponsiveHeight(3.5);

  CustomButton.defaultProps = {
    buttonColor: '#F3F3F3',
  };

  const computedFontSize = fontSize || (isLargeScreen ? largeFont : smallFont);

  return (
    <Pressable
      onPress={onPress}
      style={{
        ...styles.button,
        height: height,
        width: width,
        marginTop: marginTop,
        marginBottom: marginBottom,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: buttonColor,
      }}
    >
      <Image source={icon} style={{ width: componentWidth, height: componentHeight, aspectRatio: 1 / 1 }}></Image>

      <Text
        style={{
          ...styles.buttonText,
          ...textStyles.regular,
          color: buttonColor !== '#F3F3F3' && buttonColor !== 'white' ? 'white' : 'black',
          fontSize: computedFontSize,
        }}
      >
        {buttonText}
      </Text>
      {/* Placeholder View to offset icon */}
      {icon !== null && <View style={{ width: componentWidth, height: componentHeight, aspectRatio: 1 / 1 }}></View>}
    </Pressable>
  );
}

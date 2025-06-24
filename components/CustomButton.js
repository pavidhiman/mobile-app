import { Image, Pressable, Text, View } from 'react-native';
import {
  useResponsiveFontSize,
  useResponsiveHeight,
  useResponsiveWidth,
} from 'react-native-responsive-dimensions';
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
  buttonColor = '#F3F3F3',   // ← default lives here
  fontSize,
}) {
  const largeFont = useResponsiveFontSize(3);
  const smallFont = useResponsiveFontSize(2.5);
  const componentWidth  = useResponsiveWidth(6.5);
  const componentHeight = useResponsiveHeight(3.5);

  const computedFontSize =
    fontSize || (isLargeScreen ? largeFont : smallFont);

  return (
    <Pressable
      onPress={onPress}
      style={{
        ...styles.button,
        height,
        width,
        marginTop,
        marginBottom,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: buttonColor,
      }}
    >
      <Image
        source={icon}
        style={{
          width: componentWidth,
          height: componentHeight,
          aspectRatio: 1,
        }}
      />

      <Text
        style={{
          ...styles.buttonText,
          ...textStyles.regular,
          color:
            buttonColor !== '#F3F3F3' && buttonColor !== 'white'
              ? 'white'
              : 'black',
          fontSize: computedFontSize,
        }}
      >
        {buttonText}
      </Text>

      {/* Placeholder to balance the icon’s space */}
      {icon && (
        <View
          style={{
            width: componentWidth,
            height: componentHeight,
            aspectRatio: 1,
          }}
        />
      )}
    </Pressable>
  );
}

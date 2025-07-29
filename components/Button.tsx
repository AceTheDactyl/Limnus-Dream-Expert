import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };
  
  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };
  
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };
  
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };
  
  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'text' ? Colors.dark.primary : Colors.dark.background} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text 
            style={[
              styles.text,
              getTextStyle(),
              getTextSizeStyle(),
              disabled && styles.disabledText,
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </>
  );
  
  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          getSizeStyle(),
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.dark.primary, Colors.dark.secondary]}
          style={[
            styles.gradientButton,
            getSizeStyle(),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.dark.secondary,
  },
  outlineButton: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  textButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    minHeight: 56,
  },
  disabledButton: {
    opacity: 0.4,
  },
  text: {
    fontWeight: '700',
  },
  primaryText: {
    color: Colors.dark.background,
  },
  secondaryText: {
    color: Colors.dark.background,
  },
  outlineText: {
    color: Colors.dark.text,
  },
  textButtonText: {
    color: Colors.dark.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
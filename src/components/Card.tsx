/**
 * Card Component - Modern redesigned card with enhanced variants
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: number;
  margin?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 20,
  margin = 0,
}) => {
  const { colors, isDark } = useThemeContext();

  const variantStyles = {
    default: {
      backgroundColor: colors.card,
      borderWidth: 0,
    },
    elevated: {
      backgroundColor: colors.card,
      borderWidth: 0,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    outlined: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    flat: {
      backgroundColor: colors.surface,
      borderWidth: 0,
    },
  };

  const cardStyle = [
    styles.card,
    variantStyles[variant],
    { padding, marginVertical: margin },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});


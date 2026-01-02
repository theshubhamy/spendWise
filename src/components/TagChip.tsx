/**
 * Tag Chip Component - Modern redesigned tag chip
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Tag } from '@/types';
import { useThemeContext } from '@/context/ThemeContext';
import Icon from '@react-native-vector-icons/ionicons';

interface TagChipProps {
  tag: Tag;
  onPress?: () => void;
  onRemove?: () => void;
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
}

export const TagChip: React.FC<TagChipProps> = ({
  tag,
  onPress,
  onRemove,
  size = 'medium',
  selected = false,
}) => {
  const { colors, isDark } = useThemeContext();
  const sizeStyles = {
    small: { padding: 6, fontSize: 11, height: 24, dotSize: 6 },
    medium: { padding: 8, fontSize: 13, height: 32, dotSize: 8 },
    large: { padding: 10, fontSize: 15, height: 40, dotSize: 10 },
  };

  const style = sizeStyles[size];
  const backgroundColor = selected
    ? tag.color
    : isDark
    ? tag.color + '25'
    : tag.color + '15';
  const textColor = selected ? '#ffffff' : tag.color;
  const borderColor = selected ? tag.color : tag.color + '40';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          paddingHorizontal: style.padding,
          height: style.height,
          borderWidth: selected ? 0 : 1.5,
        },
        selected && styles.selected,
        onPress && styles.pressable,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !onRemove}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View
        style={[
          styles.colorDot,
          {
            backgroundColor: selected ? '#ffffff' : tag.color,
            width: style.dotSize,
            height: style.dotSize,
            borderRadius: style.dotSize / 2,
          },
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            fontSize: style.fontSize,
            color: textColor,
            fontWeight: selected ? '600' : '500',
          },
        ]}
      >
        {tag.name}
      </Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            name="close-circle"
            size={style.fontSize + 4}
            color={textColor}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  pressable: {
    // Additional styles for pressable tags
  },
  selected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorDot: {
    marginRight: 6,
  },
  text: {
    letterSpacing: 0.2,
  },
  removeButton: {
    marginLeft: 6,
    padding: 2,
  },
});


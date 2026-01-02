/**
 * Screen Template - Modern redesigned base template for app screens
 */

import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenTemplateProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  showStatusBar?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  backgroundColor?: string;
  paddingHorizontal?: number;
}

export const ScreenTemplate: React.FC<ScreenTemplateProps> = ({
  children,
  header,
  footer,
  scrollable = true,
  contentContainerStyle,
  style,
  showStatusBar = true,
  statusBarStyle,
  backgroundColor,
  paddingHorizontal = 20,
}) => {
  const { colors, isDark } = useThemeContext();
  const insets = useSafeAreaInsets();

  const bgColor = backgroundColor || colors.background;
  const statusBar = statusBarStyle || (isDark ? 'light-content' : 'dark-content');

  const content = scrollable ? (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: bgColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.bottom + 20,
          paddingHorizontal,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        { backgroundColor: bgColor, paddingHorizontal },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }]}
      edges={['top', 'left', 'right']}
    >
      {showStatusBar && (
        <StatusBar
          barStyle={statusBar}
          backgroundColor={bgColor}
          translucent={false}
        />
      )}
      {header && (
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {header}
        </View>
      )}
      {content}
      {footer && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          {footer}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 0.5,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  footer: {
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});


/**
 * Profile Screen - User profile and settings
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import {
  getBiometricEnabled,
  setBiometricEnabled,
  getAutoLockTimeout,
  setAutoLockTimeout,
  getBaseCurrency,
  setBaseCurrency,
} from '@/services/settings.service';
import { isBiometricAvailable } from '@/services/biometric.service';
import { useThemeContext } from '@/context/ThemeContext';
import Icon from '@react-native-vector-icons/ionicons';
import { CurrencyPicker } from '@/components/CurrencyPicker';

type ProfileScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const getCurrencyDisplayName = (code: string): string => {
  const currencyMap: Record<string, string> = {
    USD: 'USD - US Dollar $',
    EUR: 'EUR - Euro €',
    GBP: 'GBP - British Pound £',
    INR: 'INR - Indian Rupee ₹',
    JPY: 'JPY - Japanese Yen ¥',
    CAD: 'CAD - Canadian Dollar C$',
    AUD: 'AUD - Australian Dollar A$',
    CHF: 'CHF - Swiss Franc',
    CNY: 'CNY - Chinese Yuan ¥',
    SGD: 'SGD - Singapore Dollar S$',
    HKD: 'HKD - Hong Kong Dollar HK$',
    NZD: 'NZD - New Zealand Dollar NZ$',
    KRW: 'KRW - South Korean Won ₩',
    MXN: 'MXN - Mexican Peso $',
    BRL: 'BRL - Brazilian Real R$',
    ZAR: 'ZAR - South African Rand R',
    RUB: 'RUB - Russian Ruble ₽',
    AED: 'AED - UAE Dirham',
    SAR: 'SAR - Saudi Riyal',
    THB: 'THB - Thai Baht ฿',
    MYR: 'MYR - Malaysian Ringgit RM',
    IDR: 'IDR - Indonesian Rupiah Rp',
    PHP: 'PHP - Philippine Peso ₱',
    PKR: 'PKR - Pakistani Rupee ₨',
    BDT: 'BDT - Bangladeshi Taka ৳',
    LKR: 'LKR - Sri Lankan Rupee ₨',
    NPR: 'NPR - Nepalese Rupee ₨',
  };
  return currencyMap[code] || code;
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { colors, mode, setMode } = useThemeContext();
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [autoLockTimeout, setAutoLockTimeoutState] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [baseCurrency, setBaseCurrencyState] = useState('INR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    // Load settings
    setBiometricEnabledState(getBiometricEnabled());
    setAutoLockTimeoutState(getAutoLockTimeout());
    setBaseCurrencyState(getBaseCurrency());

    // Check biometric availability
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Check if biometrics is available before enabling
      const available = await isBiometricAvailable();
      if (!available) {
        Alert.alert(
          'Biometrics Not Available',
          'Biometric authentication is not available on this device. Please enable it in your device settings.',
        );
        return;
      }
    }

    setBiometricEnabled(value);
    setBiometricEnabledState(value);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View
        style={[
          styles.profileHeader,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Icon name="person" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>User</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
          user@example.com
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Appearance
        </Text>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
          onPress={() => {
            Alert.alert('Theme', 'Select theme mode', [
              { text: 'Light', onPress: () => setMode('light') },
              { text: 'Dark', onPress: () => setMode('dark') },
              { text: 'System', onPress: () => setMode('system') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <Icon name="color-palette" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Theme
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {mode === 'system'
                  ? 'System Default'
                  : mode === 'dark'
                  ? 'Dark'
                  : 'Light'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Security
        </Text>

        <View
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.secondary + '15' },
              ]}
            >
              <Icon name="lock-closed" size={20} color={colors.secondary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Biometric Lock
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Use fingerprint or Face ID to secure the app
              </Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            disabled={!biometricAvailable}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
          onPress={() => {
            Alert.alert('Auto Lock Timeout', 'Select auto lock timeout', [
              {
                text: '1 min',
                onPress: () => {
                  setAutoLockTimeout(1);
                  setAutoLockTimeoutState(1);
                },
              },
              {
                text: '5 min',
                onPress: () => {
                  setAutoLockTimeout(5);
                  setAutoLockTimeoutState(5);
                },
              },
              {
                text: '10 min',
                onPress: () => {
                  setAutoLockTimeout(10);
                  setAutoLockTimeoutState(10);
                },
              },
              {
                text: '30 min',
                onPress: () => {
                  setAutoLockTimeout(30);
                  setAutoLockTimeoutState(30);
                },
              },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.accent + '15' },
              ]}
            >
              <Icon name="time-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Auto Lock
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Lock app after {autoLockTimeout} minute
                {autoLockTimeout !== 1 ? 's' : ''} of inactivity
              </Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text
              style={[styles.settingValue, { color: colors.textSecondary }]}
            >
              {autoLockTimeout} min
            </Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Notifications
        </Text>

        <View
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Enable Notifications
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              Receive reminders for bills and recurring expenses
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Organization
        </Text>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
          onPress={() => navigation.navigate('RecurringExpenses')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.success + '15' },
              ]}
            >
              <Icon name="repeat" size={20} color={colors.success} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Recurring Expenses
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Manage recurring expenses and subscriptions
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
          onPress={() => navigation.navigate('Reminders')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.warning + '15' },
              ]}
            >
              <Icon name="notifications" size={20} color={colors.warning} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Reminders
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Manage expense reminders and notifications
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Currency
        </Text>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
          onPress={() => setShowCurrencyPicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.info + '15' },
              ]}
            >
              <Icon name="cash" size={20} color={colors.info} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Currency
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {getCurrencyDisplayName(baseCurrency)}
              </Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text
              style={[styles.settingValue, { color: colors.textSecondary }]}
            >
              {baseCurrency}
            </Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Currency Picker Modal */}
      <CurrencyPicker
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={currency => {
          setBaseCurrency(currency.code);
          setBaseCurrencyState(currency.code);
        }}
        selectedCurrency={baseCurrency}
        currencies={[
          { code: 'USD', name: 'US Dollar', symbol: '$' },
          { code: 'EUR', name: 'Euro', symbol: '€' },
          { code: 'GBP', name: 'British Pound', symbol: '£' },
          { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
          { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
          { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
          { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
          { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
          { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
          { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
          { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
          { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
          { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
          { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
          { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
          { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
          { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
          { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
          { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
          { code: 'THB', name: 'Thai Baht', symbol: '฿' },
          { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
          { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
          { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
          { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
          { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
          { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
          { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
        ]}
      />

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Data
        </Text>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Export Data
          </Text>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Backup & Restore
          </Text>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          About
        </Text>

        <View
          style={[
            styles.settingItem,
            { borderBottomColor: colors.borderLight },
          ]}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Version
          </Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            0.0.1
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    paddingTop: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '400',
  },
  section: {
    paddingVertical: 8,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});

/**
 * Home Screen - Modern redesigned main dashboard
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useExpenseStore } from '@/store';
import { format } from 'date-fns';
import {
  RootStackParamList,
  MainTabParamList,
} from '@/navigation/AppNavigator';
import { useThemeContext } from '@/context/ThemeContext';
import { Card } from '@/components';
import Icon from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBaseCurrency } from '@/services/settings.service';
import { getCurrencySymbol } from '@/services/currency.service';
import { useFocusEffect } from '@react-navigation/native';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { expenses, isLoading, fetchExpenses } = useExpenseStore();
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const [baseCurrency, setBaseCurrency] = React.useState('INR');
  const [currencySymbol, setCurrencySymbol] = React.useState('₹');

  const handleEdit = (expenseId: string) => {
    navigation.navigate('EditExpense', { expenseId });
  };

  useFocusEffect(
    React.useCallback(() => {
      const currency = getBaseCurrency();
      setBaseCurrency(currency);
      setCurrencySymbol(getCurrencySymbol(currency));
    }, []),
  );

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.baseAmount, 0);
  const todayExpenses = expenses.filter(
    exp =>
      format(new Date(exp.date), 'yyyy-MM-dd') ===
      format(new Date(), 'yyyy-MM-dd'),
  );
  const todayTotal = todayExpenses.reduce(
    (sum, exp) => sum + exp.baseAmount,
    0,
  );
  const thisMonthExpenses = expenses.filter(
    exp =>
      format(new Date(exp.date), 'yyyy-MM') === format(new Date(), 'yyyy-MM'),
  );
  const monthTotal = thisMonthExpenses.reduce(
    (sum, exp) => sum + exp.baseAmount,
    0,
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              paddingTop: insets.top + 20,
            },
          ]}
        >
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {new Date().getHours() < 12
                ? 'Good Morning'
                : new Date().getHours() < 18
                ? 'Good Afternoon'
                : 'Good Evening'}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              SpendWise
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[
              styles.profileButton,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Icon name="person" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCardWrapper}>
            <Card variant="elevated" style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Icon name="wallet" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Expenses
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {currencySymbol}{totalExpenses.toFixed(2)}
              </Text>
            </Card>
          </View>

          <View style={styles.statCardWrapper}>
            <Card variant="elevated" style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.success + '15' },
                ]}
              >
                <Icon name="today" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {currencySymbol}{todayTotal.toFixed(2)}
              </Text>
            </Card>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCardWrapper}>
            <Card variant="elevated" style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.secondary + '15' },
                ]}
              >
                <Icon name="calendar" size={24} color={colors.secondary} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                This Month
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {currencySymbol}{monthTotal.toFixed(2)}
              </Text>
            </Card>
          </View>

          <View style={styles.statCardWrapper}>
            <Card variant="elevated" style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.accent + '15' },
                ]}
              >
                <Icon name="list" size={24} color={colors.accent} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Count
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {expenses.length}
              </Text>
            </Card>
          </View>
        </View>

        {/* Recent Expenses */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading expenses...
            </Text>
          </View>
        ) : expenses.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <Icon
              name="receipt-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No expenses yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Start tracking your expenses to see them here!
            </Text>
            <TouchableOpacity
              style={[
                styles.addFirstButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Icon name="add" size={20} color="#ffffff" />
              <Text style={styles.addFirstButtonText}>
                Add Your First Expense
              </Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View style={styles.expensesList}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Expenses
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            {expenses.slice(0, 5).map(expense => (
              <Card
                key={expense.id}
                variant="elevated"
                onPress={() => handleEdit(expense.id)}
                style={styles.expenseCard}
              >
                <View style={styles.expenseContent}>
                  <View
                    style={[
                      styles.expenseIconContainer,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Icon name="receipt" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text
                      style={[styles.expenseCategory, { color: colors.text }]}
                    >
                      {expense.category}
                    </Text>
                    <Text
                      style={[
                        styles.expenseDescription,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {expense.description || 'No description'}
                    </Text>
                    <Text
                      style={[
                        styles.expenseDate,
                        { color: colors.textTertiary },
                      ]}
                    >
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                  <View style={styles.expenseAmountContainer}>
                    <Text
                      style={[styles.expenseAmount, { color: colors.text }]}
                    >
                      {expense.currencyCode} {expense.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            bottom: insets.bottom + 20,
          },
        ]}
        onPress={() => navigation.navigate('AddExpense')}
        activeOpacity={0.85}
      >
        <Icon name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    padding: 20,
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  emptyCard: {
    marginHorizontal: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  expensesList: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  expenseCard: {
    marginBottom: 12,
    padding: 16,
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
});

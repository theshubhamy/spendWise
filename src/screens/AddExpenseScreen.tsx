/**
 * Add Expense Screen - Modern redesigned modal for adding new expenses
 */

import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Input,
  Button,
  Picker,
  DatePicker,
  TagSelector,
  ScreenHeader,
} from '@/components';
import { EXPENSE_CATEGORIES } from '@/constants';
import { useExpenseStore } from '@/store';
import { useGroupStore } from '@/store/groupStore';
import { setTagsForExpense } from '@/services/tag.service';
import * as expenseService from '@/services/expense.service';
import { splitExpenseEqually } from '@/services/group.service';
import { useThemeContext } from '@/context/ThemeContext';
import { getBaseCurrency } from '@/services/settings.service';
import Icon from '@react-native-vector-icons/ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';

interface AddExpenseScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
  route: RouteProp<RootStackParamList, 'AddExpense'>;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({
  navigation,
}) => {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { addExpense } = useExpenseStore();
  const { groups, fetchGroups } = useGroupStore();

  const [amount, setAmount] = useState('');
  const [currencyCode, setCurrencyCode] = useState(getBaseCurrency()); // Use default currency from settings
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refresh currency and groups when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setCurrencyCode(getBaseCurrency());
      fetchGroups();
    }, [fetchGroups]),
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const amountNum = parseFloat(amount);
      // baseAmount will be calculated automatically by the service

      // Create expense directly to get the ID (always personal, but can be split with group)
      const newExpense = await expenseService.createExpense({
        amount: amountNum,
        currencyCode,
        category,
        description: description || undefined,
        date,
        groupId: selectedGroupId || undefined, // Link to group if selected
      });

      // Add to store
      await addExpense({
        amount: amountNum,
        currencyCode,
        category,
        description: description || undefined,
        date,
        groupId: selectedGroupId || undefined,
      });

      // If group is selected, split the expense equally among all group members
      if (selectedGroupId) {
        const { getGroupMembers } = await import('@/services/group.service');
        const members = await getGroupMembers(selectedGroupId);
        if (members.length > 0) {
          // Split equally among all members (including the payer)
          const memberIds = members.map(m => m.id);
          await splitExpenseEqually(
            newExpense.id,
            memberIds,
            newExpense.baseAmount,
          );
        }
      }

      // Add tags to expense
      if (selectedTagIds.length > 0) {
        await setTagsForExpense(newExpense.id, selectedTagIds);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrors({ submit: 'Failed to add expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map(cat => ({
    label: cat,
    value: cat,
  }));

  const groupOptions = [
    { label: 'Personal (No Split)', value: '' },
    ...groups.map(group => ({
      label: group.name,
      value: group.id,
    })),
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScreenHeader
        title="Add Expense"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Input
            label={`Amount (${currencyCode})`}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.amount}
            leftIcon={
              <Icon
                name="cash-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <Picker
            label="Category"
            selectedValue={category}
            onValueChange={value => setCategory(value as typeof category)}
            items={categoryOptions}
            error={errors.category}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What did you spend on?"
            leftIcon={
              <Icon
                name="document-text-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <DatePicker
            label="Date"
            value={date}
            onValueChange={setDate}
            error={errors.date}
          />

          <TagSelector
            label="Tags (Optional)"
            selectedTagIds={selectedTagIds}
            onSelectionChange={setSelectedTagIds}
          />

          <Picker
            label="Split with Group (Optional)"
            selectedValue={selectedGroupId || ''}
            onValueChange={value => setSelectedGroupId(value || null)}
            items={groupOptions}
            placeholder="Keep as personal expense"
          />

          {errors.submit && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.error + '15' },
              ]}
            >
              <Icon name="alert-circle" size={20} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.submit}
              </Text>
            </View>
          )}

          <Button
            title="Add Expense"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
            size="large"
            leftIcon={
              <Icon name="checkmark-circle" size={20} color="#ffffff" />
            }
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 8,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
});

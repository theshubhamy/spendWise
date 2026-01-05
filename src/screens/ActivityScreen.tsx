/**
 * Activity Screen - Timeline of all activities
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenseStore } from '@/store';
import { useGroupStore } from '@/store/groupStore';
import { useThemeContext } from '@/context/ThemeContext';
import { format, parseISO } from 'date-fns';
import Icon from '@react-native-vector-icons/ionicons';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Expense, ExpenseGroup } from '@/types';
import { inviteService, GroupInvite } from '@/services/invite.service';
import { authService } from '@/services/auth.service';
import { groupExpenseService } from '@/services/groupExpense.service';

type ActivityScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type ActivityType =
  | 'expense_created'
  | 'expense_updated'
  | 'group_created'
  | 'group_updated'
  | 'invite_sent'
  | 'invite_accepted'
  | 'invite_declined';

interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  data?: {
    expense?: Expense;
    group?: ExpenseGroup;
    invite?: GroupInvite;
    amount?: number;
    currencyCode?: string;
  };
}

export const ActivityScreen: React.FC = () => {
  const navigation = useNavigation<ActivityScreenNavigationProp>();
  const { expenses } = useExpenseStore();
  const { groups } = useGroupStore();
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        const user = authService.getCurrentUser();
        if (user?.email) {
          // Load invites (both sent and received)
          try {
            const pendingInvites = await inviteService.getPendingInvites(
              user.email,
            );
            setInvites(pendingInvites);
          } catch (err) {
            console.log('Error loading invites:', err);
          }

          // Load group expenses for all groups
          const allGroupExpenses: Expense[] = [];
          for (const group of groups) {
            try {
              const groupExps = await groupExpenseService.getGroupExpenses(
                group.id,
              );
              allGroupExpenses.push(...groupExps);
            } catch (err) {
              console.log(`Error loading expenses for group ${group.id}:`, err);
            }
          }
          setGroupExpenses(allGroupExpenses);
        }
      } catch (err) {
        console.error('Error loading activities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [groups]);

  // Create unified activity feed
  const activities = useMemo(() => {
    const allActivities: Activity[] = [];

    // Expense activities (created)
    expenses.forEach(expense => {
      const group = expense.groupId
        ? groups.find(g => g.id === expense.groupId)
        : null;
      const groupText = group ? ` in ${group.name}` : '';

      allActivities.push({
        id: `expense_created_${expense.id}`,
        type: 'expense_created',
        timestamp: expense.createdAt,
        title: 'You added an expense',
        description: `${expense.category}${groupText} - ${
          expense.description || 'No description'
        }`,
        icon: 'receipt',
        iconColor: colors.primary,
        data: {
          expense,
          amount: expense.amount,
          currencyCode: expense.currencyCode,
        },
      });

      // Expense updated (if updatedAt is different from createdAt)
      if (expense.updatedAt && expense.updatedAt !== expense.createdAt) {
        allActivities.push({
          id: `expense_updated_${expense.id}`,
          type: 'expense_updated',
          timestamp: expense.updatedAt,
          title: 'You updated an expense',
          description: `${expense.category}${groupText} - ${
            expense.description || 'No description'
          }`,
          icon: 'create',
          iconColor: colors.secondary,
          data: {
            expense,
            amount: expense.amount,
            currencyCode: expense.currencyCode,
          },
        });
      }
    });

    // Group expense activities
    groupExpenses.forEach(expense => {
      const group = expense.groupId
        ? groups.find(g => g.id === expense.groupId)
        : null;
      const groupName = group ? group.name : 'Group';

      allActivities.push({
        id: `group_expense_created_${expense.id}`,
        type: 'expense_created',
        timestamp: expense.createdAt,
        title: 'You added an expense',
        description: `${expense.category} in ${groupName} - ${
          expense.description || 'No description'
        }`,
        icon: 'receipt',
        iconColor: colors.primary,
        data: {
          expense,
          amount: expense.amount,
          currencyCode: expense.currencyCode,
        },
      });
    });

    // Group activities
    groups.forEach(group => {
      allActivities.push({
        id: `group_created_${group.id}`,
        type: 'group_created',
        timestamp: group.createdAt,
        title: 'You created the group',
        description: `"${group.name}"`,
        icon: 'people',
        iconColor: colors.success,
        data: { group },
      });

      // Group updated (if updatedAt is different from createdAt)
      if (group.updatedAt && group.updatedAt !== group.createdAt) {
        allActivities.push({
          id: `group_updated_${group.id}`,
          type: 'group_updated',
          timestamp: group.updatedAt,
          title: 'You updated the group',
          description: `"${group.name}"`,
          icon: 'create',
          iconColor: colors.secondary,
          data: { group },
        });
      }
    });

    // Invite activities
    invites.forEach(invite => {
      if (invite.status === 'pending') {
        allActivities.push({
          id: `invite_sent_${invite.id}`,
          type: 'invite_sent',
          timestamp: invite.createdAt,
          title: 'You sent an invitation',
          description: `Invited ${invite.inviteeEmail} to "${invite.groupName}"`,
          icon: 'mail',
          iconColor: colors.primary,
          data: { invite },
        });
      } else if (invite.status === 'accepted') {
        allActivities.push({
          id: `invite_accepted_${invite.id}`,
          type: 'invite_accepted',
          timestamp: invite.createdAt,
          title: 'Invitation accepted',
          description: `${invite.inviteeEmail} joined "${invite.groupName}"`,
          icon: 'checkmark-circle',
          iconColor: colors.success,
          data: { invite },
        });
      } else if (invite.status === 'declined') {
        allActivities.push({
          id: `invite_declined_${invite.id}`,
          type: 'invite_declined',
          timestamp: invite.createdAt,
          title: 'Invitation declined',
          description: `${invite.inviteeEmail} declined "${invite.groupName}"`,
          icon: 'close-circle',
          iconColor: colors.error,
          data: { invite },
        });
      }
    });

    // Sort by timestamp (newest first)
    return allActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [expenses, groups, invites, groupExpenses, colors]);

  const handleActivityPress = (activity: Activity) => {
    if (activity.data?.expense) {
      navigation.navigate('EditExpense', {
        expenseId: activity.data.expense.id,
      });
    } else if (activity.data?.group) {
      navigation.navigate('GroupDetail', { groupId: activity.data.group.id });
    }
  };

  const renderActivityItem = (activity: Activity) => {
    const activityDate = parseISO(activity.timestamp);
    const time = format(activityDate, 'h:mm a');

    return (
      <TouchableOpacity
        key={activity.id}
        onPress={() => handleActivityPress(activity)}
        activeOpacity={0.7}
        disabled={!activity.data?.expense && !activity.data?.group}
      >
        <View style={styles.activityItem}>
          <View style={styles.activityContent}>
            <View
              style={[
                styles.activityIconContainer,
                { backgroundColor: activity.iconColor + '15' },
              ]}
            >
              <Icon
                name={activity.icon as any}
                size={20}
                color={activity.iconColor}
              />
            </View>
            <View style={styles.activityInfo}>
              <View style={styles.activityHeader}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {activity.title}
                </Text>
                {activity.data?.amount !== undefined && (
                  <Text style={[styles.activityAmount, { color: colors.text }]}>
                    {activity.data.currencyCode}{' '}
                    {activity.data.amount.toFixed(2)}
                  </Text>
                )}
                <Text style={styles.activityTime}>{time}</Text>
              </View>
              <Text
                style={[
                  styles.activityDescription,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={3}
              >
                {activity.description}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const totalActivities = activities.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Activity
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Loading activities...
          </Text>
        </View>
      ) : totalActivities === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="time-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No activity yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Your activities will appear here as you use the app
          </Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={({ item }) => renderActivityItem(item)}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 8,
  },
  timelineContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    position: 'absolute',
    top: 16,
    bottom: -16,
    left: 5,
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    gap: 6,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  activityDescription: {
    fontSize: 14,
    flex: 1,
  },
  activityFooter: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
});

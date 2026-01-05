/**
 * Group Detail Screen - View group details, members, and balances
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useGroupStore } from '@/store/groupStore';
import {
  getGroupMembers,
  removeMemberFromGroup,
  calculateGroupBalances,
  getSettlementSuggestions,
} from '@/services/group.service';
import { Button, Card } from '@/components';
import { GroupMember } from '@/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useThemeContext } from '@/context/ThemeContext';
import Icon from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GroupDetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: { params: { groupId: string } };
}

export const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const { getGroupById, deleteGroup, fetchGroups } = useGroupStore();
  const group = getGroupById(groupId);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [settlements, setSettlements] = useState<
    Array<{ from: string; to: string; amount: number }>
  >([]);

  const [activeTab, setActiveTab] = useState<
    'members' | 'balances' | 'settleup' | 'settings'
  >('members');

  const loadGroupData = useCallback(async () => {
    if (!group) return;

    const groupMembers = await getGroupMembers(groupId);
    setMembers(groupMembers);

    const groupBalances = await calculateGroupBalances(groupId);
    setBalances(groupBalances);

    const settlementSuggestions = await getSettlementSuggestions(groupId);
    setSettlements(settlementSuggestions);
  }, [groupId, group]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const handleRemoveMember = (member: GroupMember) => {
    Alert.alert('Remove Member', `Remove ${member.name} from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMemberFromGroup(groupId, member.id);
            await loadGroupData();
          } catch {
            Alert.alert('Error', 'Failed to remove member');
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? All expenses and members will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              await fetchGroups();
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ],
    );
  };

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Card variant="elevated" style={styles.errorCard}>
          <Icon name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Group not found
          </Text>
        </Card>
      </View>
    );
  }

  const getMemberName = (memberId: string): string => {
    return members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: colors.primary + '15' },
          ]}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {group.name}
          </Text>
          {group.description && (
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {group.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: colors.primary + '15' },
          ]}
          onPress={() => navigation.navigate('SettleUp', { groupId: group.id })}
          activeOpacity={0.7}
        >
          <Icon name="cash" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
          style={styles.tabBar}
        >
          {[
            { key: 'members', label: 'Members', icon: 'people' },
            { key: 'balances', label: 'Balances', icon: 'wallet' },
            { key: 'settleup', label: 'Settle Up', icon: 'cash' },
            { key: 'settings', label: 'Settings', icon: 'settings' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && [
                  styles.tabActive,
                  { borderBottomColor: colors.primary },
                ],
              ]}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.7}
            >
              <Icon
                name={tab.icon as any}
                size={20}
                color={
                  activeTab === tab.key ? colors.primary : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeTab === tab.key
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Members Tab */}
        {activeTab === 'members' && (
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <View
                  style={[
                    styles.sectionIconContainer,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Icon name="people" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Members ({members.length})
                </Text>
              </View>
              <Button
                title="Add"
                size="xsmall"
                onPress={() => navigation.navigate('Invite', { groupId })}
                variant="outline"
                leftIcon={
                  <Icon name="add-circle" size={18} color={colors.primary} />
                }
              />
            </View>

            {members.length > 0 && (
              <View style={styles.membersList}>
                {members.map((member, index) => (
                  <View
                    key={member.id}
                    style={[
                      styles.memberItem,
                      index < members.length - 1 && [
                        styles.memberItemBorder,
                        { borderBottomColor: colors.border },
                      ],
                    ]}
                  >
                    <View style={styles.memberInfo}>
                      <View
                        style={[
                          styles.memberAvatar,
                          { backgroundColor: colors.primary + '15' },
                        ]}
                      >
                        <Icon name="person" size={20} color={colors.primary} />
                      </View>
                      <View style={styles.memberDetails}>
                        <Text
                          style={[styles.memberName, { color: colors.text }]}
                        >
                          {member.name}
                        </Text>
                        {member.email && (
                          <Text
                            style={[
                              styles.memberEmail,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {member.email}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member)}
                      style={[
                        styles.removeButtonContainer,
                        { backgroundColor: colors.error + '15' },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Icon name="close" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Balances Tab */}
        {activeTab === 'balances' && (
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconContainer,
                  { backgroundColor: colors.secondary + '15' },
                ]}
              >
                <Icon name="wallet" size={20} color={colors.secondary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Balances
              </Text>
            </View>
            <View style={styles.balancesList}>
              {members.length > 0 ? (
                members.map((member, index) => {
                  const balance = balances[member.id] || 0;
                  return (
                    <View
                      key={member.id}
                      style={[
                        styles.balanceItem,
                        index < members.length - 1 && [
                          styles.balanceItemBorder,
                          { borderBottomColor: colors.border },
                        ],
                      ]}
                    >
                      <View style={styles.balanceInfo}>
                        <View
                          style={[
                            styles.balanceAvatar,
                            {
                              backgroundColor:
                                balance >= 0
                                  ? colors.success + '15'
                                  : colors.error + '15',
                            },
                          ]}
                        >
                          <Icon
                            name={balance >= 0 ? 'arrow-up' : 'arrow-down'}
                            size={18}
                            color={balance >= 0 ? colors.success : colors.error}
                          />
                        </View>
                        <Text
                          style={[styles.balanceName, { color: colors.text }]}
                        >
                          {member.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.balanceAmount,
                          {
                            color: balance >= 0 ? colors.success : colors.error,
                          },
                        ]}
                      >
                        {balance >= 0 ? '+' : ''}
                        {group.currencyCode} {Math.abs(balance).toFixed(2)}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Icon
                    name="wallet-outline"
                    size={48}
                    color={colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No members yet
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Settle Up Tab */}
        {activeTab === 'settleup' && (
          <>
            {settlements.length > 0 && (
              <Card variant="elevated" style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIconContainer,
                      { backgroundColor: colors.success + '15' },
                    ]}
                  >
                    <Icon
                      name="swap-horizontal"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Settlement Suggestions
                  </Text>
                </View>
                <View style={styles.settlementsList}>
                  {settlements.map((settlement, index) => (
                    <View
                      key={index}
                      style={[
                        styles.settlementItem,
                        index < settlements.length - 1 && [
                          styles.settlementItemBorder,
                          { borderBottomColor: colors.border },
                        ],
                      ]}
                    >
                      <View style={styles.settlementContent}>
                        <View
                          style={[
                            styles.settlementIconContainer,
                            { backgroundColor: colors.error + '15' },
                          ]}
                        >
                          <Icon
                            name="arrow-forward"
                            size={16}
                            color={colors.error}
                          />
                        </View>
                        <Text
                          style={[
                            styles.settlementText,
                            { color: colors.text },
                          ]}
                        >
                          <Text style={styles.settlementFrom}>
                            {getMemberName(settlement.from)}
                          </Text>{' '}
                          owes{' '}
                          <Text style={styles.settlementTo}>
                            {getMemberName(settlement.to)}
                          </Text>
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.settlementAmount,
                          { color: colors.error },
                        ]}
                      >
                        {group.currencyCode} {settlement.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <Card variant="elevated" style={styles.section}>
              <Button
                title="Settle Up"
                onPress={() => navigation.navigate('SettleUp', { groupId })}
                size="large"
                leftIcon={<Icon name="cash" size={22} color="#ffffff" />}
              />
            </Card>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconContainer,
                  { backgroundColor: colors.secondary + '15' },
                ]}
              >
                <Icon name="settings" size={20} color={colors.secondary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Group Settings
              </Text>
            </View>

            <View style={styles.settingsList}>
              <View
                style={[
                  styles.settingItem,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.settingInfo}>
                  <Icon
                    name="information-circle"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <View style={styles.settingDetails}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Group Name
                    </Text>
                    <Text
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {group.name}
                    </Text>
                  </View>
                </View>
              </View>

              {group.description && (
                <View
                  style={[
                    styles.settingItem,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <View style={styles.settingInfo}>
                    <Icon
                      name="document-text"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <View style={styles.settingDetails}>
                      <Text
                        style={[styles.settingLabel, { color: colors.text }]}
                      >
                        Description
                      </Text>
                      <Text
                        style={[
                          styles.settingValue,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {group.description}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View
                style={[
                  styles.settingItem,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.settingInfo}>
                  <Icon name="cash" size={20} color={colors.textSecondary} />
                  <View style={styles.settingDetails}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Currency
                    </Text>
                    <Text
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {group.currencyCode}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="people" size={20} color={colors.textSecondary} />
                  <View style={styles.settingDetails}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Members
                    </Text>
                    <Text
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {members.length} member{members.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.deleteSection}>
              <TouchableOpacity
                style={[
                  styles.deleteGroupButton,
                  { backgroundColor: colors.error + '15' },
                ]}
                onPress={handleDeleteGroup}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.deleteIconContainer,
                    { backgroundColor: colors.error + '25' },
                  ]}
                >
                  <Icon name="trash" size={20} color={colors.error} />
                </View>
                <Text style={[styles.deleteGroupText, { color: colors.error }]}>
                  Delete Group
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarContainer: {
    borderBottomWidth: 1,
  },
  tabBar: {
    flexGrow: 0,
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 100,
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  addMemberContainer: {
    marginBottom: 16,
    gap: 12,
  },

  membersList: {
    marginTop: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  memberItemBorder: {
    borderBottomWidth: 1,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    fontWeight: '500',
  },
  removeButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settlementsList: {
    marginTop: 8,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settlementItemBorder: {
    borderBottomWidth: 1,
  },
  settlementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settlementIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settlementText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  settlementFrom: {
    fontWeight: '700',
  },
  settlementTo: {
    fontWeight: '700',
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  balancesList: {
    marginTop: 8,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  balanceItemBorder: {
    borderBottomWidth: 1,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  balanceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  errorCard: {
    margin: 20,
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 14,
    gap: 12,
  },
  deleteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteGroupText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  settingsList: {
    marginTop: 8,
  },
  settingItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },
});

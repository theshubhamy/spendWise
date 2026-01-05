/**
 * Groups Screen - Manage expense groups
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGroupStore } from '@/store/groupStore';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { format } from 'date-fns';
import { useThemeContext } from '@/context/ThemeContext';
import { Card } from '@/components';
import Icon from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type GroupsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const GroupsScreen: React.FC = () => {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const { groups, isLoading, fetchGroups } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Groups
          </Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.primary + '15' },
            ]}
            onPress={() => navigation.navigate('CreateGroup')}
            activeOpacity={0.7}
          >
            <Icon name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading groups...
          </Text>
        </View>
      ) : groups.length === 0 ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.emptyContent}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="elevated" style={styles.emptyCard}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <Icon name="people-outline" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No groups yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Create a group to split expenses with others
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateGroup')}
              activeOpacity={0.8}
            >
              <Icon name="add-circle" size={22} color="#ffffff" />
              <Text style={styles.createButtonText}>
                Create Your First Group
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {groups.map(group => (
            <Card
              key={group.id}
              variant="elevated"
              onPress={() =>
                navigation.navigate('GroupDetail', { groupId: group.id })
              }
              style={styles.groupCard}
            >
              <View style={styles.groupContent}>
                <View
                  style={[
                    styles.groupIconContainer,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Icon name="people" size={24} color={colors.primary} />
                </View>
                <View style={styles.groupInfo}>
                  <View style={styles.groupHeader}>
                    <Text style={[styles.groupName, { color: colors.text }]}>
                      {group.name}
                    </Text>
                    <View
                      style={[
                        styles.currencyBadge,
                        { backgroundColor: colors.primary + '15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.groupCurrency,
                          { color: colors.primary },
                        ]}
                      >
                        {group.currencyCode}
                      </Text>
                    </View>
                  </View>
                  {group.description && (
                    <Text
                      style={[
                        styles.groupDescription,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {group.description}
                    </Text>
                  )}
                  <View style={styles.groupFooter}>
                    <Icon
                      name="calendar-outline"
                      size={14}
                      color={colors.textTertiary}
                    />
                    <Text
                      style={[styles.groupDate, { color: colors.textTertiary }]}
                    >
                      {format(new Date(group.createdAt), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={colors.textTertiary}
                />
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      {groups.length > 0 && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              bottom: insets.bottom + 20,
            },
          ]}
          onPress={() => navigation.navigate('CreateGroup')}
          activeOpacity={0.85}
        >
          <Icon name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  groupCard: {
    marginBottom: 16,
    padding: 20,
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  groupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  groupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  groupCurrency: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
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

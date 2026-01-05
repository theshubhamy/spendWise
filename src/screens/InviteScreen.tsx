/**
 * Invite Screen - Invite users to a group via email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Input } from '@/components';
import { inviteService } from '@/services/invite.service';
import { useGroupStore } from '@/store/groupStore';
import { useThemeContext } from '@/context/ThemeContext';
import Icon from '@react-native-vector-icons/ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
interface InviteScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Invite'>;
  route: { params: { groupId: string } };
}

export const InviteScreen: React.FC<InviteScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  const { getGroupById } = useGroupStore();
  const group = getGroupById(groupId);

  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await inviteService.createInvite(
        groupId,
        group?.name || 'Group',
        inviteEmail.trim(),
      );
      Alert.alert('Success', 'Invitation sent successfully', [
        {
          text: 'OK',
          onPress: () => {
            setInviteEmail('');
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      console.error('Error sending invite:', err);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
            Invite to
            <Text
              style={[styles.groupNameHighlight, { color: colors.primary }]}
            >
              &nbsp;{group.name || 'Group'}
            </Text>
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Main Invite Card */}
        <Card variant="elevated" style={styles.inviteCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Icon name="mail" size={56} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Invite by Email
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Send an invitation to join{' '}
            <Text
              style={[styles.groupNameHighlight, { color: colors.primary }]}
            >
              {group.name}
            </Text>
            . They'll receive an email with instructions to join the group.
          </Text>

          <View style={styles.inputContainer}>
            <Input
              label="Email Address"
              value={inviteEmail}
              onChangeText={text => {
                setInviteEmail(text);
                setError('');
              }}
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error}
              leftIcon={
                <Icon
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />
          </View>

          {error && (
            <View style={styles.errorWrapper}>
              <View
                style={[
                  styles.errorIconContainer,
                  { backgroundColor: colors.error + '15' },
                ]}
              >
                <Icon name="alert-circle" size={20} color={colors.error} />
              </View>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          <Button
            title="Send Invitation"
            onPress={handleInviteUser}
            loading={loading}
            style={styles.submitButton}
            size="large"
            leftIcon={<Icon name="send" size={22} color="#ffffff" />}
          />
        </Card>

        {/* Info Card */}
        <Card variant="elevated" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View
              style={[
                styles.infoIconContainer,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <Icon
                name="information-circle"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              How it works
            </Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View
                style={[
                  styles.infoStepNumber,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Text style={[styles.infoStepText, { color: colors.primary }]}>
                  1
                </Text>
              </View>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Enter the email address of the person you want to invite
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View
                style={[
                  styles.infoStepNumber,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Text style={[styles.infoStepText, { color: colors.primary }]}>
                  2
                </Text>
              </View>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                They'll receive an email with a link to join the group
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View
                style={[
                  styles.infoStepNumber,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Text style={[styles.infoStepText, { color: colors.primary }]}>
                  3
                </Text>
              </View>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Once they accept, they'll be added to the group automatically
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: 4,
    fontSize: 22,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  inviteCard: {
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  groupNameHighlight: {
    fontSize: 22,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  errorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  errorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
  errorCard: {
    padding: 40,
    alignItems: 'center',
    margin: 20,
  },
  infoCard: {
    padding: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  infoStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoStepText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
});

/**
 * Reminder service - handles reminders (notifications removed)
 */

import { getDatabase } from '@/database';
import { QUERIES } from '@/database/queries';
import { Reminder } from '@/types';
import { generateUUID } from '@/utils/uuid';

/**
 * Initialize notification service (stub - notifications removed)
 */
export const initNotifications = async (): Promise<void> => {
  // Notifications functionality removed
  // Reminders are still stored in database but won't trigger notifications
  console.log('Reminder service initialized (notifications disabled)');
};

/**
 * Schedule a local notification
 */
export const scheduleReminder = async (
  reminder: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>,
): Promise<Reminder> => {
  const db = getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();

  // Save to database
  db.execute(QUERIES.INSERT_REMINDER, [
    id,
    reminder.type,
    reminder.title,
    reminder.message,
    reminder.scheduledDate,
    reminder.expenseId || null,
    reminder.recurringExpenseId || null,
    0, // isCompleted
    now,
  ]);

  // Notifications removed - reminder is saved to database only
  // Future: Can implement notifications using @react-native-firebase/messaging or other solution

  return {
    ...reminder,
    id,
    createdAt: now,
    isCompleted: false,
  };
};

/**
 * Get all pending reminders
 */
export const getPendingReminders = async (): Promise<Reminder[]> => {
  const db = getDatabase();
  const result = db.query(QUERIES.GET_ALL_REMINDERS);

  const reminders: Reminder[] = [];
  for (let i = 0; i < (result.rows?.length || 0); i++) {
    const row = result.rows?.[i] as Record<string, unknown> | undefined;
    if (row) {
      reminders.push({
        id: row.id as string,
        type: row.type as Reminder['type'],
        title: row.title as string,
        message: row.message as string,
        scheduledDate: row.scheduled_date as string,
        expenseId: row.expense_id as string | undefined,
        recurringExpenseId: row.recurring_expense_id as string | undefined,
        isCompleted: (row.is_completed as number) === 1,
        createdAt: row.created_at as string,
      });
    }
  }

  return reminders;
};

/**
 * Mark reminder as completed
 */
export const completeReminder = async (id: string): Promise<void> => {
  const db = getDatabase();
  db.execute(QUERIES.UPDATE_REMINDER, [1, id]); // isCompleted = 1

  // Notifications removed - no need to cancel
};

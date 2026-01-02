/**
 * Tag Selector Component - Modern redesigned multi-select tags
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TagChip } from './TagChip';
import { useTagStore } from '@/store/tagStore';
import { Tag } from '@/types';
import { useThemeContext } from '@/context/ThemeContext';

interface TagSelectorProps {
  selectedTagIds: string[];
  onSelectionChange: (tagIds: string[]) => void;
  label?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onSelectionChange,
  label,
}) => {
  const { colors } = useThemeContext();
  const { tags, fetchTags } = useTagStore();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    // Update selected tags when tagIds change
    const selected = tags.filter((tag) => selectedTagIds.includes(tag.id));
    setSelectedTags(selected);
  }, [selectedTagIds, tags]);

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    if (isSelected) {
      onSelectionChange(selectedTagIds.filter((id) => id !== tag.id));
    } else {
      onSelectionChange([...selectedTagIds, tag.id]);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      {selectedTags.length > 0 && (
        <View
          style={[
            styles.selectedContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[styles.selectedLabel, { color: colors.textSecondary }]}
          >
            Selected ({selectedTags.length})
          </Text>
          <View style={styles.selectedTags}>
            {selectedTags.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                size="small"
                selected={true}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </View>
      )}

      {tags.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tags available. Create tags in the Tags screen.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.tagsContainer}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={tags.length > 3}
        >
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <TagChip
                key={tag.id}
                tag={tag}
                size="medium"
                selected={isSelected}
                onPress={() => toggleTag(tag)}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  selectedContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scrollView: {
    maxHeight: 70,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 20,
  },
  emptyContainer: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});


import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Theme } from '../constants/Theme';
import { Trash2, Clock } from 'lucide-react-native';

interface Task {
  id: string;
  title: string;
  body: string;
  time: string;
}

interface Props {
  tasks: Task[];
  onDelete: (id: string) => void;
}

export const TaskList = ({ tasks, onDelete }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Agenda</Text>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={styles.timeContainer}>
              <Clock size={14} color={Theme.colors.primary} />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
              <Trash2 size={18} color={Theme.colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks scheduled yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    color: Theme.colors.text,
    fontSize: Theme.fontSizes.l,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.m,
  },
  listContent: {
    paddingBottom: Theme.spacing.xl,
  },
  taskItem: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 2,
    borderLeftColor: Theme.colors.secondary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
    gap: 4,
    minWidth: 60,
  },
  timeText: {
    color: Theme.colors.primary,
    fontSize: Theme.fontSizes.s,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    color: Theme.colors.text,
    fontSize: Theme.fontSizes.m,
    fontWeight: '600',
    marginBottom: 2,
  },
  body: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.fontSizes.s,
  },
  deleteBtn: {
    padding: Theme.spacing.s,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.l,
    fontStyle: 'italic',
  }
});

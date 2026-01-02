import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Theme } from '../constants/Theme';
import { Sun, CloudRain, Cloud } from 'lucide-react-native';
import { format } from 'date-fns';

interface Props {
  onPress: () => void;
  isLoading: boolean;
  weatherCondition?: string;
  temperature?: number;
}

export const MorningCard = ({ onPress, isLoading, weatherCondition, temperature }: Props) => {
  const getIcon = () => {
    // Lucide icons expect color and size as props, ensuring strict typing
    if (!weatherCondition) return <Sun color={Theme.colors.primary} size={32} />;
    const cond = weatherCondition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain color={Theme.colors.primary} size={32} />;
    if (cond.includes('cloud') || cond.includes('fog')) return <Cloud color={Theme.colors.primary} size={32} />;
    return <Sun color={Theme.colors.primary} size={32} />;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning</Text>
        {getIcon()}
      </View>

      <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM do')}</Text>

      <View style={styles.weatherInfo}>
        {weatherCondition && (
          <Text style={styles.weatherText}>
            {temperature}°C • {weatherCondition}
          </Text>
        )}
      </View>

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Connecting to Jarvis...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    marginBottom: Theme.spacing.l,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
    justifyContent: 'space-between',
  },
  greeting: {
    color: Theme.colors.text,
    fontSize: Theme.fontSizes.xl,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  date: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.fontSizes.m,
    marginBottom: Theme.spacing.m,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    color: Theme.colors.primary,
    fontSize: Theme.fontSizes.l,
    fontWeight: '600',
  },
  loader: {
    marginTop: Theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  loadingText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.fontSizes.s,
  }
});

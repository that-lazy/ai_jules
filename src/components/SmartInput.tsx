import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Theme } from '../constants/Theme';
import { Send } from 'lucide-react-native';

interface Props {
  onSend: (text: string) => void;
  isProcessing: boolean;
}

export const SmartInput = ({ onSend, isProcessing }: Props) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Smart Planner</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Call Mom at 5 PM..."
          placeholderTextColor={Theme.colors.textSecondary}
          value={text}
          onChangeText={setText}
          editable={!isProcessing}
        />
        <TouchableOpacity
          style={[styles.button, (!text.trim() || isProcessing) && styles.disabledButton]}
          onPress={handleSend}
          disabled={!text.trim() || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Send color="#000" size={20} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.l,
  },
  label: {
    color: Theme.colors.primary,
    fontSize: Theme.fontSizes.s,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Theme.spacing.s,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#333',
    padding: Theme.spacing.s,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: Theme.fontSizes.m,
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: Theme.spacing.s,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.s,
    borderRadius: Theme.borderRadius.s,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
  },
});

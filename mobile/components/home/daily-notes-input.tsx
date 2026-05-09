import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { FontSizes, Spacing } from '@/constants/theme';
import { DailyLogService } from '@/services/home-service';

interface DailyNotesInputProps {
  initialNotes?: string | null;
  onSaved?: () => void;
}

export function DailyNotesInput({ initialNotes, onSaved }: DailyNotesInputProps) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes ?? '');
    setSaved(false);
  }, [initialNotes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await DailyLogService.updateDailyLog(today, { notes });
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as anotações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Anotações do Dia</Text>
        {saved && <Text style={styles.savedLabel}>✓ Salvo</Text>}
      </View>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={t => { setNotes(t); setSaved(false); }}
        placeholder="Como foi o treino? Observações, sensações, cargas..."
        placeholderTextColor="#bbb"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.saveBtn, (isSaving || !notes.trim()) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={isSaving || !notes.trim()}
      >
        <Text style={styles.saveBtnText}>{isSaving ? 'Salvando...' : 'Salvar Anotação'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  savedLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    padding: Spacing.md,
    fontSize: FontSizes.sm,
    color: '#111',
    minHeight: 100,
    backgroundColor: '#fafafa',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  saveBtn: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.35,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

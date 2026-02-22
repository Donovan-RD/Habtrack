import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { X, Hash, CheckSquare } from 'lucide-react-native';
import { HabitType, CategoryType, Habit } from '../types/habit';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, color: string, type: HabitType, goal: number, unit: string, category: CategoryType) => void;
  // Nouvelle prop optionnelle : L'habitude à modifier
  habitToEdit?: Habit | null;
  onUpdate?: (id: string, updates: Partial<Habit>) => void;
}

const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#64748B"];
const CATEGORIES: CategoryType[] = ['Sport', 'Santé', 'Mindfulness', 'Travail', 'Social', 'Autre'];

export const AddHabitModal = ({ visible, onClose, onAdd, habitToEdit, onUpdate }: AddHabitModalProps) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[4]);
  const [type, setType] = useState<HabitType>('boolean');
  const [goal, setGoal] = useState('1');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<CategoryType>('Santé');

  // Effet pour pré-remplir le formulaire si on est en mode "Édition"
  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setSelectedColor(habitToEdit.color);
      setType(habitToEdit.type);
      setGoal(habitToEdit.goal.toString());
      setUnit(habitToEdit.unit);
      setCategory(habitToEdit.category);
    } else {
      // Reset si mode création
      resetForm();
    }
  }, [habitToEdit, visible]);

  const resetForm = () => {
    setTitle('');
    setType('boolean');
    setGoal('1');
    setUnit('');
    setCategory('Santé');
    setSelectedColor(COLORS[4]);
  };

  const handleSave = () => {
    if (title.trim().length === 0) return;

    if (habitToEdit && onUpdate) {
      // MODE MODIFICATION
      onUpdate(habitToEdit.id, {
        title,
        color: selectedColor,
        category,
        goal: parseInt(goal) || 1,
        unit
      });
    } else {
      // MODE CRÉATION
      onAdd(
        title, 
        selectedColor, 
        type, 
        type === 'quantitative' ? parseInt(goal) || 1 : 1, 
        type === 'quantitative' ? unit : 'x',
        category
      );
    }
    resetForm();
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.centeredView}>
        <View style={styles.modalContentWrapper}>
            <View style={styles.modalView}>
              <View style={styles.header}>
                <Text style={styles.modalTitle}>
                  {habitToEdit ? "Modifier l'habitude" : "Nouvelle Habitude"}
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Lire, Boire de l'eau..."
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                />

                {/* On cache le sélecteur de type en mode édition pour simplifier (changer de type est complexe) */}
                {!habitToEdit && (
                  <>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.typeSelector}>
                      <TouchableOpacity 
                        style={[styles.typeButton, type === 'boolean' && styles.typeButtonActive]}
                        onPress={() => setType('boolean')}
                      >
                        <CheckSquare size={18} color={type === 'boolean' ? 'white' : '#64748B'} />
                        <Text style={[styles.typeText, type === 'boolean' && styles.typeTextActive]}>Simple</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.typeButton, type === 'quantitative' && styles.typeButtonActive]}
                        onPress={() => setType('quantitative')}
                      >
                        <Hash size={18} color={type === 'quantitative' ? 'white' : '#64748B'} />
                        <Text style={[styles.typeText, type === 'quantitative' && styles.typeTextActive]}>Compteur</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {(type === 'quantitative' || habitToEdit?.type === 'quantitative') && (
                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.label}>Objectif</Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={goal}
                        onChangeText={setGoal}
                        keyboardType="numeric"
                        placeholder="2000"
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.label}>Unité</Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={unit}
                        onChangeText={setUnit}
                        placeholder="ml, pages..."
                      />
                    </View>
                  </View>
                )}

                <Text style={styles.label}>Catégorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, category === cat && styles.catChipActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Couleur</Text>
                <View style={styles.colorsGrid}>
                  {COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorCircle, { backgroundColor: color }, selectedColor === color && styles.selectedColor]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: selectedColor }]} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>
                    {habitToEdit ? "Enregistrer les modifications" : "Créer l'habitude"}
                  </Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContentWrapper: { maxHeight: '90%', backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalView: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  input: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, fontSize: 16, color: '#1E293B', marginBottom: 20 },
  inputSmall: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12, fontSize: 16, color: '#1E293B' },
  label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 20 },
  typeSelector: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 4, borderRadius: 12, marginBottom: 20 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, gap: 8 },
  typeButtonActive: { backgroundColor: '#1E293B' },
  typeText: { fontWeight: '600', color: '#64748B' },
  typeTextActive: { color: 'white' },
  catScroll: { flexDirection: 'row', marginBottom: 24 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  catChipActive: { backgroundColor: '#E0F2FE', borderColor: '#3B82F6' },
  catText: { color: '#64748B', fontWeight: '600' },
  catTextActive: { color: '#3B82F6' },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  selectedColor: { borderWidth: 3, borderColor: '#1E293B' },
  saveButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { NutritionService } from '@/services/nutrition-service';

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
}

interface SearchResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AddMealByIngredientsModalProps {
  visible: boolean;
  onClose: () => void;
  onMealAdded: () => void;
}

export function AddMealByIngredientsModal({
  visible,
  onClose,
  onMealAdded,
}: AddMealByIngredientsModalProps) {
  const [mealName, setMealName] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);

  const handleSearchIngredient = async () => {
    if (!ingredientInput.trim()) {
      alert('Digite um ingrediente');
      return;
    }

    try {
      setIsLoading(true);
      const results = await NutritionService.searchFood(ingredientInput);
      
      if (results && results.length > 0) {
        setSearchResults(results);
        setShowResults(true);
      } else {
        Alert.alert('Nenhum resultado', `Não encontramos "${ingredientInput}"`);
      }
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert('Erro', 'Falha ao buscar informações nutricionais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setIngredients([...ingredients, result.name]);
    setIngredientInput('');
    setShowResults(false);
    setSearchResults([]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleCalculateNutrition = async () => {
    if (ingredients.length === 0) {
      alert('Adicione pelo menos um ingrediente');
      return;
    }

    if (!mealName.trim()) {
      alert('Digite o nome da refeição');
      return;
    }

    try {
      setIsLoading(true);
      const aggregated = await NutritionService.aggregateMeal(ingredients);
      setNutrition(aggregated);
    } catch (error) {
      console.error('Error calculating:', error);
      Alert.alert('Erro', 'Falha ao calcular nutrição');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!nutrition) {
      alert('Calcule a nutrição primeiro');
      return;
    }

    try {
      setIsLoading(true);
      const { DailyLogService } = await import('@/services/home-service');
      await DailyLogService.addMeal({
        mealName,
        totalKcal: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      });

      // Reset form
      setMealName('');
      setIngredients([]);
      setNutrition(null);

      onMealAdded();
      onClose();

      Alert.alert('✅ Sucesso', 'Refeição adicionada com nutrição automática!');
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Erro', 'Falha ao adicionar refeição');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Refeição por Ingredientes</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Meal Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Nome da Refeição</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Almoço, Café da manhã"
                value={mealName}
                onChangeText={setMealName}
                editable={!isLoading}
                placeholderTextColor={Colors.light.text + '80'}
              />
            </View>

            {/* Logo de busca */}
            <Text style={styles.sectionTitle}>Ingredientes</Text>

            {/* Search Ingredient */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.ingredientInput}
                placeholder="Ex: 2 ovos, banana, arroz"
                value={ingredientInput}
                onChangeText={setIngredientInput}
                editable={!isLoading && !showResults}
                placeholderTextColor={Colors.light.text + '80'}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchIngredient}
                disabled={isLoading || !ingredientInput}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.searchButtonText}>🔍</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Resultados</Text>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleSelectResult(result)}
                  >
                    <View style={styles.resultContent}>
                      <Text style={styles.resultName}>{result.name}</Text>
                      <Text style={styles.resultMacros}>
                        {Math.round(result.calories)} kcal • {Math.round(result.protein)}g P
                      </Text>
                    </View>
                    <Text style={styles.selectText}>+</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Added Ingredients */}
            {ingredients.length > 0 && (
              <View style={styles.ingredientsListContainer}>
                <Text style={styles.ingredientsTitle}>
                  {ingredients.length} ingrediente{ingredients.length !== 1 ? 's' : ''}
                </Text>
                {ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientTag}>
                    <Text style={styles.ingredientTagText}>{ingredient}</Text>
                    <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Nutrition Display */}
            {nutrition && (
              <View style={styles.nutritionContainer}>
                <Text style={styles.nutritionTitle}>📊 Nutrição Calculada</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(nutrition.calories)}</Text>
                    <Text style={styles.nutritionLabel}>kcal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(nutrition.protein)}g</Text>
                    <Text style={styles.nutritionLabel}>Proteína</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(nutrition.carbs)}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{Math.round(nutrition.fat)}g</Text>
                    <Text style={styles.nutritionLabel}>Gordura</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.actions}>
            {ingredients.length > 0 && !nutrition && (
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={handleCalculateNutrition}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.calculateButtonText}>Calcular Nutrição</Text>
                )}
              </TouchableOpacity>
            )}

            {nutrition && (
              <TouchableOpacity
                style={styles.addMealButton}
                onPress={handleAddMeal}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.addMealButtonText}>Adicionar Refeição</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Spacing.xl,
    maxHeight: '95%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    fontSize: FontSizes.lg,
    color: Colors.light.text,
  },
  form: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginVertical: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ingredientInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  searchButtonText: {
    fontSize: FontSizes.lg,
  },
  resultsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resultsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.light.text,
  },
  resultMacros: {
    fontSize: FontSizes.sm,
    color: '#999',
    marginTop: Spacing.xs,
  },
  selectText: {
    fontSize: FontSizes.lg,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  ingredientsListContainer: {
    marginBottom: Spacing.lg,
  },
  ingredientsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  ingredientTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '20',
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  ingredientTagText: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
    fontWeight: '500',
  },
  removeButton: {
    fontSize: FontSizes.lg,
    color: '#d32f2f',
  },
  nutritionContainer: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  nutritionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: Spacing.md,
  },
  nutritionValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  nutritionLabel: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginTop: Spacing.xs,
  },
  actions: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: FontSizes.md,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calculateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: FontSizes.md,
  },
  addMealButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMealButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: FontSizes.md,
  },
});

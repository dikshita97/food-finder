import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

class FoodImageRecognition {
  private foodClassifier: any = null;
  private objectDetector: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initializing food image recognition...');
      
      // Try WebGPU first, fallback to CPU
      try {
        this.foodClassifier = await pipeline(
          'image-classification',
          'Kaludi/food-category-classification-v2.0',
          { device: 'webgpu' }
        );
      } catch (error) {
        console.warn('WebGPU not available for food classifier, using CPU:', error);
        this.foodClassifier = await pipeline(
          'image-classification',
          'Kaludi/food-category-classification-v2.0'
        );
      }

      this.initialized = true;
      console.log('Food image recognition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize food image recognition:', error);
      throw error;
    }
  }

  // 2. Food Image Recognition - Analyze uploaded photos to identify dishes
  async classifyFoodImage(imageFile: File | string): Promise<{
    predictions: Array<{ label: string; score: number }>;
    topMatch: string;
    confidence: number;
    suggestions: string[];
  }> {
    await this.initialize();

    if (!this.foodClassifier) {
      throw new Error('Food classifier not initialized');
    }

    try {
      let imageUrl: string;
      
      if (typeof imageFile === 'string') {
        imageUrl = imageFile;
      } else {
        imageUrl = URL.createObjectURL(imageFile);
      }

      console.log('Classifying food image...');
      const predictions = await this.foodClassifier(imageUrl);
      
      // Clean up object URL if we created one
      if (typeof imageFile !== 'string') {
        URL.revokeObjectURL(imageUrl);
      }

      const topPrediction = predictions[0];
      const suggestions = this.generateFoodSuggestions(topPrediction.label);

      return {
        predictions: predictions.slice(0, 5),
        topMatch: topPrediction.label,
        confidence: topPrediction.score,
        suggestions
      };
    } catch (error) {
      console.error('Food image classification failed:', error);
      throw new Error('Failed to classify food image');
    }
  }

  async analyzeImageForIngredients(imageFile: File | string): Promise<{
    detectedItems: string[];
    possibleDishes: string[];
    nutritionInfo: { category: string; estimatedCalories: number };
  }> {
    // For now, we'll use a simplified approach
    // In a production app, you'd use a more specialized model
    const classification = await this.classifyFoodImage(imageFile);
    
    const ingredients = this.extractIngredientsFromLabel(classification.topMatch);
    const possibleDishes = this.generateDishVariations(classification.topMatch);
    const nutritionInfo = this.estimateNutrition(classification.topMatch);

    return {
      detectedItems: ingredients,
      possibleDishes,
      nutritionInfo
    };
  }

  private generateFoodSuggestions(foodLabel: string): string[] {
    const suggestions: Record<string, string[]> = {
      'pizza': ['Italian restaurants', 'Pizzerias', 'Fast food chains'],
      'burger': ['American diners', 'Fast food restaurants', 'Grill houses'],
      'sushi': ['Japanese restaurants', 'Sushi bars', 'Asian fusion'],
      'pasta': ['Italian restaurants', 'Mediterranean cuisine', 'European dining'],
      'curry': ['Indian restaurants', 'Thai cuisine', 'Asian restaurants'],
      'sandwich': ['Cafes', 'Delis', 'Quick service restaurants'],
      'salad': ['Health food restaurants', 'Cafes', 'Mediterranean cuisine'],
      'dessert': ['Bakeries', 'Ice cream shops', 'Sweet shops'],
      'noodles': ['Asian restaurants', 'Ramen shops', 'Chinese cuisine'],
      'bread': ['Bakeries', 'Cafes', 'European restaurants']
    };

    const normalizedLabel = foodLabel.toLowerCase();
    
    for (const [key, values] of Object.entries(suggestions)) {
      if (normalizedLabel.includes(key)) {
        return values;
      }
    }

    return ['Restaurants', 'Local eateries', 'Food courts'];
  }

  private extractIngredientsFromLabel(label: string): string[] {
    // Simplified ingredient extraction based on common food items
    const ingredientMap: Record<string, string[]> = {
      'pizza': ['dough', 'tomato sauce', 'cheese', 'toppings'],
      'burger': ['bun', 'patty', 'lettuce', 'tomato'],
      'curry': ['spices', 'vegetables', 'sauce', 'rice'],
      'pasta': ['wheat', 'sauce', 'herbs'],
      'salad': ['vegetables', 'greens', 'dressing'],
      'sandwich': ['bread', 'filling', 'vegetables']
    };

    const normalizedLabel = label.toLowerCase();
    
    for (const [food, ingredients] of Object.entries(ingredientMap)) {
      if (normalizedLabel.includes(food)) {
        return ingredients;
      }
    }

    return ['mixed ingredients'];
  }

  private generateDishVariations(label: string): string[] {
    const variations: Record<string, string[]> = {
      'pizza': ['Margherita Pizza', 'Pepperoni Pizza', 'Vegetarian Pizza'],
      'burger': ['Cheeseburger', 'Chicken Burger', 'Veggie Burger'],
      'curry': ['Chicken Curry', 'Vegetable Curry', 'Fish Curry'],
      'pasta': ['Spaghetti Bolognese', 'Penne Arrabiata', 'Fettuccine Alfredo'],
      'salad': ['Caesar Salad', 'Greek Salad', 'Garden Salad']
    };

    const normalizedLabel = label.toLowerCase();
    
    for (const [food, dishes] of Object.entries(variations)) {
      if (normalizedLabel.includes(food)) {
        return dishes;
      }
    }

    return [label];
  }

  private estimateNutrition(label: string): { category: string; estimatedCalories: number } {
    const nutritionData: Record<string, { category: string; calories: number }> = {
      'pizza': { category: 'High carbohydrate', calories: 285 },
      'burger': { category: 'High protein', calories: 540 },
      'salad': { category: 'Low calorie', calories: 150 },
      'pasta': { category: 'High carbohydrate', calories: 220 },
      'curry': { category: 'Balanced', calories: 200 },
      'sandwich': { category: 'Balanced', calories: 300 },
      'dessert': { category: 'High sugar', calories: 350 }
    };

    const normalizedLabel = label.toLowerCase();
    
    for (const [food, info] of Object.entries(nutritionData)) {
      if (normalizedLabel.includes(food)) {
        return {
          category: info.category,
          estimatedCalories: info.calories
        };
      }
    }

    return { category: 'Mixed', estimatedCalories: 250 };
  }

  // Helper method to validate if image contains food
  async validateFoodImage(imageFile: File): Promise<boolean> {
    try {
      const classification = await this.classifyFoodImage(imageFile);
      return classification.confidence > 0.3; // Threshold for food detection
    } catch (error) {
      console.warn('Food validation failed:', error);
      return false;
    }
  }
}

export const foodImageRecognition = new FoodImageRecognition();
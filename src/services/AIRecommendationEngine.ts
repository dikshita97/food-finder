import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

interface UserPreferences {
  distance: string;
  cuisine: string;
  dietary: string;
  budget: string;
  experience: string;
  dish: string;
  popularity: string;
  timing: string;
  extras: string[];
}

interface FoodPlace {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  priceRange: string;
  speciality: string;
  location: string;
  fullReviewTexts?: string[];
  tags?: string[];
  busyTimes?: { hour: number; crowdLevel: number }[];
}

export type { UserPreferences, FoodPlace };

class AIRecommendationEngine {
  private sentimentPipeline: any = null;
  private classificationPipeline: any = null;
  private embeddingPipeline: any = null;

  async initialize() {
    try {
      // Initialize sentiment analysis
      this.sentimentPipeline = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        { device: 'webgpu' }
      );

      // Initialize text classification for content moderation
      this.classificationPipeline = await pipeline(
        'text-classification',
        'martin-ha/toxic-comment-model',
        { device: 'webgpu' }
      );

      // Initialize embeddings for semantic search
      this.embeddingPipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { device: 'webgpu' }
      );

      console.log('AI Recommendation Engine initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      // Fallback to CPU
      this.sentimentPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.classificationPipeline = await pipeline('text-classification', 'martin-ha/toxic-comment-model');
      this.embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
  }

  // 1. Recommendation Engine - Personalized food spot suggestions
  async getPersonalizedRecommendations(
    preferences: UserPreferences,
    location: { lat: number; lng: number },
    foodPlaces: FoodPlace[]
  ): Promise<FoodPlace[]> {
    const scores = await Promise.all(
      foodPlaces.map(async (place) => {
        let score = 0;

        // Cuisine preference matching
        if (preferences.cuisine !== 'Any cuisine' && place.cuisine.toLowerCase().includes(preferences.cuisine.toLowerCase())) {
          score += 3;
        }

        // Budget matching
        const budgetScore = this.calculateBudgetMatch(preferences.budget, place.priceRange);
        score += budgetScore;

        // Sentiment analysis of reviews
        const sentimentScore = await this.analyzePlaceSentiment(place.fullReviewTexts || []);
        score += sentimentScore;

        // Experience type matching
        const experienceScore = this.calculateExperienceMatch(preferences.experience, place.tags || []);
        score += experienceScore;

        // Dish-specific search using semantic similarity
        if (preferences.dish) {
          const dishScore = await this.calculateDishSimilarity(preferences.dish, place.speciality);
          score += dishScore;
        }

        return { place, score };
      })
    );

    // Sort by score and return top recommendations
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.place);
  }

  // 3. Sentiment Analysis - Process reviews to understand food quality
  async analyzePlaceSentiment(reviews: string[]): Promise<number> {
    if (!this.sentimentPipeline || !reviews || reviews.length === 0) return 2.5;

    try {
      const sentiments = await Promise.all(
        reviews.slice(0, 5).map(review => this.sentimentPipeline(review))
      );

      const positiveCount = sentiments.filter(s => s[0].label === 'POSITIVE').length;
      const sentiment = positiveCount / sentiments.length;
      
      // Convert to score (0-5 scale)
      return sentiment * 5;
    } catch (error) {
      console.warn('Sentiment analysis failed:', error);
      return 2.5;
    }
  }

  // 5. NLP for Search - Semantic understanding of food cravings
  async calculateDishSimilarity(userCraving: string, speciality: string): Promise<number> {
    if (!this.embeddingPipeline) return 0;

    try {
      const [cravingEmbedding] = await this.embeddingPipeline(userCraving, { pooling: 'mean', normalize: true });
      const [specialityEmbedding] = await this.embeddingPipeline(speciality, { pooling: 'mean', normalize: true });

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(cravingEmbedding.data, specialityEmbedding.data);
      return similarity * 3; // Scale to 0-3 points
    } catch (error) {
      console.warn('Dish similarity calculation failed:', error);
      return 0;
    }
  }

  // 4. Collaborative Filtering - "Users like you also enjoyed..."
  async findSimilarUserRecommendations(
    userPreferences: UserPreferences,
    allUserData: { preferences: UserPreferences; visitedPlaces: string[] }[]
  ): Promise<string[]> {
    const similarUsers = allUserData
      .map(userData => ({
        ...userData,
        similarity: this.calculateUserSimilarity(userPreferences, userData.preferences)
      }))
      .filter(user => user.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    // Get places visited by similar users
    const recommendedPlaces = new Set<string>();
    similarUsers.forEach(user => {
      user.visitedPlaces.forEach(placeId => recommendedPlaces.add(placeId));
    });

    return Array.from(recommendedPlaces);
  }

  // 6. Predictive Analytics - Best times to visit
  predictOptimalVisitTime(place: FoodPlace): { hour: number; crowdLevel: number; recommendation: string } {
    if (!place.busyTimes || place.busyTimes.length === 0) {
      return { hour: 14, crowdLevel: 50, recommendation: 'Data not available' };
    }

    // Find least busy time
    const optimalTime = place.busyTimes.reduce((min, current) => 
      current.crowdLevel < min.crowdLevel ? current : min
    );

    let recommendation = '';
    if (optimalTime.crowdLevel < 30) {
      recommendation = 'Perfect time to visit! Very quiet.';
    } else if (optimalTime.crowdLevel < 60) {
      recommendation = 'Good time to visit with moderate crowd.';
    } else {
      recommendation = 'Busy time, but worth the wait!';
    }

    return {
      hour: optimalTime.hour,
      crowdLevel: optimalTime.crowdLevel,
      recommendation
    };
  }

  // 7. Content Moderation - Auto-filter inappropriate content
  async moderateContent(text: string): Promise<{ isAppropriate: boolean; confidence: number }> {
    if (!this.classificationPipeline) {
      return { isAppropriate: true, confidence: 0.5 };
    }

    try {
      const result = await this.classificationPipeline(text);
      const toxicResult = result.find((r: any) => r.label === 'TOXIC');
      
      if (toxicResult && toxicResult.score > 0.7) {
        return { isAppropriate: false, confidence: toxicResult.score };
      }
      
      return { isAppropriate: true, confidence: 1 - (toxicResult?.score || 0) };
    } catch (error) {
      console.warn('Content moderation failed:', error);
      return { isAppropriate: true, confidence: 0.5 };
    }
  }

  // Helper methods
  private calculateBudgetMatch(userBudget: string, placePrice: string): number {
    const budgetMap: Record<string, number> = {
      'Pocket-friendly (₹50-200)': 1,
      'Moderate (₹200-500)': 2,
      'Premium (₹500-1000)': 3,
      'Fine dining (₹1000+)': 4
    };

    const priceMap: Record<string, number> = {
      '₹': 1, '₹₹': 2, '₹₹₹': 3, '₹₹₹₹': 4
    };

    const userLevel = budgetMap[userBudget] || 2;
    const placeLevel = priceMap[placePrice] || 2;

    return Math.max(0, 2 - Math.abs(userLevel - placeLevel));
  }

  private calculateExperienceMatch(userExperience: string, placeTags: string[]): number {
    const experienceKeywords: Record<string, string[]> = {
      'Quick bite': ['fast', 'quick', 'takeaway', 'street'],
      'Family-friendly restaurant': ['family', 'kids', 'spacious', 'comfortable'],
      'Date spot': ['romantic', 'intimate', 'cozy', 'ambiance'],
      'Café': ['coffee', 'cafe', 'casual', 'wifi'],
      'Rooftop': ['rooftop', 'view', 'outdoor', 'terrace'],
      'Street food stall': ['street', 'local', 'authentic', 'traditional'],
      'Hidden gem': ['hidden', 'local', 'authentic', 'secret']
    };

    const keywords = experienceKeywords[userExperience] || [];
    const matches = keywords.filter(keyword => 
      placeTags.some(tag => tag.toLowerCase().includes(keyword))
    );

    return matches.length * 0.5;
  }

  private calculateUserSimilarity(user1: UserPreferences, user2: UserPreferences): number {
    let similarity = 0;
    let totalWeights = 0;

    // Cuisine similarity (high weight)
    if (user1.cuisine === user2.cuisine) similarity += 3;
    totalWeights += 3;

    // Budget similarity (medium weight)
    if (user1.budget === user2.budget) similarity += 2;
    totalWeights += 2;

    // Experience similarity (medium weight)
    if (user1.experience === user2.experience) similarity += 2;
    totalWeights += 2;

    // Dietary similarity (high weight)
    if (user1.dietary === user2.dietary) similarity += 3;
    totalWeights += 3;

    return similarity / totalWeights;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();
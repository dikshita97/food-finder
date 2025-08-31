import { aiRecommendationEngine } from './AIRecommendationEngine';
import type { UserPreferences, FoodPlace } from './AIRecommendationEngine';
import { foodImageRecognition } from './FoodImageRecognition';

interface EnhancedFoodPlace extends FoodPlace {
  image: string;
  distance: string;
  isOpen: boolean;
  phone?: string;
  address?: string;
  fullReviewTexts: string[];
  tags: string[];
  busyTimes: { hour: number; crowdLevel: number }[];
  userVisits: number;
  similarUserVisits: string[];
}

class SmartFoodRecommendationService {
  private isInitialized = false;
  private userProfiles: Map<string, any> = new Map();
  private placeInteractions: Map<string, number> = new Map();

  async initialize() {
    if (this.isInitialized) return;

    try {
      await aiRecommendationEngine.initialize();
      await foodImageRecognition.initialize();
      this.isInitialized = true;
      console.log('Smart Food Recommendation Service initialized');
    } catch (error) {
      console.error('Failed to initialize recommendation service:', error);
    }
  }

  // Enhanced recommendation engine that combines all AI features
  async getIntelligentRecommendations(
    preferences: any,
    location: { lat: number; lng: number },
    userHistory: string[] = [],
    uploadedFoodImage?: File
  ): Promise<{
    recommendations: EnhancedFoodPlace[];
    imageAnalysis?: any;
    personalizedInsights: string[];
    collaborativeRecommendations: string[];
    sentimentInsights: Record<string, number>;
  }> {
    await this.initialize();

    const mockPlaces = this.getMockEnhancedPlaces();
    
    // Analyze uploaded food image if provided
    let imageAnalysis;
    if (uploadedFoodImage) {
      try {
        imageAnalysis = await foodImageRecognition.classifyFoodImage(uploadedFoodImage);
        // Update preferences based on image analysis
        if (imageAnalysis.confidence > 0.7) {
          preferences.dish = imageAnalysis.topMatch;
        }
      } catch (error) {
        console.warn('Image analysis failed:', error);
      }
    }

    // Get AI-powered recommendations
    const recommendations = await aiRecommendationEngine.getPersonalizedRecommendations(
      preferences,
      location,
      mockPlaces
    );

    // Analyze sentiment for each place
    const sentimentInsights: Record<string, number> = {};
    for (const place of recommendations.slice(0, 5)) {
      sentimentInsights[place.id] = await aiRecommendationEngine.analyzePlaceSentiment(
        place.fullReviewTexts
      );
    }

    // Get collaborative filtering recommendations
    const mockUserData = this.generateMockUserData();
    const collaborativeRecommendations = await aiRecommendationEngine.findSimilarUserRecommendations(
      preferences,
      mockUserData
    );

    // Generate personalized insights
    const personalizedInsights = this.generatePersonalizedInsights(
      preferences,
      recommendations,
      sentimentInsights
    );

    return {
      recommendations: recommendations as EnhancedFoodPlace[],
      imageAnalysis,
      personalizedInsights,
      collaborativeRecommendations,
      sentimentInsights
    };
  }

  // Smart search with NLP understanding
  async smartSearch(
    query: string,
    currentLocation: { lat: number; lng: number }
  ): Promise<{
    results: EnhancedFoodPlace[];
    interpretedQuery: string;
    suggestions: string[];
  }> {
    await this.initialize();

    // Use semantic search
    const mockPlaces = this.getMockEnhancedPlaces();
    const results: EnhancedFoodPlace[] = [];

    // Simple keyword matching (in production, use embedding similarity)
    for (const place of mockPlaces) {
      const searchText = `${place.name} ${place.cuisine} ${place.speciality} ${place.tags.join(' ')}`.toLowerCase();
      if (searchText.includes(query.toLowerCase())) {
        results.push(place);
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.rating - a.rating);

    const interpretedQuery = this.interpretQuery(query);
    const suggestions = this.generateSearchSuggestions(query);

    return {
      results: results.slice(0, 10),
      interpretedQuery,
      suggestions
    };
  }

  // Content moderation for user uploads
  async moderateUserContent(text: string, image?: File): Promise<{
    isAppropriate: boolean;
    confidence: number;
    reasons: string[];
  }> {
    await this.initialize();

    const textModeration = await aiRecommendationEngine.moderateContent(text);
    
    let imageModeration = { isAppropriate: true, confidence: 1.0 };
    if (image) {
      // Check if image is food-related
      const isFoodImage = await foodImageRecognition.validateFoodImage(image);
      imageModeration = {
        isAppropriate: isFoodImage,
        confidence: isFoodImage ? 0.9 : 0.3
      };
    }

    const reasons: string[] = [];
    if (!textModeration.isAppropriate) {
      reasons.push('Text content flagged as inappropriate');
    }
    if (!imageModeration.isAppropriate) {
      reasons.push('Image does not appear to be food-related');
    }

    return {
      isAppropriate: textModeration.isAppropriate && imageModeration.isAppropriate,
      confidence: Math.min(textModeration.confidence, imageModeration.confidence),
      reasons
    };
  }

  // Predictive analytics for optimal visit times
  getPredictiveAnalytics(place: EnhancedFoodPlace): {
    optimalTime: { hour: number; crowdLevel: number; recommendation: string };
    waitTimePredict: number;
    popularityTrend: 'increasing' | 'stable' | 'decreasing';
  } {
    const optimalTime = aiRecommendationEngine.predictOptimalVisitTime(place);
    
    // Simulate wait time prediction
    const waitTimePredict = Math.max(0, (optimalTime.crowdLevel / 100) * 45);
    
    // Simulate popularity trend
    const trends = ['increasing', 'stable', 'decreasing'] as const;
    const popularityTrend = trends[Math.floor(Math.random() * trends.length)];

    return {
      optimalTime,
      waitTimePredict,
      popularityTrend
    };
  }

  // Helper methods
  private interpretQuery(query: string): string {
    const queryPatterns: Record<string, string> = {
      'spicy': 'Looking for spicy cuisine options',
      'cheap': 'Searching for budget-friendly options',
      'romantic': 'Finding romantic dining spots',
      'quick': 'Looking for quick service options',
      'healthy': 'Searching for healthy food options',
      'authentic': 'Looking for authentic local cuisine'
    };

    const lowerQuery = query.toLowerCase();
    for (const [pattern, interpretation] of Object.entries(queryPatterns)) {
      if (lowerQuery.includes(pattern)) {
        return interpretation;
      }
    }

    return `Searching for "${query}" related food options`;
  }

  private generateSearchSuggestions(query: string): string[] {
    const suggestions = [
      'Italian pasta near me',
      'Spicy Indian curry',
      'Quick breakfast options',
      'Romantic dinner spots',
      'Healthy salad places',
      'Authentic street food',
      'Budget-friendly meals',
      'Late night dining'
    ];

    return suggestions.filter(s => s.toLowerCase() !== query.toLowerCase()).slice(0, 5);
  }

  private generatePersonalizedInsights(
    preferences: any,
    recommendations: any[],
    sentimentInsights: Record<string, number>
  ): string[] {
    const insights: string[] = [];

    // Budget insight
    if (preferences.budget.includes('Pocket-friendly')) {
      insights.push('💰 Found several budget-friendly gems that don\'t compromise on taste!');
    }

    // Sentiment insight
    const avgSentiment = Object.values(sentimentInsights).reduce((a, b) => a + b, 0) / Object.values(sentimentInsights).length;
    if (avgSentiment > 4) {
      insights.push('😊 All recommended places have excellent customer satisfaction!');
    }

    // Cuisine insight
    insights.push(`🍽️ Based on your love for ${preferences.cuisine}, we've found perfect matches!`);

    // Distance insight
    const nearbyCount = recommendations.filter(r => r.distance.includes('km') && parseFloat(r.distance) < 2).length;
    if (nearbyCount > 0) {
      insights.push(`📍 ${nearbyCount} great options within walking distance!`);
    }

    return insights;
  }

  private generateMockUserData(): { preferences: UserPreferences; visitedPlaces: string[] }[] {
    return [
      {
        preferences: {
          distance: '2–5 km',
          cuisine: 'Indian',
          dietary: 'No preference',
          budget: 'Moderate (₹200-500)',
          experience: 'Family-friendly restaurant',
          dish: '',
          popularity: 'Trending spots',
          timing: 'No preference',
          extras: []
        },
        visitedPlaces: ['1', '2']
      },
      {
        preferences: {
          distance: 'Within 1 km',
          cuisine: 'Chinese',
          dietary: 'No preference',
          budget: 'Pocket-friendly (₹50-200)',
          experience: 'Quick bite',
          dish: '',
          popularity: 'Highly-rated places',
          timing: 'No preference',
          extras: []
        },
        visitedPlaces: ['2', '3']
      }
    ];
  }

  private getMockEnhancedPlaces(): EnhancedFoodPlace[] {
    return [
      {
        id: '1',
        name: 'Asha Vada Pav Center',
        image: '/src/assets/hero-food.jpg',
        cuisine: 'Street Food',
        rating: 4.6,
        reviews: 2341,
        distance: '0.8 km',
        priceRange: '₹',
        isOpen: true,
        speciality: 'Mumbai Style Vada Pav',
        location: 'Dadar West',
        fullReviewTexts: [
          'Amazing vada pav! Best in the city!',
          'Authentic taste and great value for money',
          'Quick service and delicious food',
          'Love coming here for breakfast',
          'Perfect street food experience'
        ],
        tags: ['street', 'authentic', 'quick', 'traditional'],
        busyTimes: [
          { hour: 8, crowdLevel: 80 },
          { hour: 12, crowdLevel: 90 },
          { hour: 16, crowdLevel: 70 },
          { hour: 20, crowdLevel: 40 }
        ],
        userVisits: 1250,
        similarUserVisits: ['2', '4']
      },
      {
        id: '2',
        name: 'Royal Chinese Corner',
        image: '/src/assets/hero-food.jpg',
        cuisine: 'Chinese',
        rating: 4.3,
        reviews: 892,
        distance: '1.2 km',
        priceRange: '₹₹',
        isOpen: true,
        speciality: 'Hakka Noodles & Manchurian',
        location: 'Bandra East',
        fullReviewTexts: [
          'Excellent Chinese food with authentic flavors',
          'Great portions and reasonable prices',
          'Love their hakka noodles!',
          'Consistent quality every time',
          'Good service and clean environment'
        ],
        tags: ['family', 'spacious', 'authentic', 'value'],
        busyTimes: [
          { hour: 12, crowdLevel: 60 },
          { hour: 19, crowdLevel: 85 },
          { hour: 21, crowdLevel: 70 },
          { hour: 14, crowdLevel: 30 }
        ],
        userVisits: 890,
        similarUserVisits: ['1', '3']
      },
      {
        id: '3',
        name: 'Café Mocha',
        image: '/src/assets/hero-food.jpg',
        cuisine: 'Continental',
        rating: 4.5,
        reviews: 1204,
        distance: '0.5 km',
        priceRange: '₹₹₹',
        isOpen: false,
        speciality: 'Artisan Coffee & Desserts',
        location: 'Linking Road',
        fullReviewTexts: [
          'Perfect ambiance for a date!',
          'Amazing coffee and desserts',
          'Cozy atmosphere and friendly staff',
          'Great place to work with wifi',
          'Instagram-worthy presentations'
        ],
        tags: ['romantic', 'cozy', 'wifi', 'instagram', 'coffee'],
        busyTimes: [
          { hour: 9, crowdLevel: 50 },
          { hour: 15, crowdLevel: 70 },
          { hour: 18, crowdLevel: 80 },
          { hour: 11, crowdLevel: 25 }
        ],
        userVisits: 750,
        similarUserVisits: ['4', '5']
      }
    ];
  }
}

export const smartFoodRecommendationService = new SmartFoodRecommendationService();
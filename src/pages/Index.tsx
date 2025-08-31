import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, MapPin, Heart, Star } from 'lucide-react';
import LocationDetector from '@/components/LocationDetector';
import PreferenceQuiz from '@/components/PreferenceQuiz';
import FoodPlaceCard from '@/components/FoodPlaceCard';
import PlaceDetailModal from '@/components/PlaceDetailModal';
import AIFeatures from '@/components/AIFeatures';
import heroFood from '@/assets/hero-food.jpg';
import appIcon from '@/assets/app-icon.jpg';

type AppStep = 'welcome' | 'location' | 'preferences' | 'results';

interface FoodPlace {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviews: number;
  distance: string;
  priceRange: string;
  isOpen: boolean;
  speciality: string;
  location: string;
}

const mockFoodPlaces: FoodPlace[] = [
  {
    id: '1',
    name: 'Asha Vada Pav Center',
    image: heroFood,
    cuisine: 'Street Food',
    rating: 4.6,
    reviews: 2341,
    distance: '0.8 km',
    priceRange: '₹',
    isOpen: true,
    speciality: 'Mumbai Style Vada Pav',
    location: 'Dadar West'
  },
  {
    id: '2',
    name: 'Royal Chinese Corner',
    image: heroFood,
    cuisine: 'Chinese',
    rating: 4.3,
    reviews: 892,
    distance: '1.2 km',
    priceRange: '₹₹',
    isOpen: true,
    speciality: 'Hakka Noodles & Manchurian',
    location: 'Bandra East'
  },
  {
    id: '3',
    name: 'Café Mocha',
    image: heroFood,
    cuisine: 'Continental',
    rating: 4.5,
    reviews: 1204,
    distance: '0.5 km',
    priceRange: '₹₹₹',
    isOpen: false,
    speciality: 'Artisan Coffee & Desserts',
    location: 'Linking Road'
  }
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<FoodPlace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const handleLocationDetected = (location: any) => {
    setUserLocation(location);
    setCurrentStep('preferences');
  };

  const handlePreferencesComplete = (preferences: any) => {
    setUserPreferences(preferences);
    setCurrentStep('results');
  };

  const handlePlaceClick = (place: FoodPlace) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleAIRecommendations = (recommendations: any) => {
    setAiRecommendations(recommendations);
    setShowAIInsights(true);
  };

  const renderWelcomeScreen = () => (
    <div className="min-h-screen gradient-warm">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src={appIcon} alt="FoodFinder" className="h-20 w-20 rounded-full shadow-glow" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FoodFinder
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing local food experiences wherever you are! 
            From hidden gems to famous spots, we'll find your perfect meal.
          </p>
          <Button
            onClick={() => setCurrentStep('location')}
            variant="food"
            size="lg"
            className="text-lg px-8 py-4"
          >
            <Utensils className="h-6 w-6 mr-2" />
            Start Food Discovery
          </Button>
        </div>

        {/* Hero Image */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <img
            src={heroFood}
            alt="Delicious food spread"
            className="w-full h-96 object-cover rounded-2xl shadow-food"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
        </div>

        {/* Popular Places Preview */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">🔥 Trending Food Spots</h2>
          <p className="text-muted-foreground mb-6">
            These places are popular right now in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mockFoodPlaces.map((place) => (
            <FoodPlaceCard
              key={place.id}
              place={place}
              onClick={handlePlaceClick}
            />
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 gradient-secondary rounded-xl shadow-card">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Location-Based</h3>
            <p className="text-muted-foreground">
              Find food spots based on your exact location and preferences
            </p>
          </div>
          <div className="text-center p-6 gradient-secondary rounded-xl shadow-card">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Personalized</h3>
            <p className="text-muted-foreground">
              Get recommendations tailored to your taste, budget, and mood
            </p>
          </div>
          <div className="text-center p-6 gradient-secondary rounded-xl shadow-card">
            <Star className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Hidden Gems</h3>
            <p className="text-muted-foreground">
              Discover local favorites and hidden food treasures
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="min-h-screen gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LocationDetector onLocationDetected={handleLocationDetected} />
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="min-h-screen gradient-warm p-4">
      <div className="container mx-auto space-y-8">
        <PreferenceQuiz onComplete={handlePreferencesComplete} />
        
        {/* AI Features Section */}
        <AIFeatures 
          onRecommendationsReceived={handleAIRecommendations}
          userPreferences={userPreferences}
          userLocation={userLocation}
        />
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="min-h-screen gradient-warm p-4">
      <div className="container mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎉 Perfect Matches Found!</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Based on your preferences, here are the best food spots for you
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={() => setCurrentStep('preferences')}
              variant="outline"
            >
              Change Preferences
            </Button>
            <Button
              onClick={() => setCurrentStep('location')}
              variant="ghost"
            >
              Change Location
            </Button>
          </div>
        </div>

        {/* AI Insights Section */}
        {showAIInsights && aiRecommendations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold mb-4 text-center">🤖 AI-Powered Insights</h2>
            </div>
            
            {/* Personalized Insights */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">💡 Personalized Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiRecommendations.personalizedInsights.map((insight: string, index: number) => (
                    <li key={index} className="text-sm">{insight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">😊 Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(aiRecommendations.sentimentInsights).slice(0, 3).map(([placeId, sentiment]: [string, any]) => {
                    const place = mockFoodPlaces.find(p => p.id === placeId);
                    return (
                      <div key={placeId} className="flex justify-between">
                        <span className="text-sm">{place?.name}</span>
                        <div className="flex items-center">
                          <span className="text-sm mr-1">{sentiment.toFixed(1)}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < sentiment ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Collaborative Recommendations */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">👥 Similar Users Also Liked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiRecommendations.collaborativeRecommendations.slice(0, 3).map((placeId: string, index: number) => {
                    const place = mockFoodPlaces.find(p => p.id === placeId);
                    return (
                      <div key={placeId} className="flex items-center">
                        <span className="text-sm">🍽️ {place?.name || `Place ${placeId}`}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Food Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {(aiRecommendations?.recommendations || mockFoodPlaces).map((place: any) => (
            <FoodPlaceCard
              key={place.id}
              place={place}
              onClick={handlePlaceClick}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {currentStep === 'welcome' && renderWelcomeScreen()}
      {currentStep === 'location' && renderLocationStep()}
      {currentStep === 'preferences' && renderPreferencesStep()}
      {currentStep === 'results' && renderResultsStep()}
      
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Index;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Camera, Zap, Search, TrendingUp, Users } from 'lucide-react';
import { smartFoodRecommendationService } from '@/services/SmartFoodRecommendationService';
import { foodImageRecognition } from '@/services/FoodImageRecognition';

interface AIFeaturesProps {
  onRecommendationsReceived: (recommendations: any) => void;
  userPreferences: any;
  userLocation: { lat: number; lng: number };
}

const AIFeatures: React.FC<AIFeaturesProps> = ({ 
  onRecommendationsReceived, 
  userPreferences, 
  userLocation 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [smartResults, setSmartResults] = useState<any>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadedImage(file);

    try {
      const analysis = await foodImageRecognition.classifyFoodImage(file);
      setImageAnalysis(analysis);
      
      // Auto-search based on image analysis
      if (analysis.confidence > 0.7) {
        setSearchQuery(analysis.topMatch);
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await smartFoodRecommendationService.smartSearch(
        searchQuery,
        userLocation
      );
      setSmartResults(results);
    } catch (error) {
      console.error('Smart search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIntelligentRecommendations = async () => {
    setIsLoading(true);
    try {
      const recommendations = await smartFoodRecommendationService.getIntelligentRecommendations(
        userPreferences,
        userLocation,
        [],
        uploadedImage || undefined
      );
      onRecommendationsReceived(recommendations);
    } catch (error) {
      console.error('AI recommendations failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          AI-Powered Food Discovery
        </CardTitle>
        <CardDescription>
          Upload food images, search with natural language, and get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="image">
              <Camera className="h-4 w-4 mr-2" />
              Image Analysis
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Smart Search
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <TrendingUp className="h-4 w-4 mr-2" />
              AI Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4">
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Upload a food image and our AI will identify it and suggest similar places
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="food-image-upload"
              />
              <Button asChild variant="food">
                <label htmlFor="food-image-upload" className="cursor-pointer">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Food Image
                </label>
              </Button>
            </div>

            {uploadedImage && (
              <div className="space-y-4">
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="Uploaded food"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {imageAnalysis && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">🤖 AI Analysis Results:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">
                        Top Match: {imageAnalysis.topMatch}
                      </Badge>
                      <Badge variant="outline">
                        Confidence: {(imageAnalysis.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {imageAnalysis.suggestions.map((suggestion: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Try natural language: 'spicy noodles', 'romantic dinner spot', 'quick breakfast'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                className="text-lg p-4"
              />
              <Button 
                onClick={handleSmartSearch}
                disabled={!searchQuery.trim() || isLoading}
                variant="accent"
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Smart Search'}
              </Button>
            </div>

            {smartResults && (
              <div className="space-y-4">
                <div className="p-4 gradient-secondary rounded-lg">
                  <p className="font-medium">🧠 Interpreted Query:</p>
                  <p className="text-muted-foreground">{smartResults.interpretedQuery}</p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">💡 Search Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {smartResults.suggestions.map((suggestion: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setSearchQuery(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">🔍 Found {smartResults.results.length} matches:</p>
                  <div className="space-y-2">
                    {smartResults.results.slice(0, 3).map((place: any) => (
                      <div key={place.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{place.name}</h4>
                            <p className="text-sm text-muted-foreground">{place.speciality}</p>
                          </div>
                          <Badge variant="outline">{place.rating} ⭐</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Personalized AI Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Our AI analyzes your preferences, reviews sentiments, and finds similar users to give you the best recommendations
              </p>
              <Button
                onClick={getIntelligentRecommendations}
                disabled={isLoading}
                variant="food"
                size="lg"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                {isLoading ? 'Analyzing...' : 'Get AI Recommendations'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 gradient-secondary rounded-lg text-center">
                <div className="h-8 w-8 gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <h4 className="font-medium">Sentiment Analysis</h4>
                <p className="text-sm text-muted-foreground">AI analyzes reviews to understand food quality</p>
              </div>
              <div className="p-4 gradient-secondary rounded-lg text-center">
                <div className="h-8 w-8 gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold">2</span>
                </div>
                <h4 className="font-medium">Collaborative Filtering</h4>
                <p className="text-sm text-muted-foreground">Find places similar users loved</p>
              </div>
              <div className="p-4 gradient-secondary rounded-lg text-center">
                <div className="h-8 w-8 gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold">3</span>
                </div>
                <h4 className="font-medium">Predictive Analytics</h4>
                <p className="text-sm text-muted-foreground">Optimal visit times and crowd predictions</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIFeatures;
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Heart, Camera } from 'lucide-react';

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

interface FoodPlaceCardProps {
  place: FoodPlace;
  onClick: (place: FoodPlace) => void;
}

const FoodPlaceCard: React.FC<FoodPlaceCardProps> = ({ place, onClick }) => {
  return (
    <Card 
      className="shadow-card hover:shadow-food transition-all duration-300 transform hover:scale-105 cursor-pointer pulse-glow overflow-hidden"
      onClick={() => onClick(place)}
    >
      <div className="relative">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {place.cuisine}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Button size="icon" variant="ghost" className="bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge 
            variant={place.isOpen ? "default" : "destructive"}
            className="bg-background/90 backdrop-blur-sm"
          >
            <Clock className="h-3 w-3 mr-1" />
            {place.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg line-clamp-1">{place.name}</h3>
          <p className="text-muted-foreground text-sm flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {place.location}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold ml-1">{place.rating}</span>
              <span className="text-muted-foreground text-sm ml-1">
                ({place.reviews})
              </span>
            </div>
          </div>
          <Badge variant="outline">{place.priceRange}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            📍 {place.distance} away
          </div>
          <Button size="sm" variant="accent">
            <Camera className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
        
        <div className="text-primary font-medium text-sm">
          🍴 Famous for: {place.speciality}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodPlaceCard;
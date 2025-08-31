import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Clock, Phone, Navigation, Car, Upload, Play } from 'lucide-react';

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
  phone?: string;
  address?: string;
  images?: string[];
  menu?: string[];
  influencerVideos?: { id: string; creator: string; title: string; thumbnail: string }[];
}

interface PlaceDetailModalProps {
  place: FoodPlace | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, isOpen, onClose }) => {
  if (!place) return null;

  const mockImages = [place.image, place.image, place.image];
  const mockMenu = ['Vada Pav - ₹15', 'Pav Bhaji - ₹80', 'Masala Chai - ₹10', 'Samosa - ₹20'];
  const mockVideos = [
    { id: '1', creator: '@foodie_explorer', title: 'Best Vada Pav in Mumbai!', thumbnail: place.image },
    { id: '2', creator: '@street_food_lover', title: 'Hidden Gem Alert! 🔥', thumbnail: place.image }
  ];

  const handleDirections = () => {
    // In real app, open Google Maps
    alert('Opening directions in Google Maps...');
  };

  const handleBookRide = () => {
    // In real app, integrate with Uber/Ola APIs
    alert('Redirecting to ride booking...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{place.name}</DialogTitle>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{place.address || place.location}</span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold ml-1 text-lg">{place.rating}</span>
              <span className="text-muted-foreground ml-1">({place.reviews} reviews)</span>
            </div>
            <Badge variant="secondary">{place.cuisine}</Badge>
            <Badge variant="outline">{place.priceRange}</Badge>
            <Badge variant={place.isOpen ? "default" : "destructive"}>
              <Clock className="h-3 w-3 mr-1" />
              {place.isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          </div>

          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="videos">Influencer Videos</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="photos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${place.name} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-card"
                  />
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your Photos
              </Button>
            </TabsContent>

            <TabsContent value="menu" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockMenu.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg shadow-card">
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-center">
                🍴 Famous for: {place.speciality}
              </p>
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockVideos.map((video) => (
                  <div key={video.id} className="relative group cursor-pointer">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      <div className="font-medium">{video.creator}</div>
                      <div className="text-xs">{video.title}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="accent" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your Video
              </Button>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <span>{place.address || place.location}</span>
                </div>
                {place.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-3" />
                    <span>{place.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <span>Open 24/7</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={handleDirections} variant="food" className="flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            <Button onClick={handleBookRide} variant="accent" className="flex-1">
              <Car className="h-4 w-4 mr-2" />
              Book Ride
            </Button>
          </div>

          <div className="text-center p-4 gradient-secondary rounded-lg">
            <p className="text-lg font-medium">🎉 Enjoy your food adventure!</p>
            <p className="text-muted-foreground">
              Estimated travel time: 15 mins • Distance: {place.distance}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceDetailModal;
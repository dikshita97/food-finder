import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LocationDetectorProps {
  onLocationDetected: (location: { lat: number; lng: number; address: string }) => void;
}

const LocationDetector: React.FC<LocationDetectorProps> = ({ onLocationDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const detectLocation = async () => {
    setIsDetecting(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simulate reverse geocoding (in real app, use Google Maps API)
        setTimeout(() => {
          onLocationDetected({
            lat: latitude,
            lng: longitude,
            address: 'Current Location' // In real app, get actual address
          });
          setIsDetecting(false);
        }, 1500);
      },
      (error) => {
        console.error('Error detecting location:', error);
        setIsDetecting(false);
        setShowManualInput(true);
      }
    );
  };

  const handleManualLocation = () => {
    if (manualLocation.trim()) {
      // Simulate geocoding (in real app, use Google Maps API)
      onLocationDetected({
        lat: 0,
        lng: 0,
        address: manualLocation
      });
    }
  };

  return (
    <Card className="shadow-card hover:shadow-food transition-all duration-300">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 gradient-primary rounded-full flex items-center justify-center mb-4 bounce-gentle">
          <MapPin className="h-8 w-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Where are you right now?</CardTitle>
        <CardDescription className="text-lg">
          Let's find amazing food places near you!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={detectLocation}
          disabled={isDetecting}
          variant="food"
          size="lg"
          className="w-full"
        >
          {isDetecting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Detecting your location...
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5" />
              Auto-detect my location
            </>
          )}
        </Button>
        
        <div className="text-center text-muted-foreground">or</div>
        
        {showManualInput || !isDetecting ? (
          <div className="space-y-3">
            <Input
              placeholder="Enter your location manually (e.g., Mumbai, Delhi)"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="border-2 border-primary/20 focus:border-primary transition-colors"
            />
            <Button
              onClick={handleManualLocation}
              variant="outline"
              size="lg"
              className="w-full"
              disabled={!manualLocation.trim()}
            >
              <MapPin className="h-5 w-5" />
              Use this location
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowManualInput(true)}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Enter location manually instead
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationDetector;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface PreferenceQuizProps {
  onComplete: (preferences: Record<string, any>) => void;
}

const questions = [
  {
    id: 'distance',
    title: 'How far are you willing to travel for food?',
    type: 'single',
    options: ['Within 1 km', '2–5 km', '5–10 km', '10+ km']
  },
  {
    id: 'cuisine',
    title: 'What type of cuisine are you in the mood for?',
    type: 'single',
    options: ['Indian', 'Chinese', 'Italian', 'Continental', 'Local specialty', 'Street food', 'Any cuisine']
  },
  {
    id: 'dietary',
    title: 'Do you have any dietary preferences?',
    type: 'single',
    options: ['Vegetarian', 'Non-veg', 'Vegan', 'Jain', 'Halal', 'Gluten-free', 'No preference']
  },
  {
    id: 'budget',
    title: "What's your budget range?",
    type: 'single',
    options: ['Pocket-friendly (₹50-200)', 'Moderate (₹200-500)', 'Premium (₹500-1000)', 'Fine dining (₹1000+)']
  },
  {
    id: 'experience',
    title: 'What kind of food experience are you looking for?',
    type: 'single',
    options: ['Quick bite', 'Family-friendly restaurant', 'Date spot', 'Café', 'Rooftop', 'Street food stall', 'Hidden gem']
  },
  {
    id: 'dish',
    title: 'Any specific dish you\'re craving?',
    type: 'text',
    placeholder: 'e.g., vada pav, ramen, biryani...'
  },
  {
    id: 'popularity',
    title: 'Do you prefer popular spots or hidden gems?',
    type: 'single',
    options: ['Trending spots', 'Highly-rated places', 'Local hidden treasures', 'No preference']
  },
  {
    id: 'timing',
    title: 'Do you need special timings?',
    type: 'single',
    options: ['Late night', 'Early morning', '24x7', 'No preference']
  },
  {
    id: 'extras',
    title: 'Do you want us to show places with extras?',
    type: 'multiple',
    options: ['Instagrammable/Aesthetic', 'Live music', 'Near tourist attractions', 'Takeaway-friendly', 'No preferences']
  }
];

const PreferenceQuiz: React.FC<PreferenceQuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const question = questions[currentQuestion];

  const handleAnswer = (value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const isAnswered = () => {
    const answer = answers[question.id];
    if (question.type === 'text') {
      return typeof answer === 'string' && answer.trim().length > 0;
    }
    if (question.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return typeof answer === 'string' && answer.length > 0;
  };

  const renderQuestion = () => {
    if (question.type === 'text') {
      return (
        <Input
          placeholder={question.placeholder}
          value={answers[question.id] || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          className="border-2 border-primary/20 focus:border-primary transition-colors text-lg p-4"
        />
      );
    }

    if (question.type === 'multiple') {
      const selectedAnswers = answers[question.id] || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options?.map((option) => {
            const isSelected = selectedAnswers.includes(option);
            return (
              <Button
                key={option}
                variant={isSelected ? "default" : "outline"}
                className="p-4 h-auto text-left justify-start"
                onClick={() => {
                  if (isSelected) {
                    handleAnswer(selectedAnswers.filter((a: string) => a !== option));
                  } else {
                    handleAnswer([...selectedAnswers, option]);
                  }
                }}
              >
                {option}
              </Button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option) => (
          <Button
            key={option}
            variant={answers[question.id] === option ? "default" : "outline"}
            className="p-4 h-auto text-left justify-start"
            onClick={() => handleAnswer(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-card hover:shadow-food transition-all duration-300 max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold">{question.title}</CardTitle>
        {question.type === 'multiple' && (
          <CardDescription className="text-base">
            You can select multiple options
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {renderQuestion()}
        
        <div className="flex justify-between pt-4">
          <Button
            onClick={handlePrevious}
            variant="ghost"
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            variant="food"
            disabled={!isAnswered()}
          >
            {currentQuestion === questions.length - 1 ? 'Find My Food!' : 'Next'}
            {currentQuestion !== questions.length - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferenceQuiz;
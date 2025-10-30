import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'shield' | 'text' | 'complete'>('shield');
  
  useEffect(() => {
    // Shield animation stage - 2 seconds
    const shieldTimer = setTimeout(() => {
      setStage('text');
    }, 2000);

    return () => clearTimeout(shieldTimer);
  }, []);

  useEffect(() => {
    if (stage === 'text') {
      // Text animation stage - 2 seconds
      const textTimer = setTimeout(() => {
        setStage('complete');
      }, 2000);

      return () => clearTimeout(textTimer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'complete') {
      // Fade out and complete - 0.5 seconds
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 500);

      return () => clearTimeout(completeTimer);
    }
  }, [stage, onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-authority/5 transition-all duration-500 ${
      stage === 'complete' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
    }`}>
      
      {/* Shield Animation Stage */}
      {stage === 'shield' && (
        <div className="flex items-center justify-center">
          <div className={`transform transition-all duration-2000 ease-out ${
            stage === 'shield' ? 'animate-pulse scale-100 opacity-100' : 'scale-150 opacity-0'
          }`}>
            <Shield 
              size={120} 
              className="text-primary drop-shadow-lg animate-[pulse_1.5s_ease-in-out_infinite,scale-in_2s_ease-out_forwards]" 
              strokeWidth={1.5}
            />
          </div>
        </div>
      )}

      {/* Text Animation Stage */}
      {stage === 'text' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-wider">
              <span className="bg-gradient-to-r from-primary via-authority to-safety bg-clip-text text-transparent">
                Suraksha
              </span>
              <span className="ml-3 text-foreground">
                Yaatri
              </span>
            </h1>
          </div>
          <div className="animate-fade-in delay-500">
            <p className="text-muted-foreground text-lg tracking-wide">
              Your Digital Safety Companion
            </p>
          </div>
        </div>
      )}

      {/* Loading indicator during shield stage */}
      {stage === 'shield' && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
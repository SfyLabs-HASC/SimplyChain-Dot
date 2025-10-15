import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const LottieAnimation: React.FC = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/animation.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  if (!animationData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-primary/10 animate-pulse flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieAnimation;
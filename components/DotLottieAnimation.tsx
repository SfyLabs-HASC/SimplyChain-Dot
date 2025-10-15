import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface DotLottieAnimationProps {
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const DotLottieAnimation: React.FC<DotLottieAnimationProps> = ({ 
  className = '', 
  loop = true, 
  autoplay = true 
}) => {
  return (
    <div className={`dotlottie-container ${className}`}>
      <DotLottieReact
        src="https://lottie.host/f44aef0a-a827-4e6b-8f52-5f18ff59d052/3pKQcy8tyk.lottie"
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default DotLottieAnimation;
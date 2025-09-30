import React from 'react';
import { Clock } from 'lucide-react';

interface ComingSoonProps {
  platform: string;
  icon?: React.ReactNode;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ platform, icon, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-escalador-dark/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-escalador-neon-blue mr-2" />
            {icon}
          </div>
          <div className="text-escalador-neon-blue font-semibold text-sm">Em breve</div>
          <div className="text-gray-400 text-xs">{platform}</div>
        </div>
      </div>
      
      {/* Disabled content placeholder */}
      <div className="opacity-30 pointer-events-none">
        {/* This will contain the disabled content */}
      </div>
    </div>
  );
};

export default ComingSoon;

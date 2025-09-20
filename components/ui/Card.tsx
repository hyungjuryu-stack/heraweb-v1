
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-[#1A3A32]/80 border border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm ${className}`}>
      {title && (
        <div className="border-b border-gray-700/50 px-6 py-4">
          <h3 className="text-lg font-bold text-[#E5A823]">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;

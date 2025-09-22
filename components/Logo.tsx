import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-24">
      <h1 className="text-4xl font-bold font-gowun text-[#E5A823] tracking-wider select-none">
        헤라매쓰
      </h1>
      <p className="text-xs text-gray-400 mt-1 select-none">
        MATH ACADEMY
      </p>
    </div>
  );
};

export default Logo;
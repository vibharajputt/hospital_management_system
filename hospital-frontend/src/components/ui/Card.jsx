import React from 'react';

export const Card = ({ title, subtitle, children, right, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {(title || subtitle || right) && (
      <div className="flex justify-between items-start mb-6">
        <div>
          {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
    )}
    {children}
  </div>
);

export default Card;

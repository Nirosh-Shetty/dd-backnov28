import React, { useState } from 'react';
import '../Styles/ExpandableCard.css';

// NOTE: ChevronDown icon import has been removed.

const ExpandableCard = ({ icon, title, subtitle, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='expandable-card'>
      <button className='expandable-header' onClick={() => setIsOpen(!isOpen)}>
        <div className='expandable-header-left'>
          {icon && <div className='expandable-icon-wrapper'>{icon}</div>}
          <div className='expandable-title-group'>
            <p className='expandable-title'>{title}</p>
            {subtitle && <p className='expandable-subtitle'>{subtitle}</p>}
          </div>
        </div>
        {/* Replaced icon with a pure CSS chevron */}
        <div className={`css-chevron ${isOpen ? 'open' : ''}`}></div>
      </button>
      <div className={`expandable-content ${isOpen ? 'open' : ''}`}>
        <div className='expandable-content-inner'>{children}</div>
      </div>
    </div>
  );
};

export default ExpandableCard;

import React, { useState, useEffect } from 'react';

const PackerClock = () => {
  const [time, setTime] = useState(new Date());
  const [template, setTemplate] = useState('dark');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
   
    });
  };

  const getRotation = (value, max) => {
    return (value / max) * 360;
  };

  const templates = {
    classic: {
      icon: '🏢',
      clockFace: 'white',
      textColor: '#333',
      accentColor: '#007bff'
    },
    modern: {
      icon: '💎',
      clockFace: 'rgba(255, 255, 255, 0.9)',
      textColor: '#333',
      accentColor: '#00d4ff'
    },
    dark: {
      icon: '🌙',
      clockFace: '#2d3748',
      textColor: '#e2e8f0',
      accentColor: '#63b3ed'
    },
    neon: {
      icon: '⚡',
      clockFace: '#0f0f0f',
      textColor: '#00ffff',
      accentColor: '#ff00ff'
    },
    retro: {
      icon: '📻',
      clockFace: '#FFE4E1',
      textColor: '#8B0000',
      accentColor: '#ff4757'
    },
    minimal: {
      icon: '⚪',
      clockFace: 'white',
      textColor: '#212529',
      accentColor: '#6c757d'
    }
  };

  const currentTemplate = templates[template];

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourRotation = getRotation(hours + minutes / 60, 12);
  const minuteRotation = getRotation(minutes + seconds / 60, 60);
  const secondRotation = getRotation(seconds, 60);

  const [openTemp,setUpenTemp]=useState(false);
  return (
    <div className="d-flex flex-column align-items-center" >
      {/* Template Selection */}
      {openTemp && <div className="d-flex gap-2 mb-3" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.entries(templates).map(([key, tmpl]) => (
          <button
            key={key}
            onClick={() => {
                setTemplate(key)
                setUpenTemp(false)
            }}
            className="btn p-0 d-flex align-items-center justify-content-center"
            style={{
              width: '45px',
              height: '45px',
              fontSize: '18px',
              borderRadius: '12px',
              border: template === key ? `3px solid ${currentTemplate.accentColor}` : '2px solid #dee2e6',
              backgroundColor: template === key ? `${currentTemplate.accentColor}15` : 'white',
              color: template === key ? currentTemplate.accentColor : '#6c757d',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxShadow: template === key ? 
                `0 0 0 2px ${currentTemplate.accentColor}20, 0 2px 8px rgba(0,0,0,0.1)` : 
                '0 1px 3px rgba(0,0,0,0.1)',
              transform: template === key ? 'scale(1.05)' : 'scale(1)'
            }}
            title={key.charAt(0).toUpperCase() + key.slice(1)}
            onMouseEnter={(e) => {
              if (template !== key) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (template !== key) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }
            }}
          >
            {tmpl.icon}
          </button>
        ))}
      </div>}
      

      <div className="position-relative " onClick={()=>setUpenTemp(!openTemp)} style={{cursor:"pointer"}}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Clock Face */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill={currentTemplate.clockFace}
            stroke={template === 'neon' ? currentTemplate.textColor : '#e0e0e0'}
            strokeWidth="2"
            style={{
              filter: template === 'neon' ? `drop-shadow(0 0 5px ${currentTemplate.textColor})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Hour Markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) - 90;
            const isMainHour = i % 3 === 0;
            const outerRadius = 48;
            const innerRadius = isMainHour ? 42 : 44;
            
            const x1 = 50 + Math.cos(angle * Math.PI / 180) * outerRadius;
            const y1 = 50 + Math.sin(angle * Math.PI / 180) * outerRadius;
            const x2 = 50 + Math.cos(angle * Math.PI / 180) * innerRadius;
            const y2 = 50 + Math.sin(angle * Math.PI / 180) * innerRadius;
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={template === 'neon' ? currentTemplate.textColor : (isMainHour ? currentTemplate.textColor : "#999")}
                strokeWidth={isMainHour ? "2" : "1"}
                style={{
                  filter: template === 'neon' ? `drop-shadow(0 0 3px ${currentTemplate.textColor})` : 'none'
                }}
              />
            );
          })}
          
          {/* Hour Numbers */}
          {[...Array(12)].map((_, i) => {
            const hour = i === 0 ? 12 : i;
            const angle = (i * 30) - 90;
            const radius = 37;
            
            const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
            const y = 50 + Math.sin(angle * Math.PI / 180) * radius;
            
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8"
                fontWeight="bold"
                fill={currentTemplate.textColor}
                fontFamily={template === 'retro' ? 'serif' : 'sans-serif'}
                style={{
                  filter: template === 'neon' ? `drop-shadow(0 0 4px ${currentTemplate.textColor})` : 'none'
                }}
              >
                {template === 'retro' ? ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'][i] : hour}
              </text>
            );
          })}
          
          {/* Digital Clock Display - Moved to top to avoid second hand overlap */}
          <foreignObject x="32" y="60" width="38" height="14">
            <div className="d-flex justify-content-center align-items-center h-100" 
                 style={{
                   background: template === 'neon' ? currentTemplate.accentColor : 
                              template === 'dark' ? 'rgba(0,0,0,0.8)' :
                              'rgba(0, 123, 255, 0.9)',
                   color: template === 'dark' ? currentTemplate.textColor : 'white',
                   fontSize: '7px',
                   fontFamily: 'monospace',
                   fontWeight: 'bold',
                   borderRadius: '2px',
                   padding: '1px',
                   boxShadow: template === 'neon' ? `0 0 5px ${currentTemplate.accentColor}` : 'none'
                 }}>
              {formatTime(time)}
            </div>
          </foreignObject>
          
          {/* Clock Hands */}
          <line
            x1="50" y1="50"
            x2={50 + Math.cos((hourRotation - 90) * Math.PI / 180) * 22}
            y2={50 + Math.sin((hourRotation - 90) * Math.PI / 180) * 22}
            stroke={currentTemplate.accentColor}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transition: 'all 0.5s ease-in-out',
              filter: template === 'neon' ? `drop-shadow(0 0 4px ${currentTemplate.accentColor})` : 'none'
            }}
          />
          
          <line
            x1="50" y1="50"
            x2={50 + Math.cos((minuteRotation - 90) * Math.PI / 180) * 30}
            y2={50 + Math.sin((minuteRotation - 90) * Math.PI / 180) * 30}
            stroke={currentTemplate.textColor}
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transition: 'all 0.5s ease-in-out',
              filter: template === 'neon' ? `drop-shadow(0 0 3px ${currentTemplate.textColor})` : 'none'
            }}
          />
          
          <line
            x1="50" y1="50"
            x2={50 + Math.cos((secondRotation - 90) * Math.PI / 180) * 35}
            y2={50 + Math.sin((secondRotation - 90) * Math.PI / 180) * 35}
            stroke="#dc3545"
            strokeWidth="1"
            strokeLinecap="round"
            style={{
              transition: seconds === 0 ? 'none' : 'all 0.1s ease-out',
              filter: template === 'neon' ? 'drop-shadow(0 0 3px #dc3545)' : 'none'
            }}
          />
          
          <circle cx="50" cy="50" r="3" fill={currentTemplate.accentColor} />
          <circle cx="50" cy="50" r="1.5" fill={currentTemplate.clockFace} />
        </svg>
      </div>
    </div>
  );
};

export default PackerClock;
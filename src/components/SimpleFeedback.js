import React, { useState, useRef } from 'react';
import { MessageCircle } from 'lucide-react';

const SimpleFeedback = () => {
  const [position, setPosition] = useState({ x: 10, y: window.innerHeight - 80 });
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef(null);

  const handleMouseDown = (e) => {
    setHasMoved(false);
    const rect = buttonRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const handleMouseMove = (e) => {
      setHasMoved(true);
      setPosition({
        x: Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - 44)),
        y: Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - 44))
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleClick = () => {
    if (!hasMoved) {
      window.open('https://forms.gle/3MvF5N2VCE85YuuAA', '_blank');
    }
  };

  return (
    <div
      ref={buttonRef}
      className="fixed z-50 cursor-grab"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        style={{ backgroundColor: '#00837F' }}
        title="Give Feedback - Drag to move"
      >
        <MessageCircle size={20} className="text-white" />
      </div>
    </div>
  );
};

export default SimpleFeedback;
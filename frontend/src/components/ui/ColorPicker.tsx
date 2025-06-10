import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  presetColors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'] 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Efeito para fechar o seletor ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleColorSelect = (selectedColor: string) => {
    onChange(selectedColor);
    setShowPicker(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div 
        className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer flex items-center justify-center"
        onClick={() => setShowPicker(!showPicker)}
        style={{ backgroundColor: color || '#ffffff' }}
      >
        {!color && <span className="text-gray-400">?</span>}
      </div>
      
      {showPicker && (
        <div className="absolute z-10 mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 w-64">
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((presetColor, index) => (
              <div 
                key={index}
                className="w-12 h-12 rounded-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorSelect(presetColor)}
              >
                {color === presetColor && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código hexadecimal
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              placeholder="#RRGGBB"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;


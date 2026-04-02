import { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  name: string;
  value?: string | number;
}

interface DropdownProps {
  label?: string;
  options: any[];
  value: string | number;
  onChange: (value: string) => void;
  displayField?: string;
  valueField?: string;
  placeholder?: string;
}

export default function CustomDropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  displayField = 'name', 
  valueField = 'name',
  placeholder 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt[valueField]?.toString() === value?.toString());
  const displayText = selectedOption ? selectedOption[displayField] : placeholder || 'Select...';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', marginBottom: '1.5rem' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          fontSize: '0.8rem', 
          color: 'rgba(255,255,255,0.7)', 
          marginBottom: '0.4rem',
          fontWeight: 500
        }}>
          {label}
        </label>
      )}
      
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          background: isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          color: 'white',
          border: `1px solid ${isOpen ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          fontSize: '0.95rem',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
        }}
      >
        <span style={{ opacity: selectedOption ? 1 : 0.6 }}>{displayText}</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s ease',
            opacity: 0.5
          }}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Popover */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '105%',
          left: 0,
          right: 0,
          background: '#1a1a1e',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden',
          padding: '4px',
          backdropFilter: 'blur(20px)',
          animation: 'dropdownFadeIn 0.15s ease-out',
        }}>
          {options.length === 0 && (
            <div style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              No options available
            </div>
          )}
          {options.map((opt) => (
            <button
              key={opt.id || opt.value || opt.name}
              onClick={() => {
                onChange(opt[valueField]?.toString());
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: 'none',
                background: opt[valueField]?.toString() === value?.toString() 
                  ? 'rgba(99,102,241,0.15)' 
                  : 'transparent',
                color: opt[valueField]?.toString() === value?.toString() ? 'var(--primary)' : 'white',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '0.9rem',
                transition: 'background 0.1s ease',
                fontWeight: opt[valueField]?.toString() === value?.toString() ? 600 : 400
              }}
              onMouseEnter={(e) => {
                if (opt[valueField]?.toString() !== value?.toString()) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (opt[valueField]?.toString() !== value?.toString()) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {opt[displayField]}
            </button>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

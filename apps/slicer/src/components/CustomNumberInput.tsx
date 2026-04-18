import { useState, useRef, useEffect } from 'react';

interface NumberInputProps {
  label?: string;
  name?: string;
  id?: string;
  defaultValue?: number | string;
  value?: number | string;
  onChange?: (value: number) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  step?: number | string;
  min?: number | string;
  max?: number | string;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function CustomNumberInput({
  label,
  name,
  id,
  defaultValue,
  value: controlledValue,
  onChange,
  onBlur,
  step = 1,
  min,
  max,
  placeholder,
  style
}: NumberInputProps) {
  const [internalValue, setInternalValue] = useState<string | number>(controlledValue ?? defaultValue ?? 0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleIncrement = () => {
    if (inputRef.current) {
      inputRef.current.stepUp();
      const newValue = inputRef.current.value;
      setInternalValue(newValue);
      if (onChange) onChange(parseFloat(newValue));
    }
  };

  const handleDecrement = () => {
    if (inputRef.current) {
      inputRef.current.stepDown();
      const newValue = inputRef.current.value;
      setInternalValue(newValue);
      if (onChange) onChange(parseFloat(newValue));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (onChange && e.target.value !== '') {
      onChange(parseFloat(e.target.value));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', ...style }}>
      {label && (
        <label style={{ 
          fontSize: '0.8rem', 
          color: 'rgba(255,255,255,0.7)', 
          fontWeight: 500
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="number"
          name={name}
          id={id}
          value={internalValue}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          onChange={handleInputChange}
          onBlur={onBlur}
          className="custom-number-input"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            borderRadius: '10px',
            padding: '0.75rem 3rem 0.75rem 1rem', // Space for buttons on right
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            outline: 'none',
          }}
        />
        <div style={{ 
          position: 'absolute', 
          right: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2px' 
        }}>
          <button
            type="button"
            onClick={handleIncrement}
            className="input-arrow-btn"
            style={{
              padding: '1px 6px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s ease',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="input-arrow-btn"
            style={{
              padding: '1px 6px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s ease',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-number-input:hover {
          border-color: rgba(255,255,255,0.2) !important;
        }
        .custom-number-input:focus {
          background: rgba(255,255,255,0.08) !important;
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
        .input-arrow-btn:hover {
          background: rgba(255,255,255,0.15) !important;
        }
        .input-arrow-btn:active {
          transform: scale(0.92);
        }
      `}} />
    </div>
  );
}

import React from 'react';
import { Delete } from 'lucide-react';

export default function VirtualKeyboard({ onKeyPress, onBackspace }) {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫']
  ];

  return (
    <div style={{
      background: '#f8fafc',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      marginTop: '1rem',
      userSelect: 'none',
      width: '100%',
      margin: '1rem 0 0 0'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {rows.flat().map(key => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === '⌫') onBackspace();
              else if (key === 'C') {
                // We'll handle 'C' in onBackspace but clearing instead, for now let's just trigger multiple backspaces or leave C out. 
                // Let's just make the bottom row: [null, 0, backspace]
              } else {
                onKeyPress(key);
              }
            }}
            style={{
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              padding: '1rem 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'background 0.1s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              visibility: key === 'C' ? 'hidden' : 'visible' // Hide 'C' for now to keep the layout symmetric
            }}
            onMouseDown={e => e.preventDefault()}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = 'white'}
          >
            {key === '⌫' ? <Delete size={28} /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}

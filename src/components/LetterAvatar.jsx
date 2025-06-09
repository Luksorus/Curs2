import React from 'react';

const LetterAvatar = ({ name, size = 100, backgroundColor = '#3498db', color = '#ffffff' }) => {
  const firstLetter = name.charAt(0).toUpperCase();

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor,
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size / 2}px`,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  return (
    <div style={style}>
      {firstLetter}
    </div>
  );
};

export default LetterAvatar; 
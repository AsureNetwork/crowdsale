import React from 'react';

export function Register({onContribute}) {
  return (
    <div className="Register Box">
      <input type="button" onClick={onContribute} value="Become an Early Contributer" />
    </div>
  );
}

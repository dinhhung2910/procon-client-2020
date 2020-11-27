import {useEffect} from 'react';

/**
 * Add event listeners to handler keyboard event
 * Used for quick navigate between agents and move them
 * @return {null}
 */
function KeyboardHandler() {
  const eventListener = (e) => {
    console.log(e);
  };

  useEffect(() => {
    document.addEventListener('keydown', eventListener);
    return (() => {
      document.removeEventListener('keydown', eventListener);
    });
  }, []);
  return null;
}

export default KeyboardHandler;

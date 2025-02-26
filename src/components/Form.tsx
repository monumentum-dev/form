import React, { useEffect, useState, type JSX } from 'react';

function App(){
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch('/.netlify/functions/hello')
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>React + Netlify Functions</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
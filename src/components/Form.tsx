import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/.netlify/functions/hello')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error(error));
  }, []);
   console.log("Message", message)
  return (
    <div>
      <h1>React + Netlify Functions</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
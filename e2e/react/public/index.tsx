import React from 'react';
import ReactDOM from 'react-dom/client';
import Text from "./Text";

function App() {
  return (
    <div>
      <h1>Hello, world <Text /></h1>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('element-1') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

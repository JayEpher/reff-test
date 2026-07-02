import React from 'react';
import { Button } from '@puff/ui';
import { config } from '@puff/config';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to {config.appName} DApp</h1>
      <Button onClick={() => alert('Hello from shared UI!')}>Click Me</Button>
    </div>
  );
}

export default App;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createCtx } from '@reatom/core';
import { reatomContext } from '@reatom/npm-react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './setup/theme.ts';

const ctx = createCtx();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <reatomContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </reatomContext.Provider>
  </StrictMode>
);

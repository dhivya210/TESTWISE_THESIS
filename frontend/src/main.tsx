import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('🚀 Main.tsx: Starting app initialization...');

// Ensure root element exists before rendering
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Main.tsx: Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; font-family: Arial; background: #fff; color: #000;"><h1>Error</h1><p>Root element not found. Please check your HTML.</p></div>';
} else {
  console.log('✅ Main.tsx: Root element found');
  try {
    console.log('✅ Main.tsx: Creating React root...');
    const root = createRoot(rootElement);
    console.log('✅ Main.tsx: Rendering app...');
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('✅ Main.tsx: App rendered successfully!');
  } catch (error) {
    console.error('❌ Main.tsx: Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: Arial; background: #fff; color: #000; min-height: 100vh;">
        <h1 style="color: #d32f2f;">Error Loading App</h1>
        <p>Failed to initialize the application.</p>
        <pre style="background: #f5f5f5; padding: 20px; border-radius: 4px; overflow: auto; white-space: pre-wrap;">${error instanceof Error ? error.message + '\n\n' + error.stack : String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; cursor: pointer; background: #1976d2; color: #fff; border: none; border-radius: 4px; font-size: 16px;">Reload Page</button>
      </div>
    `;
  }
}

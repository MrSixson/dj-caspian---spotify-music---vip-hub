import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerPwa} from './pwa';

createRoot(document.getElementById('root')!).render(<App />);

// PWA registration is isolated so unsupported browsers keep the regular site experience.
registerPwa();

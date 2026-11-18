import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerWebMcpTools } from './utils/webmcp'

registerWebMcpTools();

createRoot(document.getElementById("root")!).render(<App />);

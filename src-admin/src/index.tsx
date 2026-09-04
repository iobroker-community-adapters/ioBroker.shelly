// this file is used only by the vite dev server and is not part of the admin build
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<div>The Shelly admin components can only be used inside the ioBroker admin.</div>);
}

import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import MainLayout from './Layouts/MainLayout/MainLayout';

createInertiaApp({
    /* Establecer el layout por defecto para todo el sistema */
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        let page = pages[`./Pages/${name}.jsx`];
        page.default.layout = page.default.layout || ((page) => (<MainLayout children={page} />));
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
})
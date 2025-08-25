import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    resolve: {
        alias: {
            '@' : "/resources/js",
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id){
                    if (id.includes('node_modules')) {
                        const modulePath = id.split('node_modules/')[1];
                        const topLevelFolder = modulePath?.split('/')[0];
                        if (topLevelFolder !== '.pnpm') {
                            return topLevelFolder;
                        }
                        
                        // changed . to ?. for the two lines below:
                        const scopedPackageName = modulePath?.split('/')[1];
                        const chunkName = scopedPackageName?.split('@')[scopedPackageName.startsWith('@') ? 1 : 0];

                        return chunkName;
                    }
                }
            }
        }
    }
    /*server: {
        host: '101.40.4.131', // Establecer la dirección IP desde donde el servidor (php artisan) entragará el contenido del sitio
        cors: true, // Allow all origins for local development
    },*/
});

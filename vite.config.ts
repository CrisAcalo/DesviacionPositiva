import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // loadEnv reads .env / .env.local / .env.{mode} files.
    // The empty-string prefix means ALL variables are loaded (not just VITE_*).
    // PHP_BIN lets local environments (e.g. Laragon on Windows) point to the
    // correct php executable. In production (Laravel Cloud) php is in PATH.
    const env = loadEnv(mode, process.cwd(), '');
    const phpBin = env.PHP_BIN ?? 'php';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                refresh: true,
                fonts: [
                    bunny('Instrument Sans', {
                        weights: [400, 500, 600],
                    }),
                ],
            }),
            inertia(),
            react(),
            tailwindcss(),
            wayfinder({
                formVariants: true,
                // formVariants:true already appends --with-form; don't duplicate it here
                command: `${phpBin} artisan wayfinder:generate`,
            }),
        ],
    };
});

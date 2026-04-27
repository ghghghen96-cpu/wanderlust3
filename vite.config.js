import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        define: {
            'process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': JSON.stringify(env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
        }
    };
})

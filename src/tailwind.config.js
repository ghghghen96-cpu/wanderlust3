/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2bee6c', // Emerald Green
                secondary: '#0f172a', // Deep Ocean
                surface: '#ffffff',
                background: '#f8fafc', // Sand/Beige
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Montserrat', 'Inter', 'sans-serif'],
                serif: ['Cormorant Garamond', 'serif'],
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [],
}

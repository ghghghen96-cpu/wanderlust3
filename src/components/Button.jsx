import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-8 py-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 text-lg active:scale-95";

    const variants = {
        primary: "bg-primary text-secondary hover:brightness-110 shadow-lg shadow-primary/20",
        secondary: "bg-white border border-gray-200 text-secondary hover:bg-gray-50",
        text: "bg-transparent text-secondary hover:bg-gray-100",
        fab: "fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary text-secondary shadow-2xl z-50 p-0"
    };

    const Component = props.href ? motion.a : motion.button;

    return (
        <Component
            className={`${baseStyles} ${variants[variant]} ${className}`}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Button;

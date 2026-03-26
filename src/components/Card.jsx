import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', selected = false, onClick, ...props }) => {
    return (
        <motion.div
            className={`
        bg-white rounded-2xl p-6 transition-all cursor-pointer border-2
        ${selected ? 'border-primary shadow-lg shadow-primary/10' : 'border-transparent shadow-sm hover:shadow-md'}
        ${className}
      `}
            onClick={onClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;

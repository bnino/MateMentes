import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaMinus, FaTimes, FaDivide } from 'react-icons/fa';

const OperationSelector = ({ onSelectOperation }) => {
  const operations = [
    { name: 'Suma', icon: FaPlus, value: '+' },
    { name: 'Resta', icon: FaMinus, value: '-' },
    { name: 'Multiplicación', icon: FaTimes, value: 'x' },
    { name: 'División', icon: FaDivide, value: '/' },
  ];

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">¡Elige tu aventura matemática!</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {operations.map((op) => (
          <motion.button
            key={op.value}
            onClick={() => onSelectOperation(op.value)}
            className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + operations.indexOf(op) * 0.1 }}
          >
            <op.icon className="w-12 h-12 mb-3" />
            <span className="text-lg sm:text-2xl md:text-lg lg:text-xl font-semibold">{op.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default OperationSelector;
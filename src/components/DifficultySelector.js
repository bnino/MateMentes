import React from 'react';
import { motion } from 'framer-motion';
import { FaDice } from 'react-icons/fa';

const DifficultySelector = ({ onSelectDifficulty, operation }) => {
  const difficulties = [
    { label: '1 Cifra', value: 1 },
    { label: '2 Cifras', value: 2 },
    { label: '3 Cifras', value: 3 },
    { label: '4 Cifras', value: 4 },
  ];

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        ¿Cuántas cifras quieres para el {operation === 'x' ? 'multiplicador' : 'divisor'}?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {difficulties.map((diff) => (
          <motion.button
            key={diff.value}
            onClick={() => onSelectDifficulty(diff.value)}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + difficulties.indexOf(diff) * 0.1 }}
          >
            <FaDice className="w-12 h-12 mb-3" />
            <span className="text-xl font-semibold">{diff.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default DifficultySelector;
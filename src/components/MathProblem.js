import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import { generateOptions, getStepByStep } from '../utils/mathUtils';

const MathProblem = ({ problem, onAnswer, isAnswer, setIsAnswer }) => {
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // 1 minuto 30 segundos = 90 segundos
  const [timerActive, setTimerActive] = useState(true);
  const [timeoutExpired, setTimeoutExpired] = useState(false);

  useEffect(() => {
    if (problem) {
      setOptions(generateOptions(problem.answer));
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
      setTimeLeft(90); // Reiniciar el temporizador para cada nuevo problema
      setTimerActive(true);
      setTimeoutExpired(false);
      setIsAnswer(0);
    }
  }, [problem]);

  useEffect(() => {
      if (!timerActive) return;
  
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1600);
  
      return () => clearInterval(timer);
    }, [timerActive, problem]); // Dependencia 'problem' para reiniciar el timer al cambiar de problema

    useEffect(() => {
      if (isCorrect !== null && !isCorrect) {
        setIsAnswer(selectedAnswer);
      }
    }, [isCorrect, setIsAnswer]);

  const playSound = (type) => {
    let audio;
    if (type === 'correct') {
      audio = new Audio('/sounds/correct.mp3'); // Asegúrate de tener este archivo
    } else if (type === 'incorrect') {
      audio = new Audio('/sounds/incorrect.mp3'); // Asegúrate de tener este archivo
    } else if (type === 'click') {
      audio = new Audio('/sounds/click.mp3'); // Asegúrate de tener este archivo
    }
    if (audio) {
      audio.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const handleTimeout = () => {
    setTimerActive(false);
    setSelectedAnswer(problem.answer); // Seleccionar la respuesta correcta para mostrarla
    setIsCorrect(false); // Contar como incorrecta por no responder a tiempo
    playSound('incorrect');
    setTimeoutExpired(true); // Se verificaque si se acabó el tiempo
    setShowExplanation(true); // Mostrar explicación
    //onAnswer(false);
    //setTimeout(() => onAnswer(false), 2000); // Pasar a la siguiente pregunta después de un tiempo
  };

  const handleOptionClick = (option) => {
    //playSound('click');
    
    if (!timerActive) return; // No permitir clics si el temporizador ya terminó
    setTimerActive(false); // Detener el temporizador al seleccionar una respuesta
    setSelectedAnswer(option);
    const correct = option === problem.answer;
    setIsCorrect(correct);
    if (correct) {
      playSound('correct');
      setTimeout(() => onAnswer(true), 1500); // Pequeña pausa para la celebración
    } else {
      
      //onAnswer(false);
      playSound('incorrect');
      //setIsViewExplanation(!isViewExplanation);
      setShowExplanation(true);
    }
  };

  if (!problem) {
    return null;
  }

  const stepByStep = getStepByStep(problem.num1, problem.num2, problem.operation);

  const renderProblem = () => {
    const num1Str = problem.num1.toString();
    const num2Str = problem.num2.toString();
    
    // Longitud máxima para alinear
    const maxLen = Math.max(num1Str.length, num2Str.length);
    const cols = maxLen + 1; // +1 para la columna del operador en la segunda fila

    // Paddings para tener arrays de dígitos con la misma longitud
    const num1Padded = num1Str.padStart(maxLen, ' ');
    const num2Padded = num2Str.padStart(maxLen, ' ');

    

    const formatNumber = (num) => {
      
      return num.toString().padStart(maxLen, ' ');
    };

    switch (problem.operation) {
      case '+':
      case '-':
        return (
          <div className="flex flex-col items-center text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 w-full">
            <div className="flex items-center justify-center w-full">

              <div className="flex items-center justify-center mr-4">
                <span className="text-blue-600">{problem.operation}</span>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span>{formatNumber(problem.num1)}</span>
                <span className="text-blue-600">{formatNumber(problem.num2)}</span>
              </div>
            </div>

            <div className="w-full h-1 bg-gray-400 my-2" />
          </div>
        );
      case 'x':
        return (
          <div className="flex flex-col items-center text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 w-full">
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center justify-center mr-4">
                <span className="text-purple-600">{problem.operation}</span>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span>{formatNumber(problem.num1)}</span>
                <span className="text-purple-600">{formatNumber(problem.num2)}</span>
              </div>
            </div>

            <div className="w-full h-1 bg-gray-400 my-2" />
          </div>
        );
      case '/':

        return (
          <div className="flex flex-col items-center text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 w-full">
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center justify-center mr-4">
                <span className="text-purple-600">÷</span>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span>{formatNumber(problem.num1)}</span>
                <span className="text-purple-600">{formatNumber(problem.num2)}</span>
              </div>
            </div>

            <div className="w-full h-1 bg-gray-400 my-2" />
          </div>
        );
      default:
        return null;
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-1 left-1 bg-blue-500 text-white px-2 py-1 rounded-full font-bold text-sm shadow-lg">
        Tiempo: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
      {renderProblem()}

      {problem.operation === '/' && problem.remainder > 0 && (
        <p className="text-xl font-semibold text-gray-700 mb-6">
          (Recuerda el residuo si lo hay)
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={selectedAnswer !== null}
            className={`p-6 rounded-2xl text-4xl  font-bold shadow-lg transform transition-all duration-300
              ${selectedAnswer === null
                ? 'bg-gradient-to-r from-pink-400 to-red-500 text-white hover:scale-105 hover:shadow-xl'
                : selectedAnswer === option
                  ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                  : 'bg-gray-200 text-gray-600 cursor-not-allowed'
              }`}
            whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
            whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            {option}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {isCorrect !== null && !timeoutExpired && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            {isCorrect ? (
              <div className="flex items-center justify-center text-green-600 text-3xl font-bold">
                <FaCheckCircle className="w-8 h-8 mr-3" />
                ¡Correcto! ¡Eres un genio!
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-red-600 text-3xl font-bold">
                <FaTimesCircle className="w-8 h-8 mr-3 mb-2" />
                ¡Ups! Esa no es la respuesta correcta.
                {problem.operation === '/' && problem.remainder > 0 && (
                  <p className="text-xl font-semibold text-gray-700 mt-2">
                    El cociente es {problem.answer} y el residuo es {problem.remainder}.
                  </p>
                )}
                <motion.button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="mt-4 px-6 py-3 bg-yellow-500 text-white rounded-full shadow-md hover:bg-yellow-600 transition-colors duration-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaLightbulb className="mr-2" />
                  {showExplanation ? 'Ocultar explicación' : 'Ver cómo se hace'}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExplanation && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl text-left text-gray-800"
          >
            <h3 className="text-2xl font-bold mb-4 text-blue-700">Así se resuelve:</h3>
            <pre className="bg-blue-100 p-4 rounded-lg overflow-x-auto text-lg font-mono">
              {stepByStep.join('\n')}
            </pre>
            <motion.button
              onClick={() => onAnswer(false)}
              className="mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-xl font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ¡Intentar otro!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MathProblem;
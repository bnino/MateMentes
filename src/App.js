import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OperationSelector from './components/OperationSelector';
import DifficultySelector from './components/DifficultySelector';
import MathProblem from './components/MathProblem';
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

import {
  generateAdditionProblem,
  generateSubtractionProblem,
  generateMultiplicationProblem,
  generateDivisionProblem,
} from './utils/mathUtils';

const App = () => {

  const fireworksRef = useRef(null);
  const [currentStep, setCurrentStep] = useState('enterName');
  const [playerName, setPlayerName] = useState('');
  const [overallDifficulty, setOverallDifficulty] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedDigitsDifficulty, setSelectedDigitsDifficulty] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);

  const [isAnswer, setIsAnswer] = useState(0);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [problemCount, setProblemCount] = useState(0);
  const MAX_PROBLEMS = 10;

  const [playerHistory, setPlayerHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('results_history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Error parsing player history from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    if (problemCount >= MAX_PROBLEMS) {
      handleSaveResult({ playerName, correct: correctAnswers, incorrect: incorrectAnswers });
      setCurrentStep('showResults');
    }
  }, [problemCount]);

  const handleNameSubmit = (name) => {
    setPlayerName(name.toUpperCase());
    setCurrentStep('selectOverallDifficulty');
  };

  const handleSelectOverallDifficulty = (difficulty) => {
    setOverallDifficulty(difficulty);
    setCurrentStep('selectOperation');
  };

  const handleSelectOperation = (operation) => {
    setSelectedOperation(operation);
    if (operation === '+' || operation === '-') {
      generateNewProblem(operation, null, overallDifficulty);
      setCurrentStep('solveProblem');
    } else {
      setCurrentStep('selectDigitsDifficulty');
    }
  };

  const handleSelectDigitsDifficulty = (digits) => {
    setSelectedDigitsDifficulty(digits);
    generateNewProblem(selectedOperation, digits, overallDifficulty);
    setCurrentStep('solveProblem');
  };

  const generateNewProblem = (operation, digits, difficulty) => {
    let problem;
    switch (operation) {
      case '+':
        problem = generateAdditionProblem(difficulty);
        break;
      case '-':
        problem = generateSubtractionProblem(difficulty);
        break;
      case 'x':
        problem = generateMultiplicationProblem(digits, difficulty);
        break;
      case '/':
        problem = generateDivisionProblem(digits, difficulty);
        break;
      default:
        problem = null;
    }
    setCurrentProblem(problem);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      fireworksRef.current?.run({ speed: 3});
      setTimeout(() => {
        
        fireworksRef.current?.stop();
        setProblemCount(prev => prev + 1);
      }, 2000);
    } else {
      setIncorrectAnswers(prev => prev + 1);
      setProblemCount(prev => prev + 1);
    }

    if (problemCount + 1 < MAX_PROBLEMS) {
      setTimeout(() => { // Pequeño retraso para que el usuario vea el feedback
        generateNewProblem(selectedOperation, selectedDigitsDifficulty, overallDifficulty);
      }, isCorrect ? 2000 : 1000); // Más tiempo para correctas por el confeti
    }
  };

  const handleGoBack = () => {
    if (currentStep === 'showHistory') {
      setCurrentStep('enterName');
      return;
    }

    if (playerName && currentStep !== 'enterName') { // No permitir volver a la pantalla de nombre si ya hay uno

      if (currentStep === 'solveProblem' && isAnswer !== 0) {
        setIncorrectAnswers(prev => prev + 1);
        setProblemCount(prev => prev + 1);
      }

      if (currentStep === 'solveProblem' && (selectedOperation === '+' || selectedOperation === '-')) {
        setCurrentStep('selectOperation');
        setSelectedOperation(null);
        //setCurrentProblem(null);
      } else if (currentStep === 'solveProblem' && (selectedOperation === 'x' || selectedOperation === '/')) {
        setCurrentStep('selectDigitsDifficulty');
        setCurrentProblem(null);
      } else if (currentStep === 'selectDigitsDifficulty') {
        setCurrentStep('selectOperation');
        setSelectedOperation(null);
        setSelectedDigitsDifficulty(null);
      } else if (currentStep === 'selectOperation') {
        setCurrentStep('selectOverallDifficulty');
        setOverallDifficulty(null);
        setSelectedOperation(null);
      }
    }
  };

  const resetGame = () => {
    setPlayerName('');
    setOverallDifficulty(null);
    setSelectedOperation(null);
    setSelectedDigitsDifficulty(null);
    setCurrentProblem(null);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setProblemCount(0);
    setCurrentStep('enterName');
  };

  const playSound = () => {
    let audio = new Audio('/sounds/click.mp3');;
    if (audio) {
      audio.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const PlayerNameInput = ({ onSubmit, onShowHistory }) => {
    //playSound();
    const [name, setName] = useState('');
    const handleSubmit = (e) => {
      e.preventDefault();
      if (name.trim()) {
        onSubmit(name.trim());
        
      }
    };
    return (
      <motion.div
        className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">¡Hola, pequeño genio! ¿Cuál es tu nombre?</h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Escribe tu nombre aquí"
            className="w-full max-w-sm px-6 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium text-center"
            maxLength="15"
          />
          <motion.button
            type="submit"
            disabled={!name.trim()}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
              name.trim()
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={name.trim() ? { scale: 1.05 } : {}}
            whileTap={name.trim() ? { scale: 0.95 } : {}}
          >
            ¡Empezar!
          </motion.button>
        </form>
        <motion.button
          onClick={onShowHistory}
          className="mt-4 px-6 py-3 bg-gray-400 text-white rounded-full shadow-md hover:bg-gray-500 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Historial
        </motion.button>

      </motion.div>
    );
  };

  const OverallDifficultySelector = ({ onSelectDifficulty }) => {
    const difficulties = [
      { label: 'Fácil', value: 'easy' },
      { label: 'Medio', value: 'medium' },
      { label: 'Difícil', value: 'hard' },
    ];

    return (
      <motion.div
        className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          ¡Elige la dificultad!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {difficulties.map((diff) => (
            <motion.button
              key={diff.value}
              onClick={() => onSelectDifficulty(diff.value)}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + difficulties.indexOf(diff) * 0.1 }}
            >
              <span className="text-xl font-semibold">{diff.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const ResultsScreen = ({ playerName, correct, incorrect, onPlayAgain, onSaveResult }) => {
    const total = correct + incorrect;
    const percentage = total > 0 ? ((correct / total) * 100).toFixed(0) : 0;

    return (
      <motion.div
        className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-4">¡Resultados de {playerName}!</h2>
        <p className="text-2xl text-gray-700 mb-2">Aciertos: <span className="text-green-600 font-bold">{correct}</span></p>
        <p className="text-2xl text-gray-700 mb-2">Errores: <span className="text-red-600 font-bold">{incorrect}</span></p>
        <p className="text-3xl text-gray-900 font-extrabold mt-4">
          ¡Lograste un <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-600">{percentage}%</span> de aciertos!
        </p>
        <motion.button
          onClick={onPlayAgain}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-xl font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ¡Jugar de Nuevo!
        </motion.button>
      </motion.div>
    );
  };

  const HistoryScreen = ({ history, onBack }) => {
    return (
      <motion.div
        className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Historial de Jugadores</h2>
        {history.length === 0 ? (
          <p className="text-gray-600">Aún no hay resultados. ¡Sé el primero en jugar!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Jugador</th>
                  <th className="py-3 px-6 text-center">Aciertos</th>
                  <th className="py-3 px-6 text-center">Errores</th>
                  <th className="py-3 px-6 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {history.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{entry.playerName}</td>
                    <td className="py-3 px-6 text-center">{entry.correct}</td>
                    <td className="py-3 px-6 text-center">{entry.incorrect}</td>
                    <td className="py-3 px-6 text-center">{entry.correct + entry.incorrect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <motion.button
          onClick={onBack}
          className="mt-8 px-6 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-700 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Volver
        </motion.button>
      </motion.div>
    );
  };

  const Footer = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="absolute bottom-3 left-0 right-0 text-white text-xs font-medium flex items-center justify-end px-4"
    >
      <span>&copy;</span>
      <span>Developed by Branium Code - Brayan Niño</span>
    </motion.div>
  );

  const handleSaveResult = ({ playerName, correct, incorrect }) => {
    setPlayerHistory(prevHistory => {
      const newHistory = [{ playerName, correct, incorrect }, ...prevHistory];
      const limitedHistory = newHistory.slice(0, 10); // Limitar a los últimos 10
      localStorage.setItem('results_history', JSON.stringify(limitedHistory));
      return limitedHistory;
    });
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 flex items-center justify-center p-4 relative overflow-hidden">
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, pointerEvents: "none" }}>
        <Fireworks
          onInit={({ conductor }) => {
            fireworksRef.current = conductor;
          }}
        />
      </div>
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
          <img
            src="/icons/icon.png" // Ruta a tu logo en public/icons
            alt="Logo MateMentes"
            className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
          />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700">
              MateMentes
            </span>
          </h1>
        </div>
          <p className="text-xl text-white mt-2 drop-shadow">¡Aprende y diviértete con los números!</p>
        </motion.div>

        {playerName && currentStep !== 'enterName' && currentStep !== 'showHistory' && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-md text-gray-800 font-bold text-lg"
          >
            {playerName}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 'enterName' && (
            <motion.div
              key="enterName"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <PlayerNameInput onSubmit={handleNameSubmit} onShowHistory={() => setCurrentStep('showHistory')} />
            </motion.div>
          )}

          {currentStep === 'showHistory' && (
            <motion.div
              key="showHistory"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <HistoryScreen history={playerHistory} onBack={() => setCurrentStep('enterName')} />
            </motion.div>
          )}

          {currentStep === 'selectOverallDifficulty' && (
            <motion.div
              key="overallDifficultySelector"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <OverallDifficultySelector onSelectDifficulty={handleSelectOverallDifficulty} />
              {playerName && (
                <motion.div
                  className="mt-8 flex items-center justify-between w-full max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.button
                    onClick={handleGoBack}
                    className="px-6 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-700 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Volver
                  </motion.button>

                  <div className="text-gray-800 font-bold text-sm bg-white/70 backdrop-blur-md rounded-full px-4 py-2 shadow-md">
                    {playerName}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'selectOperation' && (
            <motion.div
              key="operationSelector"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <OperationSelector onSelectOperation={handleSelectOperation} />
              {playerName && (
                <motion.div
                  className="mt-8 flex items-center justify-between w-full max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.button
                    onClick={handleGoBack}
                    className="px-6 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-700 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Volver
                  </motion.button>

                  <div className="text-gray-800 font-bold text-sm bg-white/70 backdrop-blur-md rounded-full px-4 py-2 shadow-md">
                    {playerName}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'selectDigitsDifficulty' && (
            <motion.div
              key="digitsDifficultySelector"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <DifficultySelector
                onSelectDifficulty={handleSelectDigitsDifficulty}
                operation={selectedOperation}
              />
              {playerName && (
                <motion.div
                  className="mt-8 flex items-center justify-between w-full max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.button
                    onClick={handleGoBack}
                    className="px-6 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-700 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Volver
                  </motion.button>

                  <div className="text-gray-800 font-bold text-sm bg-white/70 backdrop-blur-md rounded-full px-4 py-2 shadow-md">
                    {playerName}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'solveProblem' && currentProblem && (
            <motion.div
              key="mathProblem"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <MathProblem problem={currentProblem} onAnswer={handleAnswer} setIsAnswer={setIsAnswer} isAnswer={isAnswer} />
              <p className="text-white text-xl font-bold mt-4">
                Ejercicio {problemCount + 1} de {MAX_PROBLEMS}
              </p>
              {playerName && (
                <motion.div
                  className="mt-8 flex items-center justify-between w-full max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.button
                    onClick={handleGoBack}
                    className="px-6 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-700 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Volver
                  </motion.button>

                  <div className="text-gray-800 font-bold text-sm bg-white/70 backdrop-blur-md rounded-full px-4 py-2 shadow-md">
                    {playerName}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 'showResults' && (
            <motion.div
              key="resultsScreen"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsScreen
                playerName={playerName}
                correct={correctAnswers}
                incorrect={incorrectAnswers}
                onPlayAgain={resetGame}
                onSaveResult={handleSaveResult}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default App;
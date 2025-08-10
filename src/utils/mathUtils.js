export const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getNumberRange = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return { min: 1000, max: 9999 }; // Miles
    case 'medium':
      return { min: 10000, max: 99999 }; // Decenas de miles
    case 'hard':
      return { min: 100000, max: 999999 }; // Centenas de miles
    default:
      return { min: 10000, max: 99999 }; // Por defecto, medio
  }
};

export const generateAdditionProblem = (difficulty) => {
  const range = getNumberRange(difficulty);
  const num1 = generateRandomNumber(range.min, range.max);
  // Para num2, permitimos que tenga menos dígitos pero que sea un número significativo
  const num2 = generateRandomNumber(Math.floor(range.min / 10), range.max);
  const answer = num1 + num2;
  return { num1, num2, operation: '+', answer };
};

export const generateSubtractionProblem = (difficulty) => {
  const range = getNumberRange(difficulty);
  let num1, num2, answer;
  do {
    num1 = generateRandomNumber(range.min, range.max);
    // num2 puede tener menos dígitos que num1, pero debe ser menor que num1
    num2 = generateRandomNumber(Math.floor(range.min / 10), num1 - 1); 
    answer = num1 - num2;
  } while (answer < 0); // Asegura que la respuesta sea positiva
  return { num1, num2, operation: '-', answer };
};

export const generateMultiplicationProblem = (digits, difficulty) => {
  const maxMultiplier = Math.pow(10, digits) - 1;
  const minMultiplier = Math.pow(10, digits - 1);
  const range = getNumberRange(difficulty);
  const num1 = generateRandomNumber(range.min, range.max); // Numerador según dificultad
  const num2 = generateRandomNumber(minMultiplier, maxMultiplier); // Denominador con las cifras seleccionadas
  const answer = num1 * num2;
  return { num1, num2, operation: 'x', answer };
};

export const generateDivisionProblem = (digits, difficulty) => {
  const maxDivisor = Math.pow(10, digits) - 1;
  const minDivisor = Math.pow(10, digits - 1);
  let num1, num2, answer, remainder;
  let attempts = 0;
  const maxAttempts = 1000; // Limitar intentos para evitar bucles infinitos
  const range = getNumberRange(difficulty);

  do {
    num2 = generateRandomNumber(minDivisor, maxDivisor);
     // Divisor con las cifras seleccionadas
    // Asegurar que el cociente sea un número razonable para niños
    const maxQuotient = Math.floor(range.max / num2);
    const minQuotient = Math.max(10, Math.floor(range.min / num2));

    if (maxQuotient <= minQuotient) continue;

    answer = generateRandomNumber(minQuotient, maxQuotient);
    num1 = num2 * answer; // Dividendo sin residuo inicialmente

    // Opción: permitir residuo aleatorio
    if (Math.random() > 0.5) {
      remainder = generateRandomNumber(1, num2 - 1);
      num1 += remainder;
    } else {
      remainder = 0;
    }

    attempts++;
  } while ((num1 < range.min || num1 > range.max) && attempts < maxAttempts); // Dividendo según dificultad

  if (attempts >= maxAttempts) {
      // Si no se encuentra un número en el rango, reiniciar o manejar el error
      // Para este caso, simplemente generamos uno simple si se excede el límite
      num1 = range.min * 2;
      num2 = 10;
      answer = Math.floor(num1 / num2);
      remainder = num1 % num2;
    }

  return { num1, num2, operation: '/', answer, remainder };
};

export const generateOptions = (correctAnswer) => {
  const options = new Set();
  options.add(correctAnswer);

  while (options.size < 4) {
    let deviation = generateRandomNumber(-Math.max(10, Math.floor(correctAnswer * 0.1)), Math.max(10, Math.floor(correctAnswer * 0.1)));
    if (deviation === 0) deviation = 1; // Evitar 0
    let newOption = correctAnswer + deviation;
    if (newOption < 0) newOption = correctAnswer + Math.abs(deviation); // Evitar numeros negativos
    options.add(newOption);
  }

  // Convertimos el Set en array
  const optionsArray = Array.from(options);

  // Mezclamos aleatoriamente con el algoritmo de Fisher–Yates
  for (let i = optionsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
  }

  return optionsArray;

  //return Array.from(options).sort(() => Math.random() - 0.5);
};

export const getStepByStep = (num1, num2, operation) => {
  let steps = [];
  switch (operation) {
    case '+':
      steps.push(`Para sumar ${num1} y ${num2}:`);
      steps.push(`  ${num1}`);
      steps.push(`+ ${num2}`);
      steps.push(`------------------`);
      steps.push(`  ${num1 + num2}`);
      break;
    case '-':
      steps.push(`Para restar ${num1} y ${num2}:`);
      steps.push(`  ${num1}`);
      steps.push(`- ${num2}`);
      steps.push(`------------------`);
      steps.push(`  ${num1 - num2}`);
      break;
    case 'x':
      steps.push(`Para multiplicar ${num1} por ${num2}:`);
      steps.push(`  ${num1}`);
      steps.push(`x ${num2}`);
      steps.push(`------------------`);
      steps.push(`  ${num1 * num2}`);
      break;
    case '/':
      const quotient = Math.floor(num1 / num2);
      const remainder = num1 % num2;
      steps.push(`Para dividir ${num1} entre ${num2}:`);
      steps.push(`  ${num1} ÷ ${num2}`);
      steps.push(`El cociente es ${quotient}.`);
      if (remainder > 0) {
        steps.push(`El residuo es ${remainder}.`);
      } else {
        steps.push(`No hay residuo.`);
      }
      steps.push(`Esto significa que ${num2} cabe ${quotient} veces en ${num1}.`);
      break;
    default:
      steps.push("Operación no reconocida.");
  }
  return steps;
};
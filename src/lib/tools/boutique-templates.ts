/**
 * Pre-built HTML templates for boutique creative tools
 * These are instant-load templates that feel like Noah's superpowers
 */

export const BOUTIQUE_TEMPLATES = {
  /**
   * Scientific Calculator with trigonometric functions
   */
  scientificCalculator(theme: string = 'dark', features?: string[]): string {
    const bgColor = theme === 'dark' ? '#1a1a2e' : '#f0f0f0';
    const textColor = theme === 'dark' ? '#eee' : '#333';
    const btnBg = theme === 'dark' ? '#16213e' : '#fff';
    const accentColor = theme === 'dark' ? '#0f3460' : '#4a90e2';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scientific Calculator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, ${bgColor} 0%, ${accentColor} 100%);
    }
    .calculator {
      background: ${btnBg};
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 100%;
    }
    .display {
      background: ${bgColor};
      color: ${textColor};
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 16px;
      text-align: right;
      font-size: 2em;
      font-weight: 300;
      min-height: 70px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .buttons {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    button {
      padding: 20px;
      font-size: 1.2em;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: ${accentColor};
      color: ${textColor};
      font-weight: 500;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    button:active {
      transform: translateY(0);
    }
    .operator {
      background: #e67e22;
      color: white;
    }
    .function {
      background: #9b59b6;
      color: white;
      font-size: 0.9em;
    }
    .equals {
      background: #27ae60;
      color: white;
      grid-column: span 2;
    }
    .clear {
      background: #e74c3c;
      color: white;
    }
  </style>
</head>
<body>
  <div class="calculator">
    <div class="display" id="display">0</div>
    <div class="buttons">
      <button class="function" onclick="calc.addFunction('sin')">sin</button>
      <button class="function" onclick="calc.addFunction('cos')">cos</button>
      <button class="function" onclick="calc.addFunction('tan')">tan</button>
      <button class="function" onclick="calc.addFunction('log')">log</button>
      <button class="clear" onclick="calc.clear()">C</button>
      
      <button class="function" onclick="calc.addFunction('sqrt')">√</button>
      <button onclick="calc.addDigit('7')">7</button>
      <button onclick="calc.addDigit('8')">8</button>
      <button onclick="calc.addDigit('9')">9</button>
      <button class="operator" onclick="calc.addOperator('/')">/</button>
      
      <button class="function" onclick="calc.addFunction('pow')">x²</button>
      <button onclick="calc.addDigit('4')">4</button>
      <button onclick="calc.addDigit('5')">5</button>
      <button onclick="calc.addDigit('6')">6</button>
      <button class="operator" onclick="calc.addOperator('*')">×</button>
      
      <button class="function" onclick="calc.addConstant('pi')">π</button>
      <button onclick="calc.addDigit('1')">1</button>
      <button onclick="calc.addDigit('2')">2</button>
      <button onclick="calc.addDigit('3')">3</button>
      <button class="operator" onclick="calc.addOperator('-')">-</button>
      
      <button class="function" onclick="calc.addConstant('e')">e</button>
      <button onclick="calc.addDigit('0')">0</button>
      <button onclick="calc.addDigit('.')">.</button>
      <button class="equals" onclick="calc.calculate()">=</button>
      <button class="operator" onclick="calc.addOperator('+')">+</button>
    </div>
  </div>

  <script>
    const calc = {
      display: document.getElementById('display'),
      currentValue: '0',
      operation: null,
      previousValue: null,
      
      updateDisplay() {
        this.display.textContent = this.currentValue;
      },
      
      addDigit(digit) {
        if (this.currentValue === '0' || this.currentValue === 'Error') {
          this.currentValue = digit;
        } else {
          this.currentValue += digit;
        }
        this.updateDisplay();
      },
      
      addOperator(op) {
        if (this.previousValue !== null && this.operation) {
          this.calculate();
        }
        this.previousValue = parseFloat(this.currentValue);
        this.operation = op;
        this.currentValue = '0';
      },
      
      addFunction(fn) {
        try {
          const value = parseFloat(this.currentValue);
          let result;
          switch(fn) {
            case 'sin': result = Math.sin(value * Math.PI / 180); break;
            case 'cos': result = Math.cos(value * Math.PI / 180); break;
            case 'tan': result = Math.tan(value * Math.PI / 180); break;
            case 'log': result = Math.log10(value); break;
            case 'sqrt': result = Math.sqrt(value); break;
            case 'pow': result = Math.pow(value, 2); break;
          }
          this.currentValue = result.toString();
          this.updateDisplay();
        } catch (e) {
          this.currentValue = 'Error';
          this.updateDisplay();
        }
      },
      
      addConstant(constant) {
        this.currentValue = constant === 'pi' ? Math.PI.toString() : Math.E.toString();
        this.updateDisplay();
      },
      
      calculate() {
        if (this.previousValue === null || !this.operation) return;
        
        try {
          const current = parseFloat(this.currentValue);
          let result;
          
          switch(this.operation) {
            case '+': result = this.previousValue + current; break;
            case '-': result = this.previousValue - current; break;
            case '*': result = this.previousValue * current; break;
            case '/': result = this.previousValue / current; break;
          }
          
          this.currentValue = result.toString();
          this.operation = null;
          this.previousValue = null;
          this.updateDisplay();
        } catch (e) {
          this.currentValue = 'Error';
          this.updateDisplay();
        }
      },
      
      clear() {
        this.currentValue = '0';
        this.operation = null;
        this.previousValue = null;
        this.updateDisplay();
      }
    };
  </script>
</body>
</html>`;
  },

  /**
   * Pomodoro Timer with work/break intervals
   */
  pomodoroTimer(workMinutes: number = 25, breakMinutes: number = 5): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pomodoro Timer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .timer-container {
      background: white;
      padding: 48px;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    h1 {
      color: #667eea;
      margin-bottom: 32px;
      font-size: 2.5em;
    }
    .timer-display {
      font-size: 6em;
      font-weight: 300;
      color: #333;
      margin: 32px 0;
      font-variant-numeric: tabular-nums;
    }
    .phase {
      font-size: 1.5em;
      color: #666;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .phase.work { color: #e74c3c; }
    .phase.break { color: #27ae60; }
    .controls {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }
    button {
      padding: 16px 32px;
      font-size: 1.2em;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .start-btn {
      background: #27ae60;
      color: white;
    }
    .pause-btn {
      background: #f39c12;
      color: white;
    }
    .reset-btn {
      background: #e74c3c;
      color: white;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .stats {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 2px solid #eee;
      display: flex;
      justify-content: space-around;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 2em;
      font-weight: 600;
      color: #667eea;
    }
    .stat-label {
      font-size: 0.9em;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="timer-container">
    <h1>🍅 Pomodoro Timer</h1>
    <div class="phase" id="phase">Work Time</div>
    <div class="timer-display" id="display">25:00</div>
    <div class="controls">
      <button class="start-btn" id="startBtn" onclick="timer.start()">Start</button>
      <button class="pause-btn" id="pauseBtn" onclick="timer.pause()" disabled>Pause</button>
      <button class="reset-btn" onclick="timer.reset()">Reset</button>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="completedPomodoros">0</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="totalMinutes">0</div>
        <div class="stat-label">Total Minutes</div>
      </div>
    </div>
  </div>

  <script>
    const timer = {
      workMinutes: ${workMinutes},
      breakMinutes: ${breakMinutes},
      timeLeft: ${workMinutes} * 60,
      isRunning: false,
      isWorkPhase: true,
      completedPomodoros: 0,
      totalMinutes: 0,
      intervalId: null,
      
      updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('display').textContent = 
          \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        
        const phase = document.getElementById('phase');
        phase.textContent = this.isWorkPhase ? '🔥 Work Time' : '☕ Break Time';
        phase.className = 'phase ' + (this.isWorkPhase ? 'work' : 'break');
      },
      
      start() {
        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.intervalId = setInterval(() => {
          this.timeLeft--;
          this.updateDisplay();
          
          if (this.timeLeft === 0) {
            this.completePhase();
          }
        }, 1000);
      },
      
      pause() {
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        clearInterval(this.intervalId);
      },
      
      reset() {
        this.pause();
        this.isWorkPhase = true;
        this.timeLeft = this.workMinutes * 60;
        this.updateDisplay();
      },
      
      completePhase() {
        clearInterval(this.intervalId);
        
        if (this.isWorkPhase) {
          this.completedPomodoros++;
          this.totalMinutes += this.workMinutes;
          document.getElementById('completedPomodoros').textContent = this.completedPomodoros;
          document.getElementById('totalMinutes').textContent = this.totalMinutes;
          
          this.playSound();
          alert('🎉 Work session complete! Time for a break!');
          this.isWorkPhase = false;
          this.timeLeft = this.breakMinutes * 60;
        } else {
          this.totalMinutes += this.breakMinutes;
          document.getElementById('totalMinutes').textContent = this.totalMinutes;
          
          this.playSound();
          alert('Break complete! Ready for another work session?');
          this.isWorkPhase = true;
          this.timeLeft = this.workMinutes * 60;
        }
        
        this.pause();
        this.updateDisplay();
      },
      
      playSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    };
    
    timer.updateDisplay();
  </script>
</body>
</html>`;
  },

  /**
   * Unit Converter for various measurement types
   */
  unitConverter(categories?: string[]): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unit Converter</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      padding: 20px;
    }
    .converter-container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #43e97b;
      margin-bottom: 32px;
      text-align: center;
      font-size: 2.5em;
    }
    .category-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .category-btn {
      padding: 12px 24px;
      border: 2px solid #43e97b;
      background: white;
      color: #43e97b;
      border-radius: 24px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    .category-btn.active {
      background: #43e97b;
      color: white;
    }
    .converter-section {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    input[type="number"] {
      padding: 16px;
      font-size: 1.5em;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      text-align: center;
      transition: border-color 0.3s;
    }
    input[type="number"]:focus {
      outline: none;
      border-color: #43e97b;
    }
    select {
      padding: 12px;
      font-size: 1em;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s;
    }
    select:focus {
      outline: none;
      border-color: #43e97b;
    }
    .swap-btn {
      padding: 16px;
      background: #43e97b;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.5em;
      transition: all 0.3s;
      width: 56px;
      height: 56px;
    }
    .swap-btn:hover {
      transform: rotate(180deg);
      background: #38f9d7;
    }
    .result {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      font-size: 1.2em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="converter-container">
    <h1>📏 Unit Converter</h1>
    
    <div class="category-selector">
      <button class="category-btn active" onclick="converter.setCategory('length')">Length</button>
      <button class="category-btn" onclick="converter.setCategory('weight')">Weight</button>
      <button class="category-btn" onclick="converter.setCategory('temperature')">Temperature</button>
      <button class="category-btn" onclick="converter.setCategory('volume')">Volume</button>
      <button class="category-btn" onclick="converter.setCategory('speed')">Speed</button>
    </div>
    
    <div class="converter-section">
      <div class="input-group">
        <input type="number" id="fromValue" value="1" oninput="converter.convert()">
        <select id="fromUnit" onchange="converter.convert()"></select>
      </div>
      
      <button class="swap-btn" onclick="converter.swap()">⇄</button>
      
      <div class="input-group">
        <input type="number" id="toValue" value="0" readonly>
        <select id="toUnit" onchange="converter.convert()"></select>
      </div>
    </div>
    
    <div class="result" id="result">Enter a value to convert</div>
  </div>

  <script>
    const converter = {
      currentCategory: 'length',
      
      units: {
        length: {
          meter: 1,
          kilometer: 0.001,
          centimeter: 100,
          millimeter: 1000,
          mile: 0.000621371,
          yard: 1.09361,
          foot: 3.28084,
          inch: 39.3701
        },
        weight: {
          kilogram: 1,
          gram: 1000,
          milligram: 1000000,
          ton: 0.001,
          pound: 2.20462,
          ounce: 35.274
        },
        temperature: {
          celsius: { to: (v, unit) => unit === 'fahrenheit' ? (v * 9/5) + 32 : v + 273.15, from: (v) => v },
          fahrenheit: { to: (v, unit) => unit === 'celsius' ? (v - 32) * 5/9 : ((v - 32) * 5/9) + 273.15, from: (v) => v },
          kelvin: { to: (v, unit) => unit === 'celsius' ? v - 273.15 : (v - 273.15) * 9/5 + 32, from: (v) => v }
        },
        volume: {
          liter: 1,
          milliliter: 1000,
          gallon: 0.264172,
          quart: 1.05669,
          pint: 2.11338,
          cup: 4.22675,
          fluid_ounce: 33.814
        },
        speed: {
          'meters/second': 1,
          'kilometers/hour': 3.6,
          'miles/hour': 2.23694,
          'feet/second': 3.28084,
          knots: 1.94384
        }
      },
      
      setCategory(category) {
        this.currentCategory = category;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.populateUnits();
        this.convert();
      },
      
      populateUnits() {
        const fromSelect = document.getElementById('fromUnit');
        const toSelect = document.getElementById('toUnit');
        
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        const units = Object.keys(this.units[this.currentCategory]);
        units.forEach(unit => {
          const option1 = new Option(unit.replace('_', ' '), unit);
          const option2 = new Option(unit.replace('_', ' '), unit);
          fromSelect.add(option1);
          toSelect.add(option2);
        });
        
        if (units.length > 1) {
          toSelect.selectedIndex = 1;
        }
      },
      
      convert() {
        const fromValue = parseFloat(document.getElementById('fromValue').value) || 0;
        const fromUnit = document.getElementById('fromUnit').value;
        const toUnit = document.getElementById('toUnit').value;
        
        let result;
        
        if (this.currentCategory === 'temperature') {
          const tempUnits = this.units.temperature;
          if (fromUnit === toUnit) {
            result = fromValue;
          } else {
            result = tempUnits[fromUnit].to(fromValue, toUnit);
          }
        } else {
          const baseValue = fromValue / this.units[this.currentCategory][fromUnit];
          result = baseValue * this.units[this.currentCategory][toUnit];
        }
        
        document.getElementById('toValue').value = result.toFixed(6);
        document.getElementById('result').textContent = 
          \`\${fromValue} \${fromUnit.replace('_', ' ')} = \${result.toFixed(6)} \${toUnit.replace('_', ' ')}\`;
      },
      
      swap() {
        const fromValue = document.getElementById('fromValue').value;
        const toValue = document.getElementById('toValue').value;
        const fromUnit = document.getElementById('fromUnit').value;
        const toUnit = document.getElementById('toUnit').value;
        
        document.getElementById('fromValue').value = toValue;
        document.getElementById('toValue').value = fromValue;
        
        document.getElementById('fromUnit').value = toUnit;
        document.getElementById('toUnit').value = fromUnit;
        
        this.convert();
      }
    };
    
    converter.populateUnits();
    converter.convert();
  </script>
</body>
</html>`;
  }
};

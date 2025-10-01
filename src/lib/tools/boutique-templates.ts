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
  },

  /**
   * Assumption Breaker - Challenge assumptions about any problem
   * Designed for skeptics to think differently
   */
  assumptionBreaker(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assumption Breaker</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
    .subtitle {
      color: #94a3b8;
      margin-bottom: 32px;
      font-size: 1.1em;
    }
    .input-section {
      margin-bottom: 32px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #cbd5e1;
      font-weight: 500;
    }
    textarea {
      width: 100%;
      min-height: 120px;
      padding: 16px;
      background: #1e293b;
      border: 2px solid #334155;
      border-radius: 12px;
      color: #e2e8f0;
      font-size: 1em;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.2s;
    }
    textarea:focus {
      outline: none;
      border-color: #a78bfa;
    }
    textarea::placeholder {
      color: #64748b;
    }
    .button-group {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn-primary {
      background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(167, 139, 250, 0.4);
    }
    .btn-secondary {
      background: #334155;
      color: #e2e8f0;
    }
    .btn-secondary:hover {
      background: #475569;
    }
    .btn-save {
      background: #059669;
      color: white;
    }
    .btn-save:hover {
      background: #047857;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .examples {
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(51, 65, 85, 0.5);
      border-radius: 8px;
      border-left: 4px solid #a78bfa;
    }
    .examples h3 {
      font-size: 0.9em;
      color: #cbd5e1;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .example-btn {
      display: inline-block;
      padding: 6px 12px;
      margin: 4px 4px 4px 0;
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 6px;
      color: #94a3b8;
      font-size: 0.9em;
      cursor: pointer;
      transition: all 0.2s;
    }
    .example-btn:hover {
      background: #334155;
      color: #e2e8f0;
      border-color: #64748b;
    }
    #assumptions-container {
      display: none;
    }
    .assumptions-list {
      margin-bottom: 32px;
    }
    .assumption-card {
      background: #1e293b;
      border: 2px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      transition: all 0.3s;
    }
    .assumption-card.disabled {
      opacity: 0.5;
      border-color: #475569;
    }
    .assumption-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .assumption-text {
      flex: 1;
      font-size: 1.1em;
      color: #e2e8f0;
      font-weight: 500;
    }
    .assumption-card.disabled .assumption-text {
      text-decoration: line-through;
      color: #64748b;
    }
    .toggle-switch {
      position: relative;
      width: 52px;
      height: 28px;
      flex-shrink: 0;
      margin-left: 16px;
    }
    .toggle-input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #334155;
      border-radius: 28px;
      transition: 0.3s;
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      border-radius: 50%;
      transition: 0.3s;
    }
    .toggle-input:checked + .toggle-slider {
      background: linear-gradient(135deg, #a78bfa 0%, #ec4899 100%);
    }
    .toggle-input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }
    .reframe-section {
      background: rgba(167, 139, 250, 0.1);
      border: 2px solid #a78bfa;
      border-radius: 12px;
      padding: 24px;
      margin-top: 24px;
    }
    .reframe-section h2 {
      color: #a78bfa;
      margin-bottom: 16px;
      font-size: 1.3em;
    }
    .reframe-text {
      color: #cbd5e1;
      font-size: 1.1em;
      line-height: 1.8;
      font-style: italic;
    }
    .empty-state {
      text-align: center;
      color: #64748b;
      font-style: italic;
      padding: 20px;
    }
    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
      h1 {
        font-size: 2em;
      }
      .button-group {
        flex-direction: column;
      }
      button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Assumption Breaker</h1>
    <p class="subtitle">Challenge your assumptions. Think differently.</p>

    <div class="examples">
      <h3>Try an example:</h3>
      <span class="example-btn" onclick="loadExample('career')">Career Change</span>
      <span class="example-btn" onclick="loadExample('product')">Product Launch</span>
      <span class="example-btn" onclick="loadExample('relationship')">Relationship Issue</span>
      <span class="example-btn" onclick="loadExample('business')">Business Decision</span>
    </div>

    <div class="input-section">
      <label for="problem">Describe your problem or decision:</label>
      <textarea 
        id="problem" 
        placeholder="Example: I'm stuck in my career and don't know if I should stay or change paths..."
      ></textarea>
    </div>

    <div class="button-group">
      <button class="btn-primary" onclick="generateAssumptions()">Generate Assumptions</button>
      <button class="btn-secondary" onclick="resetTool()">Reset</button>
      <button class="btn-save" onclick="saveSession()" id="saveBtn" disabled>Save Progress</button>
    </div>

    <div id="assumptions-container">
      <div class="assumptions-list" id="assumptions-list"></div>
      
      <div class="reframe-section">
        <h2>🎯 Reframed Perspective</h2>
        <div class="reframe-text" id="reframe-text">
          <div class="empty-state">Toggle assumptions off to see your problem reframed</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const exampleProblems = {
      career: {
        problem: "I'm stuck in my career. I want to change paths but don't know where to start or if it's the right move.",
        assumptions: [
          "You need to know exactly what you want before making a change",
          "Money should be the top priority in career decisions",
          "You need more education or credentials to switch careers",
          "Starting over means losing all your progress",
          "Your next step needs to be a permanent decision",
          "You have to figure this out alone"
        ]
      },
      product: {
        problem: "We're launching a new product but worried it won't meet user expectations or stand out in the market.",
        assumptions: [
          "Users already know what they want from this product",
          "More features automatically means a better product",
          "The product needs to be perfect before launch",
          "We need to compete on the same terms as competitors",
          "Early negative feedback means the product failed",
          "Marketing is separate from product development"
        ]
      },
      relationship: {
        problem: "My relationship is struggling and I'm not sure if we can fix the communication issues we're having.",
        assumptions: [
          "The problem is primarily the other person's fault",
          "More communication will automatically solve things",
          "Good relationships should feel easy and natural",
          "Conflict means the relationship is fundamentally broken",
          "We should both want the same things in the same way",
          "Counseling is only for relationships in crisis"
        ]
      },
      business: {
        problem: "Should I expand my business now or wait? I'm worried about timing and taking on too much risk.",
        assumptions: [
          "There's a 'right' time that you can identify in advance",
          "Expansion means taking on massive, all-or-nothing risk",
          "You need to feel completely confident before acting",
          "Past success guarantees future results with expansion",
          "Growing too slowly means you'll lose competitive advantage",
          "You need external funding to expand meaningfully"
        ]
      }
    };

    let currentAssumptions = [];
    let currentProblem = '';

    function loadExample(type) {
      const example = exampleProblems[type];
      document.getElementById('problem').value = example.problem;
    }

    function generateAssumptions() {
      const problemText = document.getElementById('problem').value.trim();
      if (!problemText) {
        alert('Please describe your problem first.');
        return;
      }

      currentProblem = problemText;
      
      // Intelligent assumption generation based on problem content
      currentAssumptions = generateSmartAssumptions(problemText);
      
      displayAssumptions();
      updateReframe();
      
      document.getElementById('assumptions-container').style.display = 'block';
      document.getElementById('saveBtn').disabled = false;
      
      // Smooth scroll to assumptions
      document.getElementById('assumptions-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function generateSmartAssumptions(problem) {
      const lower = problem.toLowerCase();
      let assumptions = [];
      
      // Career-related
      if (lower.match(/career|job|work|profession|employment/)) {
        assumptions.push(
          { text: "You need to know exactly what you want before taking action", enabled: true },
          { text: "Your past experience limits your future options", enabled: true },
          { text: "Financial security must come before personal fulfillment", enabled: true },
          { text: "Starting over means losing all your progress", enabled: true },
          { text: "You need more credentials or education to change paths", enabled: true }
        );
      }
      // Product/Business
      else if (lower.match(/product|launch|business|startup|company|market/)) {
        assumptions.push(
          { text: "Users know what they want and can articulate it", enabled: true },
          { text: "More features equal more value", enabled: true },
          { text: "You need to be perfect before launching", enabled: true },
          { text: "Success means competing directly with market leaders", enabled: true },
          { text: "Early criticism indicates fundamental failure", enabled: true },
          { text: "Growth must be rapid to be meaningful", enabled: true }
        );
      }
      // Relationships
      else if (lower.match(/relationship|partner|marriage|dating|love|communication/)) {
        assumptions.push(
          { text: "The problem is primarily the other person", enabled: true },
          { text: "More talking will automatically solve issues", enabled: true },
          { text: "Healthy relationships should feel easy and natural", enabled: true },
          { text: "Conflict means something is fundamentally broken", enabled: true },
          { text: "You should both want the same things at the same time", enabled: true }
        );
      }
      // Decision-making
      else if (lower.match(/decision|choice|decide|should i|whether to/)) {
        assumptions.push(
          { text: "There's one objectively 'right' choice to discover", enabled: true },
          { text: "You need to feel certain before acting", enabled: true },
          { text: "Making the wrong choice will have permanent consequences", enabled: true },
          { text: "More analysis will make the answer clearer", enabled: true },
          { text: "You should trust your gut feeling", enabled: true }
        );
      }
      // Time/Timing
      else if (lower.match(/time|timing|when|schedule|deadline|late|early/)) {
        assumptions.push(
          { text: "Time is the primary constraint you're facing", enabled: true },
          { text: "There's a 'right time' you can identify in advance", enabled: true },
          { text: "Moving faster will improve outcomes", enabled: true },
          { text: "You're already too late to make a difference", enabled: true },
          { text: "Timing is mostly outside your control", enabled: true }
        );
      }
      // Generic fallback
      else {
        assumptions.push(
          { text: "You already understand the core of this problem", enabled: true },
          { text: "The obvious solution is the best one", enabled: true },
          { text: "Your initial emotional reaction is the most accurate guide", enabled: true },
          { text: "Past experiences directly predict future outcomes", enabled: true },
          { text: "You need to choose between extreme opposing options", enabled: true },
          { text: "Someone else has figured this out and you just need to find them", enabled: true }
        );
      }
      
      return assumptions;
    }

    function displayAssumptions() {
      const container = document.getElementById('assumptions-list');
      container.innerHTML = '';
      
      currentAssumptions.forEach((assumption, index) => {
        const card = document.createElement('div');
        card.className = 'assumption-card' + (assumption.enabled ? '' : ' disabled');
        card.id = \`assumption-\${index}\`;
        
        card.innerHTML = \`
          <div class="assumption-header">
            <div class="assumption-text">\${assumption.text}</div>
            <label class="toggle-switch">
              <input type="checkbox" class="toggle-input" 
                     \${assumption.enabled ? 'checked' : ''} 
                     onchange="toggleAssumption(\${index})">
              <span class="toggle-slider"></span>
            </label>
          </div>
        \`;
        
        container.appendChild(card);
      });
    }

    function toggleAssumption(index) {
      currentAssumptions[index].enabled = !currentAssumptions[index].enabled;
      
      const card = document.getElementById(\`assumption-\${index}\`);
      if (currentAssumptions[index].enabled) {
        card.classList.remove('disabled');
      } else {
        card.classList.add('disabled');
      }
      
      updateReframe();
    }

    function updateReframe() {
      const disabledAssumptions = currentAssumptions.filter(a => !a.enabled);
      const reframeEl = document.getElementById('reframe-text');
      
      if (disabledAssumptions.length === 0) {
        reframeEl.innerHTML = '<div class="empty-state">Toggle assumptions off to see your problem reframed</div>';
        return;
      }
      
      const reframeQuestions = disabledAssumptions.map(a => {
        const withoutPrefix = a.text.replace(/^(You need to |Your |You should |You |The |There's |Someone )/i, '');
        return \`• What if <strong>\${withoutPrefix.toLowerCase()}</strong> wasn't true?\`;
      }).join('<br>');
      
      let reframeText = \`
        <p style="margin-bottom: 16px;">Here's your problem viewed differently:</p>
        <p style="margin-bottom: 16px;"><strong>Original:</strong> \${currentProblem}</p>
        <p style="margin-bottom: 12px;"><strong>New questions to explore:</strong></p>
        <div style="padding-left: 12px; line-height: 2;">
          \${reframeQuestions}
        </div>
      \`;
      
      if (disabledAssumptions.length >= 3) {
        reframeText += \`
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(167, 139, 250, 0.3); color: #a78bfa;">
            💡 With \${disabledAssumptions.length} assumption(s) removed, you've opened up new solution spaces that weren't visible before.
          </p>
        \`;
      }
      
      reframeEl.innerHTML = reframeText;
    }

    function resetTool() {
      if (confirm('Reset everything and start over?')) {
        document.getElementById('problem').value = '';
        document.getElementById('assumptions-container').style.display = 'none';
        document.getElementById('saveBtn').disabled = true;
        currentAssumptions = [];
        currentProblem = '';
      }
    }

    function saveSession() {
      const sessionData = {
        problem: currentProblem,
        assumptions: currentAssumptions,
        timestamp: new Date().toISOString()
      };
      
      // Try postMessage to Noah's FilesystemBridge
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'NOAH_SAVE_REQUEST',
          payload: {
            filename: 'assumption-breaker-session.json',
            content: JSON.stringify(sessionData, null, 2),
            contentType: 'application/json'
          }
        }, '*');
        
        alert('Save request sent to Noah! Check your file operations panel.');
      } else {
        // Fallback: download as file
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'assumption-breaker-session.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }

    // Listen for load requests
    window.addEventListener('message', (event) => {
      if (event.data.type === 'NOAH_LOAD_RESPONSE') {
        try {
          const sessionData = JSON.parse(event.data.payload.content);
          currentProblem = sessionData.problem;
          currentAssumptions = sessionData.assumptions;
          
          document.getElementById('problem').value = currentProblem;
          displayAssumptions();
          updateReframe();
          document.getElementById('assumptions-container').style.display = 'block';
          document.getElementById('saveBtn').disabled = false;
        } catch (error) {
          alert('Failed to load session: ' + error.message);
        }
      }
    });
  </script>
</body>
</html>`;
  },

  /**
   * Time Telescope - perspective-shifting decision tool
   * Shows decisions across multiple time horizons
   */
  timeTelescope(theme: string = 'dark'): string {
    const bgColor = theme === 'dark' ? '#1a1a2e' : '#f0f0f0';
    const textColor = theme === 'dark' ? '#eee' : '#333';
    const cardBg = theme === 'dark' ? '#16213e' : '#fff';
    const accentColor = theme === 'dark' ? '#0f3460' : '#4a90e2';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Time Telescope - Perspective Shifting Decision Tool</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: ${bgColor};
      color: ${textColor};
      padding: 24px;
      line-height: 1.6;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${accentColor};
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      color: #888;
      font-size: 1.1em;
    }
    
    .decision-input-section {
      background: ${cardBg};
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    
    .decision-input-section h2 {
      margin-bottom: 16px;
      font-size: 1.5em;
    }
    
    #decisionInput {
      width: 100%;
      padding: 16px;
      font-size: 1.1em;
      border: 2px solid ${accentColor};
      border-radius: 8px;
      background: ${bgColor};
      color: ${textColor};
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }
    
    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    
    .btn-primary, .btn-secondary, .btn-save {
      padding: 12px 24px;
      font-size: 1em;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-secondary {
      background: ${accentColor};
      color: white;
    }
    
    .btn-save {
      background: #27ae60;
      color: white;
    }
    
    .btn-primary:hover, .btn-secondary:hover, .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .btn-primary:disabled, .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .example-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    
    .example-btn {
      padding: 8px 16px;
      font-size: 0.9em;
      border: 1px solid ${accentColor};
      border-radius: 6px;
      background: transparent;
      color: ${textColor};
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .example-btn:hover {
      background: ${accentColor};
      color: white;
    }
    
    #timelineSection {
      display: none;
      margin-bottom: 32px;
    }
    
    .timeline-container {
      background: ${cardBg};
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    
    .timeline-controls {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    
    .zoom-btn {
      padding: 8px 16px;
      font-size: 0.9em;
      border: 2px solid ${accentColor};
      border-radius: 6px;
      background: ${bgColor};
      color: ${textColor};
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .zoom-btn.active {
      background: ${accentColor};
      color: white;
      transform: scale(1.05);
    }
    
    .zoom-btn:hover {
      background: ${accentColor};
      color: white;
    }
    
    .timeline-svg-container {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 32px;
    }
    
    svg {
      width: 100%;
      height: 120px;
      min-width: 600px;
    }
    
    .perspective-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 32px;
    }
    
    .perspective-card {
      background: linear-gradient(135deg, ${cardBg} 0%, ${accentColor} 100%);
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      opacity: 0.3;
      transform: scale(0.95);
    }
    
    .perspective-card.active {
      opacity: 1;
      transform: scale(1);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    
    .perspective-card.focused {
      grid-column: 1 / -1;
      opacity: 1;
      transform: scale(1);
    }
    
    .timeframe {
      font-size: 1.8em;
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .insight-label {
      font-size: 0.9em;
      color: #888;
      margin-bottom: 12px;
      font-style: italic;
    }
    
    .perspective-text {
      font-size: 1.1em;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .wisdom-text {
      font-size: 0.95em;
      padding: 12px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      border-left: 3px solid ${accentColor};
    }
    
    @media (max-width: 768px) {
      body { padding: 16px; }
      h1 { font-size: 2em; }
      .perspective-cards {
        grid-template-columns: 1fr;
      }
      .timeline-controls {
        gap: 8px;
      }
      .zoom-btn {
        padding: 6px 12px;
        font-size: 0.85em;
      }
    }
    
    @media print {
      body {
        background: white;
        color: black;
      }
      .timeline-controls, .button-group {
        display: none;
      }
      .perspective-card {
        opacity: 1;
        transform: scale(1);
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔭 Time Telescope</h1>
      <p class="subtitle">View your decision across multiple time horizons</p>
    </header>
    
    <div class="decision-input-section">
      <h2>What decision are you facing?</h2>
      <textarea 
        id="decisionInput" 
        placeholder="Describe the decision you're trying to make..."
      ></textarea>
      
      <div class="example-buttons">
        <button class="example-btn" onclick="loadExample('career')">Should I quit my job?</button>
        <button class="example-btn" onclick="loadExample('move')">Should I move to a new city?</button>
        <button class="example-btn" onclick="loadExample('relationship')">Should I end this relationship?</button>
        <button class="example-btn" onclick="loadExample('startup')">Should I start my own business?</button>
      </div>
      
      <div class="button-group">
        <button class="btn-primary" onclick="generatePerspectives()">View Through Time</button>
        <button class="btn-secondary" onclick="resetTool()">Reset</button>
        <button class="btn-save" onclick="saveDecision()" id="saveBtn" disabled>Save Decision</button>
      </div>
    </div>
    
    <div id="timelineSection">
      <div class="timeline-container">
        <h2 style="text-align: center; margin-bottom: 24px;">Timeline View</h2>
        
        <div class="timeline-controls">
          <button class="zoom-btn active" onclick="focusTimeframe('all')">All Perspectives</button>
          <button class="zoom-btn" onclick="focusTimeframe('day')">1 Day</button>
          <button class="zoom-btn" onclick="focusTimeframe('year')">1 Year</button>
          <button class="zoom-btn" onclick="focusTimeframe('decade')">10 Years</button>
          <button class="zoom-btn" onclick="focusTimeframe('century')">100 Years</button>
        </div>
        
        <div class="timeline-svg-container">
          <svg id="timelineSvg" viewBox="0 0 1000 120">
            <!-- Timeline will be drawn here -->
          </svg>
        </div>
        
        <div class="perspective-cards" id="perspectiveCards">
          <!-- Perspective cards will be generated here -->
        </div>
      </div>
    </div>
  </div>
  
  <script>
    let currentDecision = '';
    let currentPerspectives = [];
    let activeFocus = 'all';
    
    const examples = {
      career: 'Should I quit my job to pursue a different career?',
      move: 'Should I move to a new city for better opportunities?',
      relationship: 'Should I end this relationship that isn\'t working?',
      startup: 'Should I leave my stable job to start my own business?'
    };
    
    function loadExample(type) {
      document.getElementById('decisionInput').value = examples[type];
    }
    
    function generatePerspectives() {
      const decisionText = document.getElementById('decisionInput').value.trim();
      
      if (!decisionText) {
        alert('Please enter a decision first.');
        return;
      }
      
      currentDecision = decisionText;
      currentPerspectives = generateSmartPerspectives(decisionText);
      
      displayTimeline();
      displayPerspectiveCards();
      
      document.getElementById('timelineSection').style.display = 'block';
      document.getElementById('saveBtn').disabled = false;
      
      // Smooth scroll to timeline
      setTimeout(() => {
        document.getElementById('timelineSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    
    function generateSmartPerspectives(decision) {
      const lower = decision.toLowerCase();
      
      // Detect decision type
      let perspectives = [];
      
      if (lower.includes('quit') || lower.includes('job') || lower.includes('career')) {
        perspectives = [
          {
            timeframe: '1 Day',
            key: 'day',
            insight: 'Emotions dominate',
            perspective: 'Immediate relief from current stress, but also immediate panic about finances and identity. Everything feels urgent and overwhelming.',
            wisdom: 'Your emotions are real, but they\'re not the full picture. Give yourself permission to feel without making permanent decisions from temporary states.'
          },
          {
            timeframe: '1 Year',
            key: 'year',
            insight: 'Practical outcomes matter',
            perspective: 'Either you\'ll be grateful you made the leap, or you\'ll have learned valuable lessons about what you really want. The immediate panic will have resolved one way or another.',
            wisdom: 'A year is where consequences become clear. Did this choice move you toward your goals, or did it teach you something important?'
          },
          {
            timeframe: '10 Years',
            key: 'decade',
            insight: 'Character and growth matter',
            perspective: 'This decision becomes a small chapter in your career story. What matters is whether you grew, learned resilience, and moved toward becoming who you want to be.',
            wisdom: 'In a decade, you won\'t remember the anxiety of the decision. You\'ll remember whether you were brave enough to try, and what you learned about yourself.'
          },
          {
            timeframe: '100 Years',
            key: 'century',
            insight: 'Only deep impact matters',
            perspective: 'No one will remember or care about your job change. What might matter is whether you positively influenced people around you during this time.',
            wisdom: 'Your career decisions are invisible at this scale. Your character, kindness, and impact on others are the only things that echo forward.'
          }
        ];
      } else if (lower.includes('move') || lower.includes('city') || lower.includes('relocate')) {
        perspectives = [
          {
            timeframe: '1 Day',
            key: 'day',
            insight: 'Emotions dominate',
            perspective: 'Excitement mixed with fear of the unknown. Leaving feels both thrilling and terrifying. You\'re focused on logistics and goodbyes.',
            wisdom: 'The magnitude of change feels overwhelming right now. That\'s normal. Every big move starts with this feeling.'
          },
          {
            timeframe: '1 Year',
            key: 'year',
            insight: 'Practical outcomes matter',
            perspective: 'You\'ve either built a new life and made new connections, or you\'ve learned that geography wasn\'t the answer you were looking for. Either way, you have clarity.',
            wisdom: 'A year gives you time to build roots or realize you planted in the wrong soil. Both outcomes teach you something valuable.'
          },
          {
            timeframe: '10 Years',
            key: 'decade',
            insight: 'Character and growth matter',
            perspective: 'The city itself matters less than who you became through the experience of choosing, moving, and adapting. Your resilience and adaptability grew.',
            wisdom: 'In a decade, it\'s not where you moved that matters - it\'s how you learned to build a life from scratch that counts.'
          },
          {
            timeframe: '100 Years',
            key: 'century',
            insight: 'Only deep impact matters',
            perspective: 'Your geographic location is meaningless. What might matter is whether you built community, helped others, and lived fully wherever you were.',
            wisdom: 'Cities rise and fall. What endures is how you connected with and supported the people around you.'
          }
        ];
      } else if (lower.includes('relationship') || lower.includes('marriage') || lower.includes('partner')) {
        perspectives = [
          {
            timeframe: '1 Day',
            key: 'day',
            insight: 'Emotions dominate',
            perspective: 'Pain, relief, guilt, freedom - all hitting at once. You\'re questioning everything and imagining worst-case scenarios on both sides.',
            wisdom: 'Relationship decisions feel life-or-death in the moment. Give yourself space to feel without demanding immediate clarity.'
          },
          {
            timeframe: '1 Year',
            key: 'year',
            insight: 'Practical outcomes matter',
            perspective: 'You\'ve either rebuilt the relationship stronger, or you\'ve discovered who you are on your own. The acute pain has faded, replaced by growth.',
            wisdom: 'A year reveals whether you made the right call. Trust yourself to handle whatever consequences unfold.'
          },
          {
            timeframe: '10 Years',
            key: 'decade',
            insight: 'Character and growth matter',
            perspective: 'This relationship was one chapter in your story of learning to love and be loved. What matters is what you learned about yourself and how to show up for others.',
            wisdom: 'Relationships shape us. In a decade, this one will have taught you something essential about who you are and what you need.'
          },
          {
            timeframe: '100 Years',
            key: 'century',
            insight: 'Only deep impact matters',
            perspective: 'No one will remember the details of your relationship. What might persist is how you treated each other and what you taught your children or community about love.',
            wisdom: 'Love itself matters across centuries, but specific relationships matter only for how they changed you and those around you.'
          }
        ];
      } else if (lower.includes('business') || lower.includes('startup') || lower.includes('company')) {
        perspectives = [
          {
            timeframe: '1 Day',
            key: 'day',
            insight: 'Emotions dominate',
            perspective: 'Pure adrenaline and terror. You\'re either taking the leap or playing it safe, and both feel simultaneously right and wrong.',
            wisdom: 'Starting a business is scary. The fear doesn\'t mean you shouldn\'t do it - it means it matters to you.'
          },
          {
            timeframe: '1 Year',
            key: 'year',
            insight: 'Practical outcomes matter',
            perspective: 'You\'ve either gained traction and learned you can build something, or you\'ve learned what doesn\'t work and gained invaluable experience. Both are wins.',
            wisdom: 'A year shows whether your idea has legs. More importantly, it shows whether you have the resilience to keep going.'
          },
          {
            timeframe: '10 Years',
            key: 'decade',
            insight: 'Character and growth matter',
            perspective: 'Whether this specific business succeeded or failed, you\'ll have learned to think like an entrepreneur. That mindset is more valuable than any single venture.',
            wisdom: 'In a decade, it\'s not about whether this business made you rich - it\'s about whether you became someone who can create value.'
          },
          {
            timeframe: '100 Years',
            key: 'century',
            insight: 'Only deep impact matters',
            perspective: 'Your business will be forgotten unless it fundamentally changed lives or industries. What matters is whether you created opportunities for others and treated people well.',
            wisdom: 'Companies die. What lives on is whether you created something meaningful and treated your people with dignity.'
          }
        ];
      } else {
        // Generic perspectives
        perspectives = [
          {
            timeframe: '1 Day',
            key: 'day',
            insight: 'Emotions dominate',
            perspective: 'Right now, this decision feels urgent and overwhelming. Every option carries fear and hope in equal measure.',
            wisdom: 'In this moment, your emotions are running high. That\'s okay. Don\'t mistake intensity for clarity.'
          },
          {
            timeframe: '1 Year',
            key: 'year',
            insight: 'Practical outcomes matter',
            perspective: 'You\'ll have concrete results. Some fears will have materialized, others won\'t. You\'ll know whether this choice moved you forward.',
            wisdom: 'A year from now, you\'ll have data. You\'ll know what worked and what didn\'t. Trust yourself to adapt.'
          },
          {
            timeframe: '10 Years',
            key: 'decade',
            insight: 'Character and growth matter',
            perspective: 'This decision is one of many that shaped who you became. What matters is whether you learned, grew, and stayed true to your values.',
            wisdom: 'In ten years, this is just another choice in a long chain. What matters is whether you kept growing through it.'
          },
          {
            timeframe: '100 Years',
            key: 'century',
            insight: 'Only deep impact matters',
            perspective: 'This specific decision is completely irrelevant. What might matter is whether you lived with integrity and kindness during this period.',
            wisdom: 'Nothing about this decision will matter in a century except how you treated people and whether you lived authentically.'
          }
        ];
      }
      
      return perspectives;
    }
    
    function displayTimeline() {
      const svg = document.getElementById('timelineSvg');
      svg.innerHTML = '';
      
      // Draw main timeline line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '50');
      line.setAttribute('y1', '60');
      line.setAttribute('x2', '950');
      line.setAttribute('y2', '60');
      line.setAttribute('stroke', '#667eea');
      line.setAttribute('stroke-width', '3');
      svg.appendChild(line);
      
      // Timeline points
      const timepoints = [
        { x: 50, label: 'Now' },
        { x: 283, label: '1 Day' },
        { x: 516, label: '1 Year' },
        { x: 750, label: '10 Years' },
        { x: 950, label: '100 Years' }
      ];
      
      timepoints.forEach((point, index) => {
        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', '60');
        circle.setAttribute('r', index === 0 ? '8' : '6');
        circle.setAttribute('fill', index === 0 ? '#764ba2' : '#667eea');
        circle.setAttribute('class', 'timeline-point');
        svg.appendChild(circle);
        
        // Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', point.x);
        text.setAttribute('y', index === 0 ? '35' : '90');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '${textColor}');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', index === 0 ? 'bold' : 'normal');
        text.textContent = point.label;
        svg.appendChild(text);
      });
    }
    
    function displayPerspectiveCards() {
      const container = document.getElementById('perspectiveCards');
      container.innerHTML = '';
      
      currentPerspectives.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'perspective-card';
        card.id = \`card-\${p.key}\`;
        
        card.innerHTML = \`
          <div class="timeframe">\${p.timeframe}</div>
          <div class="insight-label">\${p.insight}</div>
          <div class="perspective-text">\${p.perspective}</div>
          <div class="wisdom-text">\${p.wisdom}</div>
        \`;
        
        container.appendChild(card);
        
        // Stagger animation
        setTimeout(() => {
          card.classList.add('active');
        }, index * 150);
      });
    }
    
    function focusTimeframe(frame) {
      activeFocus = frame;
      
      // Update button states
      document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      
      // Update card display
      const cards = document.querySelectorAll('.perspective-card');
      
      if (frame === 'all') {
        cards.forEach(card => {
          card.classList.remove('focused');
          card.classList.add('active');
        });
      } else {
        cards.forEach(card => {
          if (card.id === \`card-\${frame}\`) {
            card.classList.add('focused');
            card.classList.add('active');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            card.classList.remove('focused');
            card.classList.remove('active');
          }
        });
      }
    }
    
    function resetTool() {
      document.getElementById('decisionInput').value = '';
      document.getElementById('timelineSection').style.display = 'none';
      document.getElementById('saveBtn').disabled = true;
      currentDecision = '';
      currentPerspectives = [];
      activeFocus = 'all';
      
      // Reset zoom buttons
      document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector('.zoom-btn').classList.add('active');
    }
    
    function saveDecision() {
      const decisionData = {
        decision: currentDecision,
        perspectives: currentPerspectives,
        timestamp: new Date().toISOString(),
        focus: activeFocus
      };
      
      // Try to use Noah's filesystem bridge
      if (window.parent && window.parent !== window) {
        const filename = \`time-telescope-\${new Date().toISOString().split('T')[0]}.json\`;
        
        window.parent.postMessage({
          type: 'NOAH_SAVE_REQUEST',
          payload: {
            content: JSON.stringify(decisionData, null, 2),
            suggestedPath: \`noah-thinking/\${filename}\`,
            description: \`Time Telescope decision analysis: \${currentDecision.substring(0, 50)}...\`,
            agent: 'Time Telescope Tool',
            metadata: {
              type: 'decision-analysis',
              timeframes: currentPerspectives.map(p => p.timeframe)
            }
          }
        }, '*');
        
        alert('Save request sent to Noah! Check your file operations panel.');
      } else {
        // Fallback: download as file
        const blob = new Blob([JSON.stringify(decisionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'time-telescope-decision.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
    
    // Listen for load requests
    window.addEventListener('message', (event) => {
      if (event.data.type === 'NOAH_LOAD_RESPONSE') {
        try {
          const decisionData = JSON.parse(event.data.payload.content);
          currentDecision = decisionData.decision;
          currentPerspectives = decisionData.perspectives;
          
          document.getElementById('decisionInput').value = currentDecision;
          displayTimeline();
          displayPerspectiveCards();
          document.getElementById('timelineSection').style.display = 'block';
          document.getElementById('saveBtn').disabled = false;
        } catch (error) {
          alert('Failed to load decision: ' + error.message);
        }
      }
    });
  </script>
</body>
</html>`;
  },

  /**
   * Energy Archaeology - track energy patterns throughout the day
   * Creates personal energy map to optimize schedule
   */
  energyArchaeology(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Energy Archaeology - Your Personal Energy Map</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #eee;
      padding: 20px;
      line-height: 1.6;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0f3460;
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      color: #888;
      font-size: 1.1em;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .card {
      background: #16213e;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    
    .card h2 {
      margin-bottom: 16px;
      font-size: 1.5em;
      color: #667eea;
    }
    
    .log-section {
      grid-column: 1;
    }
    
    .chart-section {
      grid-column: 2;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #aaa;
      font-size: 0.9em;
    }
    
    input[type="text"] {
      width: 100%;
      padding: 12px;
      font-size: 1em;
      border: 2px solid #0f3460;
      border-radius: 8px;
      background: #1a1a2e;
      color: #eee;
      font-family: inherit;
    }
    
    .energy-slider-container {
      margin: 20px 0;
    }
    
    .energy-value {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .energy-number {
      font-size: 2.5em;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .energy-label {
      font-size: 0.9em;
      color: #888;
      font-style: italic;
    }
    
    input[type="range"] {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: linear-gradient(to right, #e74c3c 0%, #f39c12 25%, #f1c40f 50%, #2ecc71 75%, #27ae60 100%);
      outline: none;
      -webkit-appearance: none;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: none;
    }
    
    .category-buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .category-btn {
      padding: 12px 16px;
      font-size: 0.95em;
      border: 2px solid #0f3460;
      border-radius: 8px;
      background: #1a1a2e;
      color: #eee;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }
    
    .category-btn.active {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .category-btn:hover {
      background: #0f3460;
    }
    
    .btn-log {
      width: 100%;
      padding: 16px;
      font-size: 1.1em;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 700;
      margin-bottom: 12px;
    }
    
    .btn-log:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
    }
    
    .btn-log:active {
      transform: translateY(0);
    }
    
    .btn-secondary {
      width: 100%;
      padding: 12px;
      font-size: 0.95em;
      border: 2px solid #0f3460;
      border-radius: 8px;
      background: transparent;
      color: #eee;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .btn-secondary:hover {
      background: #0f3460;
    }
    
    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 24px;
    }
    
    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    
    .insight-card {
      background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }
    
    .insight-label {
      font-size: 0.85em;
      color: #888;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .insight-value {
      font-size: 1.3em;
      font-weight: 700;
      color: #667eea;
    }
    
    .insight-detail {
      font-size: 0.9em;
      color: #aaa;
      margin-top: 4px;
    }
    
    .entries-list {
      max-height: 300px;
      overflow-y: auto;
      margin-top: 16px;
    }
    
    .entry-item {
      background: #1a1a2e;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      border-left: 3px solid #667eea;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    
    .entry-time {
      font-size: 0.85em;
      color: #888;
    }
    
    .entry-energy {
      font-weight: 700;
      font-size: 1.1em;
    }
    
    .entry-activity {
      font-size: 0.95em;
      margin-bottom: 4px;
    }
    
    .entry-category {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .category-creative { background: #9b59b6; color: white; }
    .category-social { background: #3498db; color: white; }
    .category-analytical { background: #e67e22; color: white; }
    .category-physical { background: #27ae60; color: white; }
    .category-rest { background: #95a5a6; color: white; }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }
    
    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-box {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }
    
    .stat-label {
      font-size: 0.85em;
      color: rgba(255,255,255,0.8);
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 2em;
      font-weight: 700;
      color: white;
    }
    
    @media (max-width: 968px) {
      .grid {
        grid-template-columns: 1fr;
      }
      .log-section, .chart-section {
        grid-column: 1;
      }
      .category-buttons {
        grid-template-columns: 1fr;
      }
      .stats-row {
        flex-direction: column;
      }
    }
    
    .timestamp {
      font-size: 0.8em;
      color: #666;
      margin-top: 16px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>⚡ Energy Archaeology</h1>
      <p class="subtitle">Map your energy patterns and optimize your day</p>
    </header>
    
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-label">Total Entries</div>
        <div class="stat-value" id="totalEntries">0</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Average Energy</div>
        <div class="stat-value" id="avgEnergy">-</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Days Tracked</div>
        <div class="stat-value" id="daysTracked">0</div>
      </div>
    </div>
    
    <div class="grid">
      <div class="log-section">
        <div class="card">
          <h2>Log Entry</h2>
          
          <div class="form-group">
            <label>What are you doing?</label>
            <input type="text" id="activityInput" placeholder="e.g., Writing code, Meeting with team, Reading..." />
          </div>
          
          <div class="form-group">
            <label>Category</label>
            <div class="category-buttons">
              <button class="category-btn" data-category="creative" onclick="selectCategory('creative')">🎨 Creative</button>
              <button class="category-btn" data-category="social" onclick="selectCategory('social')">👥 Social</button>
              <button class="category-btn" data-category="analytical" onclick="selectCategory('analytical')">🧠 Analytical</button>
              <button class="category-btn" data-category="physical" onclick="selectCategory('physical')">💪 Physical</button>
              <button class="category-btn" data-category="rest" onclick="selectCategory('rest')">😴 Rest</button>
            </div>
          </div>
          
          <div class="energy-slider-container">
            <label>Energy Level</label>
            <div class="energy-value">
              <span class="energy-number" id="energyDisplay">5</span>
              <span class="energy-label" id="energyLabel">Moderate</span>
            </div>
            <input type="range" id="energySlider" min="1" max="10" value="5" oninput="updateEnergyDisplay()" />
          </div>
          
          <button class="btn-log" onclick="logEntry()">⚡ Log Entry</button>
          <button class="btn-secondary" onclick="saveData()">💾 Save Data</button>
          <button class="btn-secondary" onclick="exportData()">📊 Export CSV</button>
        </div>
        
        <div class="card" style="margin-top: 24px;">
          <h2>Recent Entries</h2>
          <div class="entries-list" id="entriesList">
            <div class="no-data">No entries yet. Start logging!</div>
          </div>
        </div>
      </div>
      
      <div class="chart-section">
        <div class="card">
          <h2>Energy Map (Last 7 Days)</h2>
          <div class="chart-container">
            <canvas id="energyChart"></canvas>
          </div>
        </div>
        
        <div class="card" style="margin-top: 24px;">
          <h2>Pattern Insights</h2>
          <div class="insights-grid" id="insightsGrid">
            <div class="insight-card">
              <div class="insight-label">Peak Energy Time</div>
              <div class="insight-value" id="peakTime">-</div>
              <div class="insight-detail">When you're most energized</div>
            </div>
            <div class="insight-card">
              <div class="insight-label">Best For Creative</div>
              <div class="insight-value" id="creativeTime">-</div>
              <div class="insight-detail">Optimal creative work time</div>
            </div>
            <div class="insight-card">
              <div class="insight-label">Energy Booster</div>
              <div class="insight-value" id="booster">-</div>
              <div class="insight-detail">Activity that energizes you</div>
            </div>
            <div class="insight-card">
              <div class="insight-label">Energy Drainer</div>
              <div class="insight-value" id="drainer">-</div>
              <div class="insight-detail">Activity that depletes you</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="timestamp">Privacy-conscious: All data stays local in your browser</div>
  </div>
  
  <script>
    let energyEntries = [];
    let selectedCategory = null;
    let energyChart = null;
    
    // Energy labels
    const energyLabels = {
      1: 'Exhausted',
      2: 'Very Low',
      3: 'Low',
      4: 'Below Average',
      5: 'Moderate',
      6: 'Above Average',
      7: 'Good',
      8: 'High',
      9: 'Very High',
      10: 'Peak'
    };
    
    // Load data from localStorage
    function loadData() {
      const saved = localStorage.getItem('energyArchaeology');
      if (saved) {
        try {
          energyEntries = JSON.parse(saved);
          // Convert string dates back to Date objects
          energyEntries = energyEntries.map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
        } catch (e) {
          console.error('Failed to load data:', e);
        }
      }
      updateUI();
    }
    
    // Save data to localStorage
    function persistData() {
      try {
        localStorage.setItem('energyArchaeology', JSON.stringify(energyEntries));
      } catch (e) {
        console.error('Failed to save data:', e);
      }
    }
    
    // Update energy display
    function updateEnergyDisplay() {
      const slider = document.getElementById('energySlider');
      const display = document.getElementById('energyDisplay');
      const label = document.getElementById('energyLabel');
      
      display.textContent = slider.value;
      label.textContent = energyLabels[slider.value];
    }
    
    // Select category
    function selectCategory(category) {
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(\`[data-category="\${category}"]\`).classList.add('active');
      selectedCategory = category;
    }
    
    // Log entry
    function logEntry() {
      const activity = document.getElementById('activityInput').value.trim();
      const energy = parseInt(document.getElementById('energySlider').value);
      
      if (!activity) {
        alert('Please enter an activity');
        return;
      }
      
      if (!selectedCategory) {
        alert('Please select a category');
        return;
      }
      
      const entry = {
        timestamp: new Date(),
        activity: activity,
        category: selectedCategory,
        energyLevel: energy
      };
      
      energyEntries.push(entry);
      persistData();
      
      // Reset form
      document.getElementById('activityInput').value = '';
      document.getElementById('energySlider').value = 5;
      updateEnergyDisplay();
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      selectedCategory = null;
      
      updateUI();
    }
    
    // Update all UI elements
    function updateUI() {
      updateStats();
      updateEntriesList();
      updateChart();
      updateInsights();
    }
    
    // Update stats
    function updateStats() {
      document.getElementById('totalEntries').textContent = energyEntries.length;
      
      if (energyEntries.length > 0) {
        const avgEnergy = energyEntries.reduce((sum, e) => sum + e.energyLevel, 0) / energyEntries.length;
        document.getElementById('avgEnergy').textContent = avgEnergy.toFixed(1);
        
        const uniqueDays = new Set(energyEntries.map(e => e.timestamp.toDateString())).size;
        document.getElementById('daysTracked').textContent = uniqueDays;
      } else {
        document.getElementById('avgEnergy').textContent = '-';
        document.getElementById('daysTracked').textContent = '0';
      }
    }
    
    // Update entries list
    function updateEntriesList() {
      const container = document.getElementById('entriesList');
      
      if (energyEntries.length === 0) {
        container.innerHTML = '<div class="no-data">No entries yet. Start logging!</div>';
        return;
      }
      
      const sorted = [...energyEntries].sort((a, b) => b.timestamp - a.timestamp);
      const recent = sorted.slice(0, 10);
      
      container.innerHTML = recent.map(entry => {
        const time = entry.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const date = entry.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return \`
          <div class="entry-item">
            <div class="entry-header">
              <span class="entry-time">\${date} at \${time}</span>
              <span class="entry-energy">\${entry.energyLevel}/10</span>
            </div>
            <div class="entry-activity">\${entry.activity}</div>
            <span class="entry-category category-\${entry.category}">\${entry.category}</span>
          </div>
        \`;
      }).join('');
    }
    
    // Update chart
    function updateChart() {
      const ctx = document.getElementById('energyChart').getContext('2d');
      
      // Get last 7 days of data
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentEntries = energyEntries.filter(e => e.timestamp >= sevenDaysAgo);
      
      if (recentEntries.length === 0) {
        if (energyChart) {
          energyChart.destroy();
          energyChart = null;
        }
        return;
      }
      
      // Sort by timestamp
      const sorted = [...recentEntries].sort((a, b) => a.timestamp - b.timestamp);
      
      // Prepare data
      const labels = sorted.map(e => {
        const date = e.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const time = e.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return \`\${date} \${time}\`;
      });
      
      const data = sorted.map(e => e.energyLevel);
      
      // Color points by category
      const categoryColors = {
        creative: '#9b59b6',
        social: '#3498db',
        analytical: '#e67e22',
        physical: '#27ae60',
        rest: '#95a5a6'
      };
      
      const pointColors = sorted.map(e => categoryColors[e.category]);
      
      if (energyChart) {
        energyChart.destroy();
      }
      
      energyChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Energy Level',
            data: data,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            pointBackgroundColor: pointColors,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const entry = sorted[context.dataIndex];
                  return [
                    \`Energy: \${entry.energyLevel}/10\`,
                    \`Activity: \${entry.activity}\`,
                    \`Category: \${entry.category}\`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              ticks: {
                color: '#888',
                stepSize: 2
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              ticks: {
                color: '#888',
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });
    }
    
    // Update insights
    function updateInsights() {
      if (energyEntries.length < 3) {
        document.getElementById('peakTime').textContent = 'Need more data';
        document.getElementById('creativeTime').textContent = 'Need more data';
        document.getElementById('booster').textContent = 'Need more data';
        document.getElementById('drainer').textContent = 'Need more data';
        return;
      }
      
      // Peak energy time (by hour)
      const byHour = {};
      energyEntries.forEach(entry => {
        const hour = entry.timestamp.getHours();
        if (!byHour[hour]) byHour[hour] = [];
        byHour[hour].push(entry.energyLevel);
      });
      
      let peakHour = 0;
      let peakAvg = 0;
      for (const [hour, levels] of Object.entries(byHour)) {
        const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
        if (avg > peakAvg) {
          peakAvg = avg;
          peakHour = parseInt(hour);
        }
      }
      
      const period = peakHour < 12 ? 'AM' : 'PM';
      const displayHour = peakHour === 0 ? 12 : peakHour > 12 ? peakHour - 12 : peakHour;
      document.getElementById('peakTime').textContent = \`\${displayHour}\${period}\`;
      
      // Best time for creative work
      const creativeEntries = energyEntries.filter(e => e.category === 'creative');
      if (creativeEntries.length > 0) {
        const creativeByHour = {};
        creativeEntries.forEach(entry => {
          const hour = entry.timestamp.getHours();
          if (!creativeByHour[hour]) creativeByHour[hour] = [];
          creativeByHour[hour].push(entry.energyLevel);
        });
        
        let bestCreativeHour = 0;
        let bestCreativeAvg = 0;
        for (const [hour, levels] of Object.entries(creativeByHour)) {
          const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
          if (avg > bestCreativeAvg) {
            bestCreativeAvg = avg;
            bestCreativeHour = parseInt(hour);
          }
        }
        
        const creativePeriod = bestCreativeHour < 12 ? 'AM' : 'PM';
        const creativeDisplayHour = bestCreativeHour === 0 ? 12 : bestCreativeHour > 12 ? bestCreativeHour - 12 : bestCreativeHour;
        document.getElementById('creativeTime').textContent = \`\${creativeDisplayHour}\${creativePeriod}\`;
      } else {
        document.getElementById('creativeTime').textContent = 'No data';
      }
      
      // Energy booster (activity with highest average)
      const activityStats = {};
      energyEntries.forEach(entry => {
        if (!activityStats[entry.activity]) {
          activityStats[entry.activity] = { total: 0, count: 0 };
        }
        activityStats[entry.activity].total += entry.energyLevel;
        activityStats[entry.activity].count += 1;
      });
      
      let booster = '';
      let boosterAvg = 0;
      for (const [activity, stats] of Object.entries(activityStats)) {
        if (stats.count < 2) continue; // Need at least 2 entries
        const avg = stats.total / stats.count;
        if (avg > boosterAvg) {
          boosterAvg = avg;
          booster = activity;
        }
      }
      document.getElementById('booster').textContent = booster || 'Need more data';
      
      // Energy drainer (activity with lowest average)
      let drainer = '';
      let drainerAvg = 11;
      for (const [activity, stats] of Object.entries(activityStats)) {
        if (stats.count < 2) continue;
        const avg = stats.total / stats.count;
        if (avg < drainerAvg) {
          drainerAvg = avg;
          drainer = activity;
        }
      }
      document.getElementById('drainer').textContent = drainer || 'Need more data';
    }
    
    // Save data via postMessage
    function saveData() {
      if (energyEntries.length === 0) {
        alert('No data to save');
        return;
      }
      
      const exportData = {
        entries: energyEntries,
        exported: new Date().toISOString()
      };
      
      // Try to use Noah's filesystem bridge
      if (window.parent && window.parent !== window) {
        const filename = \`energy-archaeology-\${new Date().toISOString().split('T')[0]}.json\`;
        
        window.parent.postMessage({
          type: 'NOAH_SAVE_REQUEST',
          payload: {
            content: JSON.stringify(exportData, null, 2),
            suggestedPath: \`noah-thinking/\${filename}\`,
            description: \`Energy Archaeology data with \${energyEntries.length} entries\`,
            agent: 'Energy Archaeology Tool',
            metadata: {
              type: 'energy-tracking',
              totalEntries: energyEntries.length,
              dateRange: {
                start: Math.min(...energyEntries.map(e => new Date(e.timestamp).getTime())),
                end: Math.max(...energyEntries.map(e => new Date(e.timestamp).getTime()))
              }
            }
          }
        }, '*');
        
        alert('Save request sent to Noah! Check your file operations panel.');
      } else {
        // Fallback: download as file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'energy-archaeology-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
    
    // Export as CSV
    function exportData() {
      if (energyEntries.length === 0) {
        alert('No data to export');
        return;
      }
      
      let csv = 'Date,Time,Activity,Category,Energy Level\\n';
      energyEntries.forEach(entry => {
        const date = entry.timestamp.toLocaleDateString('en-US');
        const time = entry.timestamp.toLocaleTimeString('en-US');
        csv += \`"\${date}","\${time}","\${entry.activity}","\${entry.category}",\${entry.energyLevel}\\n\`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'energy-archaeology.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // Listen for load requests
    window.addEventListener('message', (event) => {
      if (event.data.type === 'NOAH_LOAD_RESPONSE') {
        try {
          const data = JSON.parse(event.data.payload.content);
          energyEntries = data.entries.map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
          persistData();
          updateUI();
          alert('Data loaded successfully!');
        } catch (error) {
          alert('Failed to load data: ' + error.message);
        }
      }
    });
    
    // Initialize
    updateEnergyDisplay();
    loadData();
  </script>
</body>
</html>`;
  }
};

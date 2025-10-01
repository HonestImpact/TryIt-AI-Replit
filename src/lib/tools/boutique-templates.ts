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
  }
};

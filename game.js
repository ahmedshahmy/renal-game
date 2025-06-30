class RenalHospitalGame {
    constructor() {
        this.gameData = null;
        this.currentScenario = null;
        this.gameState = {
            health: 100,
            budget: 0,
            totalBudget: 0,
            vitals: {},
            labs: {},
            gameTime: 8 * 60, // Start at 8:00 AM (in minutes from midnight)
            elapsedTime: 0,
            timeLimit: 24 * 60, // 24 hours in minutes
            isPaused: false,
            isGameOver: false
        };
        this.gameTimer = null;
        this.clockTimer = null;
        this.init();
    }

    async init() {
        await this.loadGameData();
        this.setupEventListeners();
        this.startNewGame();
    }

    async loadGameData() {
        // Embedded game data to avoid CORS issues when opening HTML file directly
        this.gameData = {
            "scenarios": [
                {
                    "id": "acute_kidney_injury",
                    "title": "Acute Kidney Injury",
                    "patient": {
                        "name": "Sarah Johnson",
                        "age": 45,
                        "gender": "Female"
                    },
                    "description": "A 45-year-old female presents to the emergency department with decreased urine output, nausea, and fatigue for the past 3 days. She recently underwent major abdominal surgery and has been taking NSAIDs for pain management. Her creatinine has risen from baseline 1.0 mg/dL to 3.2 mg/dL.",
                    "initialBudget": 5000,
                    "initialHealth": 65,
                    "targetHealth": 85,
                    "timeLimit": 24,
                    "initialVitals": {
                        "bloodPressure": "160/95",
                        "heartRate": 88,
                        "temperature": 99.2,
                        "respiratoryRate": 18
                    },
                    "initialLabs": {
                        "creatinine": 3.2,
                        "bun": 45,
                        "gfr": 25,
                        "potassium": 5.2,
                        "sodium": 135,
                        "hemoglobin": 10.8
                    },
                    "deteriorationRate": 2,
                    "winCondition": "Stabilize kidney function and achieve target health",
                    "availableInterventions": ["iv_fluids", "diuretics", "ace_inhibitor", "hemodialysis", "kayexalate", "calcium_gluconate", "nsaid_discontinuation"],
                    "interventionModifiers": {
                        "iv_fluids": {
                            "effects": {
                                "health": 12,
                                "creatinine": -0.5,
                                "bun": -8,
                                "gfr": 5
                            },
                            "description": "More effective in dehydration-related AKI"
                        },
                        "diuretics": {
                            "effects": {
                                "health": 4,
                                "potassium": -0.6,
                                "sodium": 3
                            },
                            "negativeEffects": {
                                "creatinine": 0.2
                            },
                            "description": "Risky in AKI - can worsen kidney function"
                        },
                        "hemodialysis": {
                            "effects": {
                                "health": 30,
                                "creatinine": -2.0,
                                "bun": -30,
                                "potassium": -2.0
                            },
                            "description": "Most effective emergency intervention for severe AKI"
                        }
                    },
                    "specificInterventions": [
                        {
                            "id": "nsaid_discontinuation",
                            "name": "Discontinue NSAIDs",
                            "description": "Stop nephrotoxic NSAIDs immediately - critical in NSAID-induced AKI",
                            "cost": 50,
                            "effects": {
                                "health": 15,
                                "creatinine": -0.5,
                                "gfr": 5
                            },
                            "cumulativeEffects": {
                                "health": 2,
                                "creatinine": -0.1,
                                "duration": 6
                            },
                            "timeRequired": 1
                        }
                    ]
                },
                {
                    "id": "chronic_kidney_disease",
                    "title": "Chronic Kidney Disease Stage 4",
                    "patient": {
                        "name": "Robert Martinez",
                        "age": 62,
                        "gender": "Male"
                    },
                    "description": "A 62-year-old male with diabetes and hypertension presents with worsening fatigue, shortness of breath, and decreased appetite. His GFR has declined to 22 mL/min/1.73m². He has protein in his urine and signs of fluid overload. Needs preparation for renal replacement therapy.",
                    "initialBudget": 8000,
                    "initialHealth": 45,
                    "targetHealth": 75,
                    "timeLimit": 48,
                    "initialVitals": {
                        "bloodPressure": "145/90",
                        "heartRate": 92,
                        "temperature": 98.8,
                        "respiratoryRate": 20
                    },
                    "initialLabs": {
                        "creatinine": 4.8,
                        "bun": 68,
                        "gfr": 22,
                        "potassium": 5.8,
                        "sodium": 138,
                        "hemoglobin": 9.2
                    },
                    "deteriorationRate": 1.5,
                    "winCondition": "Stabilize patient and prepare for dialysis",
                    "availableInterventions": ["hemodialysis", "diuretics", "ace_inhibitor", "erythropoietin", "phosphate_binder", "nutritional_counseling", "aggressive_bp_control"],
                    "interventionModifiers": {
                        "hemodialysis": {
                            "effects": {
                                "health": 20,
                                "creatinine": -1.2,
                                "bun": -20,
                                "potassium": -1.5
                            },
                            "description": "Standard effectiveness in CKD - prepares for chronic dialysis"
                        },
                        "diuretics": {
                            "effects": {
                                "health": 10,
                                "potassium": -0.3,
                                "sodium": 1,
                                "bloodPressure": "decrease_both_15"
                            },
                            "description": "Effective for fluid management in CKD"
                        },
                        "ace_inhibitor": {
                            "effects": {
                                "health": 15,
                                "bloodPressure": "decrease_both_20",
                                "gfr": 3,
                                "potassium": 0.4
                            },
                            "description": "Highly effective renal protection in CKD"
                        }
                    },
                    "specificInterventions": [
                        {
                            "id": "aggressive_bp_control",
                            "name": "Aggressive BP Control",
                            "description": "Multiple antihypertensive agents to control BP",
                            "cost": 300,
                            "effects": {
                                "health": 12,
                                "bloodPressure": "decrease_both_20",
                                "gfr": -2
                            },
                            "negativeEffects": {
                                "potassium": 0.5,
                                "creatinine": 0.2
                            },
                            "cumulativeEffects": {
                                "health": 1,
                                "gfr": 1,
                                "duration": 8
                            },
                            "timeRequired": 2
                        }
                    ]
                },
                {
                    "id": "diabetic_nephropathy",
                    "title": "Diabetic Nephropathy Crisis",
                    "patient": {
                        "name": "Maria Garcia",
                        "age": 58,
                        "gender": "Female"
                    },
                    "description": "A 58-year-old female with poorly controlled Type 2 diabetes presents with severe proteinuria, hypertension, and declining kidney function. Blood glucose is poorly controlled at 280 mg/dL. She has significant edema and shortness of breath.",
                    "initialBudget": 6500,
                    "initialHealth": 55,
                    "targetHealth": 80,
                    "timeLimit": 36,
                    "initialVitals": {
                        "bloodPressure": "170/100",
                        "heartRate": 95,
                        "temperature": 98.4,
                        "respiratoryRate": 22
                    },
                    "initialLabs": {
                        "creatinine": 2.8,
                        "bun": 52,
                        "gfr": 35,
                        "potassium": 4.8,
                        "sodium": 142,
                        "hemoglobin": 10.2
                    },
                    "deteriorationRate": 2.5,
                    "winCondition": "Control diabetes and stabilize kidney function",
                    "availableInterventions": ["insulin_therapy", "ace_inhibitor", "diuretics", "iv_fluids", "strict_glucose_monitoring"],
                    "interventionModifiers": {
                        "insulin_therapy": {
                            "effects": {
                                "health": 20,
                                "creatinine": -0.6,
                                "potassium": -0.8,
                                "gfr": 8
                            },
                            "description": "Highly effective in diabetic nephropathy - glucose control is critical"
                        },
                        "ace_inhibitor": {
                            "effects": {
                                "health": 18,
                                "bloodPressure": "decrease_both_25",
                                "gfr": 4,
                                "potassium": 0.2
                            },
                            "description": "Essential for diabetic nephropathy - provides superior renal protection"
                        },
                        "diuretics": {
                            "effects": {
                                "health": 8,
                                "potassium": -0.5,
                                "sodium": 2,
                                "bloodPressure": "decrease_both_12"
                            },
                            "description": "Effective for edema control in diabetic nephropathy"
                        },
                        "iv_fluids": {
                            "effects": {
                                "health": 5,
                                "creatinine": -0.1,
                                "bun": -2
                            },
                            "negativeEffects": {
                                "respiratoryRate": 3
                            },
                            "description": "Limited benefit - may worsen fluid overload"
                        }
                    },
                    "specificInterventions": [
                        {
                            "id": "strict_glucose_monitoring",
                            "name": "Strict Glucose Monitoring",
                            "description": "Intensive glucose monitoring with frequent adjustments",
                            "cost": 400,
                            "effects": {
                                "health": 18,
                                "creatinine": -0.4,
                                "gfr": 6
                            },
                            "negativeEffects": {
                                "potassium": -0.8
                            },
                            "cumulativeEffects": {
                                "health": 3,
                                "gfr": 1,
                                "duration": 12
                            },
                            "timeRequired": 3
                        }
                    ]
                }
            ],
            "globalInterventions": [
                {
                    "id": "iv_fluids",
                    "name": "IV Fluid Resuscitation",
                    "description": "Administer normal saline or balanced crystalloids",
                    "cost": 200,
                    "effects": {
                        "health": 8,
                        "creatinine": -0.3,
                        "bun": -5,
                        "gfr": 3,
                        "bloodPressure": "increase_systolic_5"
                    },
                    "contraindications": ["fluid_overload"],
                    "timeRequired": 2
                },
                {
                    "id": "diuretics",
                    "name": "Loop Diuretics (Furosemide)",
                    "description": "Administer furosemide for diuresis and fluid removal",
                    "cost": 150,
                    "effects": {
                        "health": 6,
                        "potassium": -0.4,
                        "sodium": 2,
                        "bloodPressure": "decrease_both_10"
                    },
                    "contraindications": ["severe_dehydration"],
                    "timeRequired": 1
                },
                {
                    "id": "ace_inhibitor",
                    "name": "ACE Inhibitor",
                    "description": "Start or increase ACE inhibitor for renal protection",
                    "cost": 100,
                    "effects": {
                        "health": 10,
                        "bloodPressure": "decrease_both_15",
                        "gfr": 2,
                        "potassium": 0.3
                    },
                    "contraindications": ["hyperkalemia"],
                    "timeRequired": 1
                },
                {
                    "id": "insulin_therapy",
                    "name": "Insulin Therapy",
                    "description": "Optimize glucose control with insulin",
                    "cost": 250,
                    "effects": {
                        "health": 12,
                        "creatinine": -0.2,
                        "potassium": -0.5,
                        "gfr": 4
                    },
                    "contraindications": ["hypoglycemia"],
                    "timeRequired": 2
                },
                {
                    "id": "hemodialysis",
                    "name": "Emergency Hemodialysis",
                    "description": "Initiate emergent hemodialysis",
                    "cost": 1500,
                    "effects": {
                        "health": 25,
                        "creatinine": -1.5,
                        "bun": -25,
                        "potassium": -1.8,
                        "sodium": 0
                    },
                    "contraindications": ["hemodynamic_instability"],
                    "timeRequired": 4
                },
                {
                    "id": "sodium_bicarbonate",
                    "name": "Sodium Bicarbonate",
                    "description": "Correct metabolic acidosis",
                    "cost": 120,
                    "effects": {
                        "health": 7,
                        "sodium": 3,
                        "respiratoryRate": -2
                    },
                    "contraindications": ["alkalosis"],
                    "timeRequired": 1
                },
                {
                    "id": "kayexalate",
                    "name": "Sodium Polystyrene Sulfonate",
                    "description": "Treat hyperkalemia with potassium binder",
                    "cost": 180,
                    "effects": {
                        "health": 8,
                        "potassium": -1.2,
                        "sodium": 1
                    },
                    "contraindications": ["bowel_obstruction"],
                    "timeRequired": 2
                },
                {
                    "id": "erythropoietin",
                    "name": "Erythropoietin Stimulating Agent",
                    "description": "Treat anemia associated with CKD",
                    "cost": 400,
                    "effects": {
                        "health": 6,
                        "hemoglobin": 1.5
                    },
                    "contraindications": ["uncontrolled_hypertension"],
                    "timeRequired": 1
                },
                {
                    "id": "phosphate_binder",
                    "name": "Phosphate Binder",
                    "description": "Control phosphate levels in CKD",
                    "cost": 160,
                    "effects": {
                        "health": 4,
                        "calcium": 0.3
                    },
                    "contraindications": ["hypercalcemia"],
                    "timeRequired": 1
                },
                {
                    "id": "calcium_gluconate",
                    "name": "Calcium Gluconate",
                    "description": "Cardioprotective agent for severe hyperkalemia",
                    "cost": 80,
                    "effects": {
                        "health": 5,
                        "heartRate": -8
                    },
                    "contraindications": ["hypercalcemia"],
                    "timeRequired": 1
                },
                {
                    "id": "blood_transfusion",
                    "name": "Blood Transfusion",
                    "description": "Transfuse packed red blood cells for severe anemia",
                    "cost": 800,
                    "effects": {
                        "health": 15,
                        "hemoglobin": 2.5,
                        "heartRate": -10
                    },
                    "contraindications": ["fluid_overload", "iron_overload"],
                    "timeRequired": 3
                },
                {
                    "id": "nutritional_counseling",
                    "name": "Renal Diet Counseling",
                    "description": "Dietary modification for kidney disease",
                    "cost": 150,
                    "effects": {
                        "health": 5,
                        "potassium": -0.2,
                        "bun": -3
                    },
                    "contraindications": ["severe_malnutrition"],
                    "timeRequired": 1
                }
            ],
            "normalRanges": {
                "creatinine": {
                    "min": 0.6,
                    "max": 1.2,
                    "unit": "mg/dL"
                },
                "bun": {
                    "min": 7,
                    "max": 20,
                    "unit": "mg/dL"
                },
                "gfr": {
                    "min": 90,
                    "max": 120,
                    "unit": "mL/min"
                },
                "potassium": {
                    "min": 3.5,
                    "max": 5.0,
                    "unit": "mEq/L"
                },
                "sodium": {
                    "min": 136,
                    "max": 145,
                    "unit": "mEq/L"
                },
                "hemoglobin": {
                    "min": 12.0,
                    "max": 16.0,
                    "unit": "g/dL"
                }
            }
        };
        
        // Load editor-created scenarios and interventions
        this.loadEditorContent();    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.startNewGame());
        
        const interventionSelect = document.getElementById('interventionSelect');
        interventionSelect.addEventListener('change', () => this.updateInterventionCost());
        
        const performBtn = document.getElementById('performIntervention');
        performBtn.addEventListener('click', () => this.performIntervention());
    }

    startNewGame() {
        // Hide game over modal
        document.getElementById('gameOverModal').classList.add('hidden');
        
        // Select a random scenario
        if (this.gameData.scenarios.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.gameData.scenarios.length);
        this.currentScenario = this.gameData.scenarios[randomIndex];
        
        // Initialize game state
        this.gameState = {
            health: this.currentScenario.initialHealth,
            budget: this.currentScenario.initialBudget,
            totalBudget: this.currentScenario.initialBudget,
            vitals: { ...this.currentScenario.initialVitals },
            labs: { ...this.currentScenario.initialLabs },
            gameTime: 8 * 60, // 8:00 AM
            elapsedTime: 0,
            timeLimit: this.currentScenario.timeLimit * 60, // Convert hours to minutes
            isPaused: false,
            isGameOver: false,
            interventionsUsed: [],
            activeEffects: [] // Track cumulative effects
        };
        
        this.updateUI();
        this.populateInterventions();
        this.clearActionLog();
        this.addLogEntry('Game started', `Managing ${this.currentScenario.patient.name} - ${this.currentScenario.title}`);
        
        // Start game timers
        this.startGameTimer();
        this.startClockTimer();
    }

    populateInterventions() {
        const select = document.getElementById('interventionSelect');
        select.innerHTML = '<option value="">Select an intervention...</option>';
        
        // Get available interventions for current scenario
        const availableIds = this.currentScenario.availableInterventions || [];
        
        // Add global interventions that are available for this scenario
        this.gameData.globalInterventions.forEach(intervention => {
            if (availableIds.includes(intervention.id)) {
                const option = document.createElement('option');
                option.value = intervention.id;
                option.textContent = `${intervention.name} - $${intervention.cost}`;
                select.appendChild(option);
            }
        });
        
        // Add scenario-specific interventions
        if (this.currentScenario.specificInterventions) {
            this.currentScenario.specificInterventions.forEach(intervention => {
                const option = document.createElement('option');
                option.value = intervention.id;
                option.textContent = `${intervention.name} - $${intervention.cost}`;
                select.appendChild(option);
            });
        }
    }

    findIntervention(id) {
        // Look in global interventions first
        let intervention = this.gameData.globalInterventions.find(i => i.id === id);
        
        // If not found, look in scenario-specific interventions
        if (!intervention && this.currentScenario.specificInterventions) {
            intervention = this.currentScenario.specificInterventions.find(i => i.id === id);
        }
        
        return intervention;
    }

    updateInterventionCost() {
        const select = document.getElementById('interventionSelect');
        const costDiv = document.getElementById('interventionCost');
        const performBtn = document.getElementById('performIntervention');
        
        if (select.value) {
            const intervention = this.findIntervention(select.value);
            if (intervention) {
                let effectsText = '';
                if (intervention.negativeEffects) {
                    effectsText += '<br><span style="color: #e74c3c;">⚠️ Warning: May cause negative effects</span>';
                }
                if (intervention.cumulativeEffects) {
                    effectsText += '<br><span style="color: #3498db;">📈 Has long-term cumulative benefits</span>';
                }
                
                costDiv.innerHTML = `
                    <strong>Cost:</strong> $${intervention.cost}<br>
                    <strong>Description:</strong> ${intervention.description}<br>
                    <strong>Time Required:</strong> ${intervention.timeRequired} hour(s)
                    ${effectsText}
                `;
                
                const canAfford = this.gameState.budget >= intervention.cost;
                performBtn.disabled = !canAfford;
                performBtn.textContent = canAfford ? 'Perform Intervention' : 'Insufficient Funds';
            }
        } else {
            costDiv.innerHTML = '';
            performBtn.disabled = true;
            performBtn.textContent = 'Perform Intervention';
        }
    }

    performIntervention() {
        const select = document.getElementById('interventionSelect');
        const interventionId = select.value;
        
        if (!interventionId || this.gameState.isGameOver) return;
        
        const intervention = this.findIntervention(interventionId);
        if (!intervention || this.gameState.budget < intervention.cost) return;
        
        // Deduct cost
        this.gameState.budget -= intervention.cost;
        
        // Apply immediate effects
        this.applyInterventionEffects(intervention);
        
        // Apply negative effects if any
        if (intervention.negativeEffects) {
            this.applyNegativeEffects(intervention.negativeEffects);
        }
        
        // Add cumulative effects if any
        if (intervention.cumulativeEffects) {
            this.addCumulativeEffect(intervention);
        }
        
        // Add to used interventions
        this.gameState.interventionsUsed.push({
            intervention: intervention,
            time: this.formatTime(this.gameState.gameTime)
        });
        
        // Advance time
        this.gameState.gameTime += intervention.timeRequired * 60;
        this.gameState.elapsedTime += intervention.timeRequired * 60;
        
        // Log the action
        let logMessage = `Performed: ${intervention.name}`;
        if (intervention.negativeEffects) {
            logMessage += ' ⚠️ (with side effects)';
        }
        if (intervention.cumulativeEffects) {
            logMessage += ' 📈 (ongoing benefits)';
        }
        
        this.addLogEntry(
            this.formatTime(this.gameState.gameTime - intervention.timeRequired * 60),
            logMessage
        );
        
        // Reset selection
        select.value = '';
        this.updateInterventionCost();
        
        // Update UI
        this.updateUI();
        
        // Check win/lose conditions
        this.checkGameStatus();
    }

    applyInterventionEffects(intervention) {
        // Get base effects from intervention
        let effects = { ...intervention.effects };
        
        // Check if there are scenario-specific modifiers for this intervention
        if (this.currentScenario.interventionModifiers && this.currentScenario.interventionModifiers[intervention.id]) {
            const modifiers = this.currentScenario.interventionModifiers[intervention.id];
            
            // Override with scenario-specific effects
            if (modifiers.effects) {
                effects = { ...modifiers.effects };
            }
            
            // Log scenario-specific modification
            this.addLogEntry(
                this.formatTime(this.gameState.gameTime),
                `💡 Scenario-specific effect: ${modifiers.description || 'Modified effectiveness'}`
            );
        }
        
        // Apply health effect
        if (effects.health) {
            this.gameState.health = Math.min(100, Math.max(0, this.gameState.health + effects.health));
        }
        
        // Apply lab effects
        Object.keys(effects).forEach(key => {
            if (key === 'health') return;
            
            if (key === 'bloodPressure') {
                this.applyBloodPressureEffect(effects[key]);
            } else if (this.gameState.labs.hasOwnProperty(key)) {
                this.gameState.labs[key] = Math.max(0, this.gameState.labs[key] + effects[key]);
            } else if (this.gameState.vitals.hasOwnProperty(key)) {
                this.gameState.vitals[key] = Math.max(0, this.gameState.vitals[key] + effects[key]);
            }
        });
        
        // Apply scenario-specific negative effects if any
        if (this.currentScenario.interventionModifiers && 
            this.currentScenario.interventionModifiers[intervention.id] && 
            this.currentScenario.interventionModifiers[intervention.id].negativeEffects) {
            this.applyNegativeEffects(this.currentScenario.interventionModifiers[intervention.id].negativeEffects);
        }
    }

    applyBloodPressureEffect(effect) {
        const [systolic, diastolic] = this.gameState.vitals.bloodPressure.split('/').map(Number);
        
        if (effect.includes('increase_systolic')) {
            const increase = parseInt(effect.match(/\d+/)[0]);
            this.gameState.vitals.bloodPressure = `${systolic + increase}/${diastolic}`;
        } else if (effect.includes('decrease_both')) {
            const decrease = parseInt(effect.match(/\d+/)[0]);
            this.gameState.vitals.bloodPressure = `${Math.max(80, systolic - decrease)}/${Math.max(50, diastolic - decrease)}`;
        }
    }

    applyNegativeEffects(negativeEffects) {
        Object.keys(negativeEffects).forEach(key => {
            if (key === 'health') {
                this.gameState.health = Math.max(0, this.gameState.health - Math.abs(negativeEffects[key]));
            } else if (this.gameState.labs.hasOwnProperty(key)) {
                this.gameState.labs[key] = Math.max(0, this.gameState.labs[key] + negativeEffects[key]);
            } else if (this.gameState.vitals.hasOwnProperty(key)) {
                this.gameState.vitals[key] = Math.max(0, this.gameState.vitals[key] + negativeEffects[key]);
            }
        });
    }

    addCumulativeEffect(intervention) {
        const effect = {
            interventionName: intervention.name,
            effects: intervention.cumulativeEffects,
            remainingDuration: intervention.cumulativeEffects.duration,
            appliedAt: this.gameState.gameTime
        };
        
        this.gameState.activeEffects.push(effect);
        
        this.addLogEntry(
            this.formatTime(this.gameState.gameTime),
            `📈 Cumulative effect started: ${intervention.name} (${effect.remainingDuration}h duration)`
        );
    }

    applyCumulativeEffects() {
        // Apply ongoing cumulative effects
        this.gameState.activeEffects.forEach((effect, index) => {
            if (effect.remainingDuration > 0) {
                // Apply the cumulative effects
                Object.keys(effect.effects).forEach(key => {
                    if (key === 'duration') return; // Skip duration property
                    
                    if (key === 'health') {
                        this.gameState.health = Math.min(100, this.gameState.health + effect.effects[key]);
                    } else if (this.gameState.labs.hasOwnProperty(key)) {
                        this.gameState.labs[key] = Math.max(0, this.gameState.labs[key] + effect.effects[key]);
                    } else if (this.gameState.vitals.hasOwnProperty(key)) {
                        this.gameState.vitals[key] = Math.max(0, this.gameState.vitals[key] + effect.effects[key]);
                    }
                });
                
                effect.remainingDuration--;
                
                if (effect.remainingDuration === 0) {
                    this.addLogEntry(
                        this.formatTime(this.gameState.gameTime),
                        `📉 Cumulative effect ended: ${effect.interventionName}`
                    );
                }
            }
        });
        
        // Remove expired effects
        this.gameState.activeEffects = this.gameState.activeEffects.filter(effect => effect.remainingDuration > 0);
    }

    startGameTimer() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        
        this.gameTimer = setInterval(() => {
            if (this.gameState.isPaused || this.gameState.isGameOver) return;
            
            // Advance time (1 minute every 2 seconds)
            this.gameState.gameTime += 1;
            this.gameState.elapsedTime += 1;
            
            // Apply deterioration every 30 minutes
            if (this.gameState.elapsedTime % 30 === 0) {
                this.applyDeterioration();
            }
            
            // Apply cumulative effects every hour
            if (this.gameState.elapsedTime % 60 === 0) {
                this.applyCumulativeEffects();
            }
            
            // Update UI every minute
            this.updateUI();
            
            // Check game status
            this.checkGameStatus();
        }, 2000); // 2 seconds = 1 game minute
    }

    startClockTimer() {
        if (this.clockTimer) clearInterval(this.clockTimer);
        
        this.clockTimer = setInterval(() => {
            this.updateClock();
        }, 100);
    }

    applyDeterioration() {
        if (!this.currentScenario) return;
        
        const deteriorationRate = this.currentScenario.deteriorationRate || 1;
        
        // Health deteriorates if no intervention
        this.gameState.health = Math.max(0, this.gameState.health - deteriorationRate);
        
        // Some lab values may worsen
        if (Math.random() < 0.3) { // 30% chance
            this.gameState.labs.creatinine += 0.1;
            this.gameState.labs.bun += 2;
            this.gameState.labs.gfr = Math.max(5, this.gameState.labs.gfr - 1);
        }
        
        this.addLogEntry(
            this.formatTime(this.gameState.gameTime),
            'Patient condition is deteriorating without intervention'
        );
    }

    checkGameStatus() {
        // Check if patient died
        if (this.gameState.health <= 0) {
            this.endGame(false, 'Patient has died. Game Over.');
            return;
        }
        
        // Check if budget is depleted and health is still low
        if (this.gameState.budget <= 0 && this.gameState.health < this.currentScenario.targetHealth) {
            this.endGame(false, 'Budget depleted and patient not stabilized. Game Over.');
            return;
        }
        
        // Check if time limit exceeded
        if (this.gameState.elapsedTime >= this.gameState.timeLimit) {
            if (this.gameState.health >= this.currentScenario.targetHealth) {
                this.endGame(true, 'Time limit reached but patient stabilized. Well done!');
            } else {
                this.endGame(false, 'Time limit reached and patient not stabilized. Game Over.');
            }
            return;
        }
        
        // Check win condition
        if (this.gameState.health >= this.currentScenario.targetHealth) {
            this.endGame(true, 'Patient successfully stabilized and ready for discharge. Congratulations!');
        }
    }

    endGame(won, message) {
        this.gameState.isGameOver = true;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const messageEl = document.getElementById('gameOverMessage');
        
        title.textContent = won ? 'Congratulations!' : 'Game Over';
        title.style.color = won ? '#27ae60' : '#e74c3c';
        messageEl.textContent = message;
        
        modal.classList.remove('hidden');
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        const btn = document.getElementById('pauseBtn');
        btn.textContent = this.gameState.isPaused ? 'Resume' : 'Pause';
        btn.classList.toggle('pause', this.gameState.isPaused);
    }

    updateUI() {
        // Update scenario info
        if (this.currentScenario) {
            document.getElementById('scenarioText').textContent = this.currentScenario.description;
            document.getElementById('patientName').textContent = this.currentScenario.patient.name;
            document.getElementById('patientAge').textContent = this.currentScenario.patient.age;
            document.getElementById('patientGender').textContent = this.currentScenario.patient.gender;
        }
        
        // Update budget
        document.getElementById('currentBudget').textContent = this.gameState.budget;
        document.getElementById('totalBudget').textContent = this.gameState.totalBudget;
        const budgetProgress = document.getElementById('budgetProgress');
        const budgetPercent = (this.gameState.budget / this.gameState.totalBudget) * 100;
        budgetProgress.style.width = `${budgetPercent}%`;
        
        // Update health
        const healthFill = document.getElementById('healthFill');
        const healthPercent = document.getElementById('healthPercent');
        const statusText = document.getElementById('statusText');
        
        healthFill.style.width = `${this.gameState.health}%`;
        healthPercent.textContent = `${Math.round(this.gameState.health)}%`;
        
        // Set health status and colors
        let status = 'stable';
        if (this.gameState.health < 30) {
            status = 'critical';
            healthFill.setAttribute('data-health', 'low');
        } else if (this.gameState.health < 60) {
            status = 'deteriorating';
            healthFill.setAttribute('data-health', 'medium');
        } else {
            healthFill.setAttribute('data-health', 'high');
        }
        
        statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusText.className = `status-text ${status}`;
        
        // Update vitals
        this.updateVitals();
        
        // Update lab results
        this.updateLabResults();
    }

    updateVitals() {
        const vitals = this.gameState.vitals;
        document.getElementById('bloodPressure').textContent = vitals.bloodPressure;
        document.getElementById('heartRate').textContent = `${vitals.heartRate} bpm`;
        document.getElementById('temperature').textContent = `${vitals.temperature}°F`;
        document.getElementById('respiratoryRate').textContent = `${vitals.respiratoryRate}/min`;
    }

    updateLabResults() {
        const labs = this.gameState.labs;
        const normalRanges = this.gameData.normalRanges;
        
        Object.keys(labs).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                const value = typeof labs[key] === 'number' ? labs[key].toFixed(1) : labs[key];
                const unit = normalRanges[key]?.unit || '';
                element.textContent = `${value} ${unit}`;
                
                // Check if value is abnormal
                const parent = element.parentElement;
                parent.classList.remove('abnormal-high', 'abnormal-low');
                
                if (normalRanges[key]) {
                    const numValue = parseFloat(labs[key]);
                    if (numValue > normalRanges[key].max) {
                        parent.classList.add('abnormal-high');
                    } else if (numValue < normalRanges[key].min) {
                        parent.classList.add('abnormal-low');
                    }
                }
            }
        });
    }

    updateClock() {
        const timeDisplay = document.getElementById('timeDisplay');
        const hourHand = document.getElementById('hourHand');
        const minuteHand = document.getElementById('minuteHand');
        
        const formattedTime = this.formatTime(this.gameState.gameTime);
        timeDisplay.textContent = formattedTime;
        
        // Calculate hand positions
        const hours = Math.floor(this.gameState.gameTime / 60) % 12;
        const minutes = this.gameState.gameTime % 60;
        
        const hourAngle = (hours * 30) + (minutes * 0.5) - 90; // -90 to start from 12 o'clock
        const minuteAngle = (minutes * 6) - 90;
        
        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60) % 24;
        const mins = minutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
    }

    addLogEntry(time, message) {
        const logContent = document.getElementById('actionLog');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="log-time">${time}</span>${message}`;
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    clearActionLog() {
        document.getElementById('actionLog').innerHTML = '';
    }

    // Method to load editor-created content
    loadEditorContent() {
        console.log("Loading editor scenarios from localStorage...");
        const editorScenarios = localStorage.getItem("renalGameScenarios");
        const editorInterventions = localStorage.getItem("renalGameInterventions");
        
        if (editorScenarios) {
            const editorScenarioList = JSON.parse(editorScenarios);
            console.log(`Found ${editorScenarioList.length} editor scenarios`);
            this.mergeScenarios(editorScenarioList);
        }
        
        if (editorInterventions) {
            const editorInterventionList = JSON.parse(editorInterventions);
            console.log(`Found ${editorInterventionList.length} custom interventions`);
            this.mergeInterventions(editorInterventionList);
        }
        
        console.log(`Total scenarios available: ${this.gameData.scenarios.length}`);
    }

    // Method to merge editor scenarios with existing ones
    mergeScenarios(editorScenarioList) {
        const existingIds = new Set(this.gameData.scenarios.map(scenario => scenario.id));
        const newScenarios = editorScenarioList.filter(scenario => !existingIds.has(scenario.id));
        this.gameData.scenarios = this.gameData.scenarios.concat(newScenarios);
        console.log(`Merged ${newScenarios.length} new editor scenarios`);
    }

    // Method to merge editor interventions with existing ones
    mergeInterventions(editorInterventionList) {
        if (!this.gameData.globalInterventions) {
            this.gameData.globalInterventions = [];
        }
        const existingIds = new Set(this.gameData.globalInterventions.map(intervention => intervention.id));
        const newInterventions = editorInterventionList.filter(intervention => !existingIds.has(intervention.id));
        this.gameData.globalInterventions = this.gameData.globalInterventions.concat(newInterventions);
        console.log(`Merged ${newInterventions.length} new editor interventions`);
    }}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RenalHospitalGame();
});

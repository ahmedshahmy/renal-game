class ScenarioEditor {
    constructor() {
        this.scenarios = [];
        this.interventions = [];
        this.globalInterventions = [
            'iv_fluids', 'diuretics', 'ace_inhibitor', 'insulin_therapy', 'hemodialysis',
            'sodium_bicarbonate', 'kayexalate', 'erythropoietin', 'phosphate_binder',
            'calcium_gluconate', 'blood_transfusion', 'nutritional_counseling'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateAvailableInterventions();
        this.loadFromLocalStorage();
        this.updatePreview();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Navigation
        document.getElementById('backToGame').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Scenario form
        document.getElementById('addScenario').addEventListener('click', () => this.addScenario());

        // Intervention form
        document.getElementById('addIntervention').addEventListener('click', () => this.addIntervention());

        // Effect management
        document.getElementById('addPrimaryEffect').addEventListener('click', () => {
            this.addEffectRow('primaryEffects', 'effect');
        });
        document.getElementById('addNegativeEffect').addEventListener('click', () => {
            this.addEffectRow('negativeEffects', 'negative');
        });
        document.getElementById('addCumulativeEffect').addEventListener('click', () => {
            this.addEffectRow('cumulativeEffects', 'cumulative');
        });
        
        // Intervention modifiers
        document.getElementById('addModifier').addEventListener('click', () => {
            this.addInterventionModifier();
        });

        // Export functions
        document.getElementById('exportJson').addEventListener('click', () => this.exportAsJson());
        document.getElementById('copyToClipboard').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());

        // Remove effect rows and modifiers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                e.target.closest('.effect-row').remove();
            }
            if (e.target.classList.contains('remove-modifier')) {
                e.target.closest('.modifier-card').remove();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update preview if switching to preview tab
        if (tabName === 'preview') {
            this.updatePreview();
        }
    }

    populateAvailableInterventions() {
        const container = document.getElementById('availableInterventions');
        
        this.globalInterventions.forEach(id => {
            const checkbox = document.createElement('div');
            checkbox.className = 'intervention-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" id="intervention_${id}" value="${id}">
                <label for="intervention_${id}">${this.formatInterventionName(id)}</label>
            `;
            container.appendChild(checkbox);
        });
    }

    formatInterventionName(id) {
        return id.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    addEffectRow(containerId, type) {
        const container = document.getElementById(containerId);
        const row = document.createElement('div');
        row.className = 'effect-row';
        
        const parameterClass = type === 'effect' ? 'effect-parameter' : 
                              type === 'negative' ? 'negative-parameter' : 'cumulative-parameter';
        const valueClass = type === 'effect' ? 'effect-value' : 
                          type === 'negative' ? 'negative-value' : 'cumulative-value';
        
        row.innerHTML = `
            <select class="${parameterClass}">
                <option value="">Select parameter...</option>
                <option value="health">Health</option>
                <option value="creatinine">Creatinine</option>
                <option value="bun">BUN</option>
                <option value="gfr">GFR</option>
                <option value="potassium">Potassium</option>
                <option value="sodium">Sodium</option>
                <option value="hemoglobin">Hemoglobin</option>
                <option value="heartRate">Heart Rate</option>
                <option value="respiratoryRate">Respiratory Rate</option>
                ${type === 'effect' ? '<option value="bloodPressure">Blood Pressure</option>' : ''}
            </select>
            <input type="number" class="${valueClass}" step="0.1" placeholder="${type === 'cumulative' ? 'Per-hour effect' : 'Effect value'}">
            <button type="button" class="btn-small btn-remove">Remove</button>
        `;
        
        container.appendChild(row);
    }

    collectEffects(containerId, parameterClass, valueClass) {
        const effects = {};
        const container = document.getElementById(containerId);
        const rows = container.querySelectorAll('.effect-row');
        
        rows.forEach(row => {
            const parameter = row.querySelector(`.${parameterClass}`).value;
            const value = parseFloat(row.querySelector(`.${valueClass}`).value);
            
            if (parameter && !isNaN(value)) {
                if (parameter === 'bloodPressure') {
                    // Handle blood pressure specially
                    effects[parameter] = value > 0 ? `increase_systolic_${Math.abs(value)}` : `decrease_both_${Math.abs(value)}`;
                } else {
                    effects[parameter] = value;
                }
            }
        });
        
        return effects;
    }

    validateScenario() {
        const required = [
            'scenarioId', 'scenarioTitle', 'scenarioDescription',
            'patientName', 'patientAge', 'patientGender',
            'initialBudget', 'initialHealth', 'targetHealth', 'timeLimit', 'deteriorationRate',
            'bloodPressure', 'heartRate', 'temperature', 'respiratoryRate',
            'creatinine', 'bun', 'gfr', 'potassium', 'sodium', 'hemoglobin'
        ];
        
        const errors = [];
        
        required.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                errors.push(`${this.formatFieldName(field)} is required`);
                element.closest('.form-group').classList.add('error');
            } else {
                element.closest('.form-group').classList.remove('error');
            }
        });
        
        // Validate blood pressure format
        const bp = document.getElementById('bloodPressure').value;
        if (bp && !bp.match(/^\d+\/\d+$/)) {
            errors.push('Blood pressure must be in format "120/80"');
        }
        
        // Validate at least one intervention is selected
        const selectedInterventions = document.querySelectorAll('#availableInterventions input:checked');
        if (selectedInterventions.length === 0) {
            errors.push('At least one intervention must be selected');
        }
        
        return errors;
    }

    validateIntervention() {
        const required = ['interventionId', 'interventionName', 'interventionDescription', 'interventionCost', 'timeRequired'];
        const errors = [];
        
        required.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                errors.push(`${this.formatFieldName(field)} is required`);
                element.closest('.form-group').classList.add('error');
            } else {
                element.closest('.form-group').classList.remove('error');
            }
        });
        
        // Validate at least one primary effect
        const primaryEffects = this.collectEffects('primaryEffects', 'effect-parameter', 'effect-value');
        if (Object.keys(primaryEffects).length === 0) {
            errors.push('At least one primary effect is required');
        }
        
        return errors;
    }

    formatFieldName(field) {
        return field.replace(/([A-Z])/g, ' $1')
                   .replace(/^./, str => str.toUpperCase())
                   .replace(/Id$/, ' ID');
    }

    addScenario() {
        const errors = this.validateScenario();
        
        if (errors.length > 0) {
            this.showMessage(errors.join('. '), 'error');
            return;
        }
        
        // Collect available interventions
        const availableInterventions = Array.from(
            document.querySelectorAll('#availableInterventions input:checked')
        ).map(cb => cb.value);
        
        const scenario = {
            id: document.getElementById('scenarioId').value.trim(),
            title: document.getElementById('scenarioTitle').value.trim(),
            description: document.getElementById('scenarioDescription').value.trim(),
            patient: {
                name: document.getElementById('patientName').value.trim(),
                age: parseInt(document.getElementById('patientAge').value),
                gender: document.getElementById('patientGender').value
            },
            initialBudget: parseInt(document.getElementById('initialBudget').value),
            initialHealth: parseInt(document.getElementById('initialHealth').value),
            targetHealth: parseInt(document.getElementById('targetHealth').value),
            timeLimit: parseInt(document.getElementById('timeLimit').value),
            deteriorationRate: parseFloat(document.getElementById('deteriorationRate').value),
            initialVitals: {
                bloodPressure: document.getElementById('bloodPressure').value.trim(),
                heartRate: parseInt(document.getElementById('heartRate').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                respiratoryRate: parseInt(document.getElementById('respiratoryRate').value)
            },
            initialLabs: {
                creatinine: parseFloat(document.getElementById('creatinine').value),
                bun: parseInt(document.getElementById('bun').value),
                gfr: parseInt(document.getElementById('gfr').value),
                potassium: parseFloat(document.getElementById('potassium').value),
                sodium: parseInt(document.getElementById('sodium').value),
                hemoglobin: parseFloat(document.getElementById('hemoglobin').value)
            },
            availableInterventions: availableInterventions,
            winCondition: "Stabilize patient and achieve target health"
        };
        
        // Add intervention modifiers if any
        const interventionModifiers = this.collectInterventionModifiers();
        if (Object.keys(interventionModifiers).length > 0) {
            scenario.interventionModifiers = interventionModifiers;
        };
        
        // Check for duplicate ID
        if (this.scenarios.find(s => s.id === scenario.id)) {
            this.showMessage('Scenario ID already exists', 'error');
            return;
        }
        
        this.scenarios.push(scenario);
        this.saveToLocalStorage();
        this.clearScenarioForm();
        this.showMessage('Scenario added successfully!', 'success');
        this.updatePreview();
    }

    addIntervention() {
        const errors = this.validateIntervention();
        
        if (errors.length > 0) {
            this.showMessage(errors.join('. '), 'error');
            return;
        }
        
        const intervention = {
            id: document.getElementById('interventionId').value.trim(),
            name: document.getElementById('interventionName').value.trim(),
            description: document.getElementById('interventionDescription').value.trim(),
            cost: parseInt(document.getElementById('interventionCost').value),
            timeRequired: parseInt(document.getElementById('timeRequired').value),
            effects: this.collectEffects('primaryEffects', 'effect-parameter', 'effect-value')
        };
        
        // Add negative effects if any
        const negativeEffects = this.collectEffects('negativeEffects', 'negative-parameter', 'negative-value');
        if (Object.keys(negativeEffects).length > 0) {
            intervention.negativeEffects = negativeEffects;
        }
        
        // Add cumulative effects if any
        const cumulativeEffects = this.collectEffects('cumulativeEffects', 'cumulative-parameter', 'cumulative-value');
        const duration = parseInt(document.getElementById('cumulativeDuration').value);
        if (Object.keys(cumulativeEffects).length > 0 && duration) {
            cumulativeEffects.duration = duration;
            intervention.cumulativeEffects = cumulativeEffects;
        }
        
        // Check for duplicate ID
        if (this.interventions.find(i => i.id === intervention.id)) {
            this.showMessage('Intervention ID already exists', 'error');
            return;
        }
        
        this.interventions.push(intervention);
        this.saveToLocalStorage();
        this.clearInterventionForm();
        this.showMessage('Intervention added successfully!', 'success');
        this.updatePreview();
    }

    clearScenarioForm() {
        // Clear all form fields
        const fields = [
            'scenarioId', 'scenarioTitle', 'scenarioDescription',
            'patientName', 'patientAge', 'initialBudget', 'initialHealth',
            'targetHealth', 'timeLimit', 'deteriorationRate',
            'bloodPressure', 'heartRate', 'temperature', 'respiratoryRate',
            'creatinine', 'bun', 'gfr', 'potassium', 'sodium', 'hemoglobin'
        ];
        
        fields.forEach(field => {
            document.getElementById(field).value = '';
        });
        
        // Reset gender select
        document.getElementById('patientGender').value = 'Male';
        
        // Uncheck all interventions
        document.querySelectorAll('#availableInterventions input').forEach(cb => {
            cb.checked = false;
        });
        
        // Clear intervention modifiers
        document.getElementById('interventionModifiers').innerHTML = '';
        
        // Remove validation classes
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
        });
    }

    clearInterventionForm() {
        const fields = [
            'interventionId', 'interventionName', 'interventionDescription',
            'interventionCost', 'timeRequired', 'cumulativeDuration'
        ];
        
        fields.forEach(field => {
            document.getElementById(field).value = '';
        });
        
        // Clear effect rows (keep one empty row)
        ['primaryEffects', 'negativeEffects', 'cumulativeEffects'].forEach(containerId => {
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div class="effect-row">
                    <select class="${containerId === 'primaryEffects' ? 'effect' : containerId === 'negativeEffects' ? 'negative' : 'cumulative'}-parameter">
                        <option value="">Select parameter...</option>
                        <option value="health">Health</option>
                        <option value="creatinine">Creatinine</option>
                        <option value="bun">BUN</option>
                        <option value="gfr">GFR</option>
                        <option value="potassium">Potassium</option>
                        <option value="sodium">Sodium</option>
                        <option value="hemoglobin">Hemoglobin</option>
                        <option value="heartRate">Heart Rate</option>
                        <option value="respiratoryRate">Respiratory Rate</option>
                        ${containerId === 'primaryEffects' ? '<option value="bloodPressure">Blood Pressure</option>' : ''}
                    </select>
                    <input type="number" class="${containerId === 'primaryEffects' ? 'effect' : containerId === 'negativeEffects' ? 'negative' : 'cumulative'}-value" step="0.1" placeholder="${containerId === 'cumulativeEffects' ? 'Per-hour effect' : 'Effect value'}">
                    <button type="button" class="btn-small btn-remove">Remove</button>
                </div>
            `;
        });
        
        // Remove validation classes
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
        });
    }

    updatePreview() {
        this.updateScenariosList();
        this.updateInterventionsList();
        this.updateJsonOutput();
    }

    updateScenariosList() {
        const container = document.getElementById('scenariosList');
        
        if (this.scenarios.length === 0) {
            container.innerHTML = '<p class="empty-message">No scenarios created yet.</p>';
            return;
        }
        
        container.innerHTML = this.scenarios.map(scenario => `
            <div class="item-card">
                <h4>${scenario.title}</h4>
                <p><strong>Patient:</strong> ${scenario.patient.name}, ${scenario.patient.age} years old</p>
                <p><strong>Budget:</strong> $${scenario.initialBudget} | <strong>Target Health:</strong> ${scenario.targetHealth}%</p>
                <p><strong>Available Interventions:</strong> ${scenario.availableInterventions.length}</p>
                <div class="item-meta">
                    <small>ID: ${scenario.id}</small>
                    <div class="item-actions">
                        <button class="btn-small btn-danger" onclick="editor.removeScenario('${scenario.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateInterventionsList() {
        const container = document.getElementById('interventionsList');
        
        if (this.interventions.length === 0) {
            container.innerHTML = '<p class="empty-message">No interventions created yet.</p>';
            return;
        }
        
        container.innerHTML = this.interventions.map(intervention => `
            <div class="item-card">
                <h4>${intervention.name}</h4>
                <p>${intervention.description}</p>
                <p><strong>Cost:</strong> $${intervention.cost} | <strong>Time:</strong> ${intervention.timeRequired}h</p>
                <p><strong>Effects:</strong> ${Object.keys(intervention.effects).length} primary
                   ${intervention.negativeEffects ? `, ${Object.keys(intervention.negativeEffects).length} negative` : ''}
                   ${intervention.cumulativeEffects ? `, cumulative (${intervention.cumulativeEffects.duration}h)` : ''}</p>
                <div class="item-meta">
                    <small>ID: ${intervention.id}</small>
                    <div class="item-actions">
                        <button class="btn-small btn-danger" onclick="editor.removeIntervention('${intervention.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateJsonOutput() {
        const output = {
            scenarios: this.scenarios,
            globalInterventions: [], // Will be populated with existing ones
            customInterventions: this.interventions
        };
        
        document.getElementById('jsonOutput').value = JSON.stringify(output, null, 2);
    }

    removeScenario(id) {
        if (confirm('Are you sure you want to remove this scenario?')) {
            this.scenarios = this.scenarios.filter(s => s.id !== id);
            this.saveToLocalStorage();
            this.updatePreview();
            this.showMessage('Scenario removed', 'warning');
        }
    }

    removeIntervention(id) {
        if (confirm('Are you sure you want to remove this intervention?')) {
            this.interventions = this.interventions.filter(i => i.id !== id);
            this.saveToLocalStorage();
            this.updatePreview();
            this.showMessage('Intervention removed', 'warning');
        }
    }

    exportAsJson() {
        const output = {
            scenarios: this.scenarios,
            customInterventions: this.interventions,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'renal-game-scenarios.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showMessage('JSON file downloaded!', 'success');
    }

    copyToClipboard() {
        const textarea = document.getElementById('jsonOutput');
        textarea.select();
        document.execCommand('copy');
        this.showMessage('JSON copied to clipboard!', 'success');
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all scenarios and interventions? This cannot be undone.')) {
            this.scenarios = [];
            this.interventions = [];
            this.saveToLocalStorage();
            this.updatePreview();
            this.showMessage('All data cleared', 'warning');
        }
    }

    showMessage(text, type) {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        // Insert at the top of the current tab
        const activeTab = document.querySelector('.tab-content.active');
        activeTab.insertBefore(message, activeTab.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    saveToLocalStorage() {
        localStorage.setItem('renalGameScenarios', JSON.stringify(this.scenarios));
        localStorage.setItem('renalGameInterventions', JSON.stringify(this.interventions));
    }

    addInterventionModifier() {
        const container = document.getElementById('interventionModifiers');
        const modifierId = `modifier_${Date.now()}`;
        
        const modifierCard = document.createElement('div');
        modifierCard.className = 'modifier-card';
        modifierCard.id = modifierId;
        
        modifierCard.innerHTML = `
            <div class="modifier-header">
                <div class="modifier-title">Intervention Modifier</div>
                <button type="button" class="btn-small btn-danger remove-modifier">Remove</button>
            </div>
            
            <div class="form-group">
                <select class="modifier-select" onchange="editor.updateModifierCard('${modifierId}')">
                    <option value="">Select intervention to modify...</option>
                    ${this.globalInterventions.map(id => `<option value="${id}">${this.formatInterventionName(id)}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <textarea class="modifier-description" placeholder="Describe how this intervention works differently in this scenario..." rows="2"></textarea>
            </div>
            
            <div class="modifier-effects">
                <div class="effects-grid">
                    <div class="effects-column positive">
                        <h6>Modified Effects</h6>
                        <div class="modifier-positive-effects"></div>
                        <button type="button" class="btn-small btn-secondary" onclick="editor.addModifierEffect('${modifierId}', 'positive')">Add Effect</button>
                    </div>
                    
                    <div class="effects-column negative">
                        <h6>Negative Effects</h6>
                        <div class="modifier-negative-effects"></div>
                        <button type="button" class="btn-small btn-secondary" onclick="editor.addModifierEffect('${modifierId}', 'negative')">Add Negative Effect</button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(modifierCard);
    }
    
    addModifierEffect(modifierId, type) {
        const container = document.querySelector(`#${modifierId} .modifier-${type}-effects`);
        const effectRow = document.createElement('div');
        effectRow.className = 'effect-row';
        
        effectRow.innerHTML = `
            <select class="effect-parameter">
                <option value="">Select parameter...</option>
                <option value="health">Health</option>
                <option value="creatinine">Creatinine</option>
                <option value="bun">BUN</option>
                <option value="gfr">GFR</option>
                <option value="potassium">Potassium</option>
                <option value="sodium">Sodium</option>
                <option value="hemoglobin">Hemoglobin</option>
                <option value="heartRate">Heart Rate</option>
                <option value="respiratoryRate">Respiratory Rate</option>
                ${type === 'positive' ? '<option value="bloodPressure">Blood Pressure</option>' : ''}
            </select>
            <input type="number" class="effect-value" step="0.1" placeholder="Effect value">
            <button type="button" class="btn-small btn-remove">Remove</button>
        `;
        
        container.appendChild(effectRow);
    }
    
    updateModifierCard(modifierId) {
        const card = document.getElementById(modifierId);
        const select = card.querySelector('.modifier-select');
        const title = card.querySelector('.modifier-title');
        
        if (select.value) {
            title.textContent = `Modifier: ${this.formatInterventionName(select.value)}`;
            card.classList.add('active');
        } else {
            title.textContent = 'Intervention Modifier';
            card.classList.remove('active');
        }
    }
    
    collectInterventionModifiers() {
        const modifiers = {};
        const modifierCards = document.querySelectorAll('.modifier-card');
        
        modifierCards.forEach(card => {
            const interventionSelect = card.querySelector('.modifier-select');
            const description = card.querySelector('.modifier-description');
            const interventionId = interventionSelect.value;
            
            if (interventionId) {
                const modifier = {
                    description: description.value.trim() || 'Modified effectiveness for this scenario'
                };
                
                // Collect positive effects
                const positiveEffects = {};
                const positiveRows = card.querySelectorAll('.modifier-positive-effects .effect-row');
                positiveRows.forEach(row => {
                    const parameter = row.querySelector('.effect-parameter').value;
                    const value = parseFloat(row.querySelector('.effect-value').value);
                    
                    if (parameter && !isNaN(value)) {
                        if (parameter === 'bloodPressure') {
                            positiveEffects[parameter] = value > 0 ? `increase_systolic_${Math.abs(value)}` : `decrease_both_${Math.abs(value)}`;
                        } else {
                            positiveEffects[parameter] = value;
                        }
                    }
                });
                
                if (Object.keys(positiveEffects).length > 0) {
                    modifier.effects = positiveEffects;
                }
                
                // Collect negative effects
                const negativeEffects = {};
                const negativeRows = card.querySelectorAll('.modifier-negative-effects .effect-row');
                negativeRows.forEach(row => {
                    const parameter = row.querySelector('.effect-parameter').value;
                    const value = parseFloat(row.querySelector('.effect-value').value);
                    
                    if (parameter && !isNaN(value)) {
                        negativeEffects[parameter] = value;
                    }
                });
                
                if (Object.keys(negativeEffects).length > 0) {
                    modifier.negativeEffects = negativeEffects;
                }
                
                // Only add if there are effects or description
                if (modifier.effects || modifier.negativeEffects || modifier.description !== 'Modified effectiveness for this scenario') {
                    modifiers[interventionId] = modifier;
                }
            }
        });
        
        return modifiers;
    }

    loadFromLocalStorage() {
        const scenarios = localStorage.getItem('renalGameScenarios');
        const interventions = localStorage.getItem('renalGameInterventions');
        
        if (scenarios) {
            this.scenarios = JSON.parse(scenarios);
        }
        
        if (interventions) {
            this.interventions = JSON.parse(interventions);
        }
    }
}

// Initialize the editor when the page loads
let editor;
document.addEventListener('DOMContentLoaded', () => {
    editor = new ScenarioEditor();
});

# Renal Hospital Management Game

A JavaScript-based medical simulation game focused on managing patients with renal (kidney) diseases. Players must make clinical decisions to stabilize patients while managing limited resources and time constraints.

## Game Overview

This educational game simulates the challenge of managing critically ill patients with various kidney conditions. Players take on the role of a healthcare provider who must:

- Assess patient conditions through vital signs and laboratory results
- Choose appropriate medical interventions from a dropdown menu
- Manage a limited budget for treatments
- Work against time as patient conditions can deteriorate
- Achieve target health levels to successfully discharge patients

## Features

- **Real-time animated clock** showing game time progression
- **Multiple renal disease scenarios** including:
  - Acute Kidney Injury
  - Chronic Kidney Disease Stage 4
  - Diabetic Nephropathy Crisis
- **Comprehensive patient monitoring** with:
  - Vital signs (blood pressure, heart rate, temperature, respiratory rate)
  - Laboratory results (creatinine, BUN, GFR, electrolytes, hemoglobin)
  - Visual health indicators with color-coded status
- **Medical interventions** specific to renal care:
  - IV fluid resuscitation
  - Diuretics (Furosemide)
  - ACE inhibitors
  - Emergency hemodialysis
  - Medication for hyperkalemia
  - And more...
- **Resource management** with budget constraints
- **Time pressure** as patient health deteriorates without intervention
- **Action logging** to track all interventions and outcomes

## How to Play

### Setup
1. Open `index.html` in a web browser
2. The game will automatically load a random scenario
3. Review the patient information and initial clinical data

### Gameplay
1. **Monitor Patient Status**: Watch vital signs and lab results for abnormal values (highlighted in red/yellow)
2. **Select Interventions**: Choose from the dropdown menu of available treatments
3. **Consider Costs**: Each intervention has a cost that depletes your budget
4. **Time Management**: Interventions take time to complete, and patient health deteriorates over time
5. **Track Progress**: Monitor the action log to see the timeline of your decisions

### Win Conditions
- **Success**: Achieve the target health level (varies by scenario)
- **Failure**: Patient health drops to 0, budget is depleted, or time runs out

### Controls
- **New Game**: Start a fresh scenario
- **Pause/Resume**: Pause the game timer
- **Intervention Dropdown**: Select medical treatments
- **Perform Intervention**: Execute the selected treatment

## Game Mechanics

### Time System
- Game starts at 8:00 AM
- 1 real second = 30 game minutes
- Each intervention takes 1-4 hours to complete
- Patient condition deteriorates every 30 game minutes without intervention

### Health System
- Health ranges from 0-100%
- Visual indicators: Green (stable), Yellow (deteriorating), Red (critical)
- Different scenarios have different target health levels for discharge

### Laboratory Values
Normal ranges are defined for all lab values:
- **Creatinine**: 0.6-1.2 mg/dL
- **BUN**: 7-20 mg/dL
- **GFR**: 90-120 mL/min
- **Potassium**: 3.5-5.0 mEq/L
- **Sodium**: 136-145 mEq/L
- **Hemoglobin**: 12.0-16.0 g/dL

Abnormal values are highlighted to help guide clinical decisions.

## Customization

### Adding New Scenarios
Edit the `scenarios.json` file to add new patient cases. Each scenario includes:
- Patient demographics
- Clinical description
- Initial budget and health
- Target health for discharge
- Time limit
- Initial vital signs and lab values
- Deterioration rate

### Adding New Interventions
Add new treatments to the `interventions` array in `scenarios.json`:
- Intervention name and description
- Cost and time requirements
- Effects on health, vital signs, and lab values
- Contraindications

## Educational Value

This game helps healthcare students and professionals:
- Practice clinical decision-making in renal care
- Understand the relationship between interventions and patient outcomes
- Learn about resource management in healthcare
- Experience time pressure in clinical settings
- Recognize normal vs. abnormal laboratory values
- Understand the progression of kidney diseases

## Technical Requirements

- Modern web browser with JavaScript enabled
- No additional installations required
- All assets are self-contained

## Files Structure

- `index.html` - Main game interface
- `styles.css` - Game styling and animations
- `game.js` - Core game logic and mechanics
- `scenarios.json` - Game data (scenarios, interventions, normal ranges)
- `README.md` - This documentation file

## Browser Compatibility

Compatible with all modern browsers including:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Credits

This educational game was designed to provide realistic medical training scenarios while maintaining engaging gameplay mechanics. The medical scenarios and interventions are based on current clinical practice guidelines for renal care.

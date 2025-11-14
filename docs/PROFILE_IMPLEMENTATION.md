# Profile and Auto-Budget Implementation

## Overview

The Profile system implements automatic budget calculation based on stipend amount and savings goals. When a user creates or updates their profile, the system automatically:

1. Calculates locked savings based on percentage goal
2. Divides remaining amount into weekly budgets
3. Stores budgets in the database
4. Provides verification that total budgets + locked savings = stipend

## API Endpoints

### POST /profile
Creates or updates user profile with automatic budget calculation.

**Request:**
```json
{
  "university": "University of Example",
  "city": "Example City",
  "currency": "USD",
  "stipendAmount": 1500,
  "disbursementFrequency": "monthly",
  "savingsGoalPct": 20,
  "weeks": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully with auto-budget calculation",
  "data": {
    "profile": {
      "id": "profile_id",
      "userId": "user_id",
      "university": "University of Example",
      "city": "Example City",
      "currency": "USD",
      "stipendAmount": 1500,
      "disbursementFrequency": "monthly",
      "savingsGoalPct": 20,
      "lockedSavings": 300,
      "weeks": 4
    },
    "budgets": [
      {
        "id": "budget_id_1",
        "userId": "user_id",
        "weekNumber": 1,
        "totalBudget": 300,
        "spentAmount": 0,
        "startDate": "2025-11-14T00:00:00.000Z",
        "endDate": "2025-11-20T00:00:00.000Z",
        "isActive": true
      },
      // ... 3 more weeks
    ],
    "calculations": {
      "totalStipend": 1500,
      "lockedSavings": 300,
      "remainingForBudgets": 1200,
      "weeklyBudget": 300,
      "totalWeeklyBudgets": 1200,
      "verification": {
        "totalBudgets": 1200,
        "plusLockedSavings": 300,
        "equalsStipend": 1500,
        "isValid": true
      }
    }
  }
}
```

### GET /profile
Retrieves user profile with computed budget values.

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile_id",
      "userId": "user_id",
      "university": "University of Example",
      "stipendAmount": 1500,
      "savingsGoalPct": 20,
      "lockedSavings": 300,
      "weeks": 4,
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "STUDENT"
      }
    },
    "budgets": [
      // Array of 4 weekly budgets
    ],
    "calculations": {
      "totalStipend": 1500,
      "lockedSavings": 300,
      "remainingForBudgets": 1200,
      "weeklyBudget": 300,
      "totalWeeklyBudgets": 1200,
      "verification": {
        "totalBudgets": 1200,
        "plusLockedSavings": 300,
        "equalsStipend": 1500,
        "isValid": true
      }
    }
  }
}
```

## Calculation Logic

### 1. Locked Savings Calculation
```javascript
lockedSavings = stipendAmount * (savingsGoalPct / 100)
```

**Example:**
- Stipend: $1500
- Savings Goal: 20%
- Locked Savings: $1500 × (20 / 100) = $300

### 2. Weekly Budget Calculation
```javascript
remainingAmount = stipendAmount - lockedSavings
weeklyBudget = remainingAmount / weeks
```

**Example:**
- Remaining: $1500 - $300 = $1200
- Weekly Budget: $1200 ÷ 4 = $300 per week

### 3. Verification
```javascript
totalWeeklyBudgets = weeklyBudget * weeks
isValid = (totalWeeklyBudgets + lockedSavings) === stipendAmount
```

**Example:**
- Total Weekly Budgets: $300 × 4 = $1200
- Verification: $1200 + $300 = $1500 ✅

## Database Schema

### Profile Table
```sql
CREATE TABLE Profile (
  id                    TEXT PRIMARY KEY,
  userId                TEXT UNIQUE NOT NULL,
  university            TEXT DEFAULT 'Not specified',
  city                  TEXT DEFAULT 'Not specified',
  currency              TEXT DEFAULT 'USD',
  stipendAmount         REAL DEFAULT 0,
  disbursementFrequency TEXT DEFAULT 'monthly',
  savingsGoalPct        REAL DEFAULT 20,
  lockedSavings         REAL DEFAULT 0,
  weeks                 INTEGER DEFAULT 4,
  createdAt             DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt             DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Budget Table
```sql
CREATE TABLE Budget (
  id           TEXT PRIMARY KEY,
  userId       TEXT NOT NULL,
  weekNumber   INTEGER NOT NULL,
  totalBudget  REAL NOT NULL,
  spentAmount  REAL DEFAULT 0,
  startDate    DATETIME NOT NULL,
  endDate      DATETIME NOT NULL,
  isActive     BOOLEAN DEFAULT FALSE
);
```

## Features

### ✅ Automatic Budget Creation
- Creates weekly budgets automatically when profile is saved
- Calculates equal weekly amounts from remaining stipend
- Sets appropriate start/end dates for each week
- Only first week is active initially

### ✅ Budget Recomputation
- Deletes existing budgets when profile is updated
- Recalculates all budgets with new values
- Maintains data consistency

### ✅ Validation
- Validates savings goal percentage (0-100%)
- Ensures stipend amount is provided
- Verifies mathematical accuracy of calculations

### ✅ Edge Case Handling
- **0% Savings Goal**: All money goes to weekly budgets
- **100% Savings Goal**: All money locked, $0 weekly budgets
- **Invalid Percentages**: Rejected with appropriate error

## Testing

### Test Coverage
- ✅ Profile creation with auto-budget calculation
- ✅ Locked savings calculation (stipend × goal%)
- ✅ Weekly budget division of remaining amount
- ✅ Budget storage in database
- ✅ Profile retrieval with computed values
- ✅ Budget recomputation on updates
- ✅ Validation: total budgets + locked savings = stipend
- ✅ Edge case handling (0%, 100%, invalid percentages)

### Test Scripts
```bash
# Test all profile functionality
node test-profile.js

# Test specific requirements
node test-requirements.js
```

## Usage Examples

### Creating a Profile
```javascript
const response = await axios.post('/profile', {
  stipendAmount: 1500,
  savingsGoalPct: 20,
  weeks: 4,
  university: 'My University',
  city: 'My City'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

console.log('Locked Savings:', response.data.data.calculations.lockedSavings);
console.log('Weekly Budget:', response.data.data.calculations.weeklyBudget);
```

### Retrieving Profile
```javascript
const response = await axios.get('/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

const { profile, budgets, calculations } = response.data.data;
console.log('Profile:', profile);
console.log('Budgets:', budgets.length);
console.log('Verification:', calculations.verification.isValid);
```

## Integration with Frontend

### Profile Form
```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await api.post('/profile', {
      stipendAmount: parseFloat(formData.stipend),
      savingsGoalPct: parseFloat(formData.savingsGoal),
      weeks: parseInt(formData.weeks),
      university: formData.university,
      city: formData.city
    });
    
    // Show success message
    setProfile(response.data.data.profile);
    setBudgets(response.data.data.budgets);
    
  } catch (error) {
    // Handle validation errors
    setError(error.response.data.message);
  }
};
```

### Budget Display
```javascript
const BudgetSummary = ({ calculations }) => (
  <div>
    <h3>Budget Breakdown</h3>
    <p>Total Stipend: ${calculations.totalStipend}</p>
    <p>Locked Savings: ${calculations.lockedSavings}</p>
    <p>Weekly Budget: ${calculations.weeklyBudget}</p>
    <p>Verification: {calculations.verification.isValid ? '✅' : '❌'}</p>
  </div>
);
```

## Security Considerations

### Authentication Required
- All profile endpoints require valid JWT token
- Users can only access their own profile data

### Input Validation
- Stipend amount must be positive number
- Savings goal percentage must be 0-100
- Weeks must be positive integer

### Data Integrity
- Mathematical verification ensures accuracy
- Database transactions ensure consistency
- Automatic cleanup of old budgets

## Performance Considerations

### Database Operations
- Uses upsert for profile updates (efficient)
- Batch deletion of old budgets
- Indexed queries for user data

### Calculation Efficiency
- Simple mathematical operations
- Minimal database queries
- Cached calculations in response

## Future Enhancements

### Potential Features
- **Variable Weekly Budgets**: Different amounts per week
- **Budget Categories**: Allocate weekly budget to categories
- **Rollover Logic**: Unused budget carries to next week
- **Savings Goals**: Multiple savings targets
- **Budget Alerts**: Notifications when approaching limits

### API Extensions
- `PUT /profile/budgets/:weekNumber` - Update specific week
- `POST /profile/budgets/rollover` - Move unused budget
- `GET /profile/analytics` - Spending analytics

The profile system provides a solid foundation for financial management with automatic budget calculation and verification. All requirements have been implemented and thoroughly tested.
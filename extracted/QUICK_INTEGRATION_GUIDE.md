# 🚀 Frontend-Backend Integration - Simple Steps

## Step-by-Step Guide to Connect Your Frontend

---

## 📋 Prerequisites

✅ Backend folder extracted  
✅ Backend running (`python main.py`)  
✅ Frontend project created (React/Vue/Angular)

---

## 🎯 5-Minute Setup

### Step 1: Start Backend (Terminal 1)

```bash
cd portfolio-backend
pip install -r requirements.txt
python main.py
```

✅ Backend running at: **http://localhost:8000**  
✅ API Docs at: **http://localhost:8000/docs**

---

### Step 2: Create API Config in Frontend

**Create file:** `src/config/api.js`

```javascript
// Copy this entire code
const API_BASE_URL = 'http://localhost:8000';

const API = {
  // Auth endpoints
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    me: `${API_BASE_URL}/api/auth/me`,
  },
  
  // Portfolio endpoints
  portfolios: {
    list: `${API_BASE_URL}/api/portfolios`,
    create: `${API_BASE_URL}/api/portfolios`,
    detail: (id) => `${API_BASE_URL}/api/portfolios/${id}`,
    addStock: (id) => `${API_BASE_URL}/api/portfolios/${id}/holdings`,
  },
  
  // Analytics endpoints
  analytics: {
    dashboard: `${API_BASE_URL}/api/analytics/dashboard`,
    metrics: (id) => `${API_BASE_URL}/api/analytics/portfolios/${id}/metrics`,
    complete: (id) => `${API_BASE_URL}/api/analytics/portfolios/${id}/complete`,
  }
};

export default API;
```

---

### Step 3: Create Auth Helper

**Create file:** `src/helpers/auth.js`

```javascript
// Token management
export const saveToken = (token) => {
  localStorage.setItem('access_token', token);
};

export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
};

// Get headers with token
export const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Check if logged in
export const isLoggedIn = () => {
  return !!getToken();
};
```

---

### Step 4: Use in Your Components

#### Example 1: Login Component

```javascript
import { useState } from 'react';
import API from './config/api';
import { saveToken } from './helpers/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Create form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(API.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        saveToken(data.access_token);
        alert('Login successful!');
        // Redirect to dashboard
      } else {
        alert('Login failed: ' + data.detail);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div>
      <input 
        placeholder="Username" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
```

#### Example 2: Get Portfolios

```javascript
import { useState, useEffect } from 'react';
import API from './config/api';
import { getHeaders } from './helpers/auth';

function PortfolioList() {
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(API.portfolios.list, {
        headers: getHeaders()
      });

      const data = await response.json();
      setPortfolios(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>My Portfolios</h2>
      {portfolios.map(p => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
}

export default PortfolioList;
```

#### Example 3: Create Portfolio

```javascript
import { useState } from 'react';
import API from './config/api';
import { getHeaders } from './helpers/auth';

function CreatePortfolio() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    try {
      const response = await fetch(API.portfolios.create, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name,
          description,
          is_default: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Portfolio created: ' + data.name);
        setName('');
        setDescription('');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Create Portfolio</h2>
      <input 
        placeholder="Portfolio Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea 
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}

export default CreatePortfolio;
```

#### Example 4: Add Stock

```javascript
import { useState } from 'react';
import API from './config/api';
import { getHeaders } from './helpers/auth';

function AddStock({ portfolioId }) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const handleAddStock = async () => {
    try {
      const response = await fetch(API.portfolios.addStock(portfolioId), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          quantity: parseFloat(quantity),
          average_buy_price: parseFloat(price)
        })
      });

      if (response.ok) {
        alert('Stock added successfully!');
        setSymbol('');
        setQuantity('');
        setPrice('');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div>
      <h3>Add Stock</h3>
      <input 
        placeholder="Symbol (e.g., AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <input 
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input 
        type="number"
        placeholder="Buy Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button onClick={handleAddStock}>Add Stock</button>
    </div>
  );
}

export default AddStock;
```

#### Example 5: Display Analytics

```javascript
import { useState, useEffect } from 'react';
import API from './config/api';
import { getHeaders } from './helpers/auth';

function Analytics({ portfolioId }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, [portfolioId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(API.analytics.metrics(portfolioId), {
        headers: getHeaders()
      });

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!metrics) return <div>Loading...</div>;

  return (
    <div>
      <h2>Portfolio Analytics</h2>
      <div>
        <p>Total Investment: ${metrics.total_investment.toLocaleString()}</p>
        <p>Current Value: ${metrics.current_value.toLocaleString()}</p>
        <p>Profit/Loss: ${metrics.profit_loss.toLocaleString()} 
           ({metrics.profit_loss_percentage.toFixed(2)}%)</p>
        <p>CAGR: {metrics.cagr.toFixed(2)}%</p>
        <p>Sharpe Ratio: {metrics.sharpe_ratio.toFixed(2)}</p>
        <p>Volatility: {metrics.volatility.toFixed(2)}%</p>
        <p>Diversification Score: {metrics.diversification_score}/100</p>
      </div>
    </div>
  );
}

export default Analytics;
```

---

## 🔍 Testing the Connection

### Quick Test in Browser Console

Open your frontend, open browser console (F12), and run:

```javascript
// Test 1: Check backend is running
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d));

// Test 2: After login, test authenticated request
fetch('http://localhost:8000/api/portfolios', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(d => console.log('Portfolios:', d));
```

---

## ✅ Complete Flow Example

### 1. User Registration → Login → Create Portfolio → Add Stock

```javascript
// Step 1: Register
const register = async () => {
  const response = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      username: 'testuser',
      password: 'test123456',
      risk_profile: 'Moderate'
    })
  });
  return response.json();
};

// Step 2: Login
const login = async () => {
  const formData = new URLSearchParams();
  formData.append('username', 'testuser');
  formData.append('password', 'test123456');
  
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
};

// Step 3: Create Portfolio
const createPortfolio = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:8000/api/portfolios', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'My First Portfolio',
      description: 'Tech stocks',
      is_default: true
    })
  });
  
  return response.json();
};

// Step 4: Add Stock
const addStock = async (portfolioId) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(
    `http://localhost:8000/api/portfolios/${portfolioId}/holdings`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symbol: 'AAPL',
        quantity: 10,
        average_buy_price: 150.00
      })
    }
  );
  
  return response.json();
};

// Run all steps
async function completeFlow() {
  await register();
  const loginData = await login();
  const portfolio = await createPortfolio();
  await addStock(portfolio.id);
  console.log('✅ All steps completed!');
}
```

---

## 🎨 Using with Chart.js

### Install Chart.js

```bash
npm install react-chartjs-2 chart.js
```

### Sector Allocation Pie Chart

```javascript
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import API from './config/api';
import { getHeaders } from './helpers/auth';

ChartJS.register(ArcElement, Tooltip, Legend);

function SectorChart({ portfolioId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/analytics/portfolios/${portfolioId}/sector-allocation`,
      { headers: getHeaders() }
    );
    
    const data = await response.json();
    
    setChartData({
      labels: data.map(s => s.sector),
      datasets: [{
        data: data.map(s => s.percentage),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }]
    });
  };

  if (!chartData) return <div>Loading...</div>;

  return <Pie data={chartData} />;
}
```

---

## 🐛 Common Issues

### Issue 1: CORS Error
**Error:** "Access to fetch blocked by CORS policy"

**Solution:** In backend `.env` file:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```
Restart backend after changing.

---

### Issue 2: 401 Unauthorized
**Error:** {"detail": "Could not validate credentials"}

**Solution:** Make sure you're sending the token:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
}
```

---

### Issue 3: Network Error
**Error:** "Failed to fetch"

**Solution:** 
1. Check backend is running: `http://localhost:8000/health`
2. Check URL is correct: `http://localhost:8000` (not https)

---

## 📦 Project Structure

```
your-frontend/
├── src/
│   ├── config/
│   │   └── api.js          ← API endpoints
│   ├── helpers/
│   │   └── auth.js         ← Token management
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PortfolioList.jsx
│   │   ├── AddStock.jsx
│   │   └── Analytics.jsx
│   └── App.jsx
```

---

## ✅ Checklist

- [ ] Backend running on port 8000
- [ ] Created `config/api.js`
- [ ] Created `helpers/auth.js`
- [ ] Login component working
- [ ] Token saved after login
- [ ] Can fetch portfolios
- [ ] Can create portfolio
- [ ] Can add stocks
- [ ] Can view analytics

---

## 🎉 You're Done!

Your frontend is now connected to the backend. Start building your components!

**Next Steps:**
1. Build your UI components
2. Add error handling
3. Add loading states
4. Style your application
5. Add charts for visualizations

**Need help?** Check the full guide: `FRONTEND_INTEGRATION.md`

---

**Happy Coding! 🚀**

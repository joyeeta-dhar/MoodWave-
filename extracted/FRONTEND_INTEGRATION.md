# Frontend-Backend Integration Guide
## Connecting Your React/Vue/Angular Frontend with FastAPI Backend

---

## 🎯 Overview

This guide shows you how to connect your frontend application with the Portfolio Management backend API.

---

## 📋 Table of Contents

1. [Quick Setup](#quick-setup)
2. [API Configuration](#api-configuration)
3. [Authentication Flow](#authentication-flow)
4. [Making API Calls](#making-api-calls)
5. [Example Implementations](#example-implementations)
6. [Error Handling](#error-handling)
7. [State Management](#state-management)

---

## 🚀 Quick Setup

### Step 1: Start the Backend

```bash
# In backend folder
cd portfolio-backend
pip install -r requirements.txt
python main.py
```

Backend will run at: `http://localhost:8000`

### Step 2: Configure Frontend CORS

The backend is already configured to accept requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

If your frontend runs on a different port, update `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:YOUR_PORT
```

---

## ⚙️ API Configuration

### Option 1: Create API Config File (Recommended)

**`src/config/api.js`** or **`src/config/api.ts`**

```javascript
// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    // Auth
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/me',
    
    // Portfolios
    PORTFOLIOS: '/api/portfolios',
    PORTFOLIO_DETAIL: (id) => `/api/portfolios/${id}`,
    HOLDINGS: (id) => `/api/portfolios/${id}/holdings`,
    HOLDING_DETAIL: (portfolioId, holdingId) => 
      `/api/portfolios/${portfolioId}/holdings/${holdingId}`,
    TRANSACTIONS: (id) => `/api/portfolios/${id}/transactions`,
    
    // Analytics
    METRICS: (id) => `/api/analytics/portfolios/${id}/metrics`,
    SECTOR_ALLOCATION: (id) => `/api/analytics/portfolios/${id}/sector-allocation`,
    STOCK_PERFORMANCE: (id) => `/api/analytics/portfolios/${id}/stock-performance`,
    GROWTH: (id) => `/api/analytics/portfolios/${id}/growth`,
    CORRELATION: (id) => `/api/analytics/portfolios/${id}/correlation`,
    RECOMMENDATIONS: (id) => `/api/analytics/portfolios/${id}/recommendations`,
    COMPLETE_ANALYTICS: (id) => `/api/analytics/portfolios/${id}/complete`,
    DASHBOARD: '/api/analytics/dashboard',
    
    // Chat
    CHAT: '/api/chat',
    CONCEPTS: '/api/chat/concepts',
    CONCEPT_DETAIL: (key) => `/api/chat/concepts/${key}`,
  }
};

export default API_CONFIG;
```

### Option 2: Environment Variables

**`.env`** (in frontend root):
```env
REACT_APP_API_URL=http://localhost:8000
# or for Vite
VITE_API_URL=http://localhost:8000
# or for Next.js
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🔐 Authentication Flow

### 1. Create Auth Service

**`src/services/authService.js`**

```javascript
import API_CONFIG from '../config/api';

class AuthService {
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('access_token');
  }

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('access_token', token);
  }

  // Remove token
  removeToken() {
    localStorage.removeItem('access_token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Register user
  async register(userData) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  // Login user
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  // Get current user
  async getCurrentUser() {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ME}`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  // Logout
  logout() {
    this.removeToken();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
```

### 2. Login Component Example

**`src/components/Login.jsx`**

```javascript
import { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      console.log('Logged in:', data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

---

## 🔌 Making API Calls

### 1. Create API Service

**`src/services/apiService.js`**

```javascript
import API_CONFIG from '../config/api';
import authService from './authService';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      // Handle errors
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiService();
```

### 2. Portfolio Service

**`src/services/portfolioService.js`**

```javascript
import apiService from './apiService';
import API_CONFIG from '../config/api';

class PortfolioService {
  // Get all portfolios
  async getPortfolios() {
    return apiService.get(API_CONFIG.ENDPOINTS.PORTFOLIOS);
  }

  // Get portfolio by ID
  async getPortfolio(id) {
    return apiService.get(API_CONFIG.ENDPOINTS.PORTFOLIO_DETAIL(id));
  }

  // Create portfolio
  async createPortfolio(data) {
    return apiService.post(API_CONFIG.ENDPOINTS.PORTFOLIOS, data);
  }

  // Update portfolio
  async updatePortfolio(id, data) {
    return apiService.put(API_CONFIG.ENDPOINTS.PORTFOLIO_DETAIL(id), data);
  }

  // Delete portfolio
  async deletePortfolio(id) {
    return apiService.delete(API_CONFIG.ENDPOINTS.PORTFOLIO_DETAIL(id));
  }

  // Add stock to portfolio
  async addStock(portfolioId, stockData) {
    return apiService.post(
      API_CONFIG.ENDPOINTS.HOLDINGS(portfolioId),
      stockData
    );
  }

  // Update holding
  async updateHolding(portfolioId, holdingId, data) {
    return apiService.put(
      API_CONFIG.ENDPOINTS.HOLDING_DETAIL(portfolioId, holdingId),
      data
    );
  }

  // Delete holding
  async deleteHolding(portfolioId, holdingId) {
    return apiService.delete(
      API_CONFIG.ENDPOINTS.HOLDING_DETAIL(portfolioId, holdingId)
    );
  }

  // Get transactions
  async getTransactions(portfolioId) {
    return apiService.get(API_CONFIG.ENDPOINTS.TRANSACTIONS(portfolioId));
  }
}

export default new PortfolioService();
```

### 3. Analytics Service

**`src/services/analyticsService.js`**

```javascript
import apiService from './apiService';
import API_CONFIG from '../config/api';

class AnalyticsService {
  // Get portfolio metrics
  async getMetrics(portfolioId) {
    return apiService.get(API_CONFIG.ENDPOINTS.METRICS(portfolioId));
  }

  // Get sector allocation
  async getSectorAllocation(portfolioId) {
    return apiService.get(API_CONFIG.ENDPOINTS.SECTOR_ALLOCATION(portfolioId));
  }

  // Get stock performance
  async getStockPerformance(portfolioId) {
    return apiService.get(API_CONFIG.ENDPOINTS.STOCK_PERFORMANCE(portfolioId));
  }

  // Get portfolio growth
  async getGrowth(portfolioId, period = '1y') {
    return apiService.get(
      `${API_CONFIG.ENDPOINTS.GROWTH(portfolioId)}?period=${period}`
    );
  }

  // Get recommendations
  async getRecommendations(portfolioId) {
    return apiService.get(API_CONFIG.ENDPOINTS.RECOMMENDATIONS(portfolioId));
  }

  // Get complete analytics
  async getCompleteAnalytics(portfolioId) {
    return apiService.get(API_CONFIG.ENDPOINTS.COMPLETE_ANALYTICS(portfolioId));
  }

  // Get dashboard data
  async getDashboard() {
    return apiService.get(API_CONFIG.ENDPOINTS.DASHBOARD);
  }
}

export default new AnalyticsService();
```

---

## 📱 Example Component Implementations

### 1. Dashboard Component

**`src/components/Dashboard.jsx`**

```javascript
import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import portfolioService from '../services/portfolioService';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Portfolio Dashboard</h1>
      
      {dashboardData.map((portfolio) => (
        <div key={portfolio.portfolio_id} className="portfolio-card">
          <h2>{portfolio.portfolio_name}</h2>
          
          <div className="metrics">
            <div className="metric">
              <span>Total Value:</span>
              <strong>${portfolio.total_value.toLocaleString()}</strong>
            </div>
            <div className="metric">
              <span>Profit/Loss:</span>
              <strong 
                className={portfolio.profit_loss >= 0 ? 'positive' : 'negative'}
              >
                ${portfolio.profit_loss.toLocaleString()} 
                ({portfolio.profit_loss_percentage.toFixed(2)}%)
              </strong>
            </div>
          </div>

          <div className="top-performers">
            <h3>Top Performers</h3>
            {portfolio.top_performers.map((stock) => (
              <div key={stock.symbol}>
                {stock.symbol}: +{stock.profit_loss_percentage.toFixed(2)}%
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
```

### 2. Portfolio List Component

**`src/components/PortfolioList.jsx`**

```javascript
import { useState, useEffect } from 'react';
import portfolioService from '../services/portfolioService';
import { Link } from 'react-router-dom';

function PortfolioList() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const data = await portfolioService.getPortfolios();
      setPortfolios(data);
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await portfolioService.deletePortfolio(id);
        loadPortfolios(); // Reload list
      } catch (error) {
        alert('Error deleting portfolio');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="portfolio-list">
      <h2>My Portfolios</h2>
      
      <Link to="/portfolios/create">
        <button>Create New Portfolio</button>
      </Link>

      <div className="portfolios">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="portfolio-item">
            <h3>{portfolio.name}</h3>
            <p>{portfolio.description}</p>
            {portfolio.is_default && <span className="badge">Default</span>}
            
            <div className="actions">
              <Link to={`/portfolios/${portfolio.id}`}>View</Link>
              <button onClick={() => handleDelete(portfolio.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioList;
```

### 3. Add Stock Component

**`src/components/AddStock.jsx`**

```javascript
import { useState } from 'react';
import portfolioService from '../services/portfolioService';

function AddStock({ portfolioId, onSuccess }) {
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    average_buy_price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const stockData = {
        symbol: formData.symbol.toUpperCase(),
        quantity: parseFloat(formData.quantity),
        average_buy_price: parseFloat(formData.average_buy_price)
      };

      await portfolioService.addStock(portfolioId, stockData);
      
      // Reset form
      setFormData({ symbol: '', quantity: '', average_buy_price: '' });
      
      // Call success callback
      if (onSuccess) onSuccess();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-stock-form">
      <h3>Add Stock</h3>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="symbol"
          placeholder="Stock Symbol (e.g., AAPL)"
          value={formData.symbol}
          onChange={handleChange}
          required
        />
        
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          step="0.01"
          required
        />
        
        <input
          type="number"
          name="average_buy_price"
          placeholder="Buy Price"
          value={formData.average_buy_price}
          onChange={handleChange}
          step="0.01"
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Stock'}
        </button>
      </form>
    </div>
  );
}

export default AddStock;
```

### 4. Analytics Chart Component (with Chart.js)

**`src/components/SectorAllocationChart.jsx`**

```javascript
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import analyticsService from '../services/analyticsService';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function SectorAllocationChart({ portfolioId }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [portfolioId]);

  const loadData = async () => {
    try {
      const data = await analyticsService.getSectorAllocation(portfolioId);
      
      setChartData({
        labels: data.map(item => item.sector),
        datasets: [{
          label: 'Sector Allocation',
          data: data.map(item => item.percentage),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
        }]
      });
    } catch (error) {
      console.error('Error loading sector data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading chart...</div>;
  if (!chartData) return <div>No data available</div>;

  return (
    <div className="chart-container">
      <h3>Sector Allocation</h3>
      <Pie data={chartData} />
    </div>
  );
}

export default SectorAllocationChart;
```

---

## ❌ Error Handling

### Create Error Handler Utility

**`src/utils/errorHandler.js`**

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};
```

---

## 🗂️ State Management

### Using Context API (React)

**`src/context/AuthContext.jsx`**

```javascript
import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        authService.logout();
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Usage in App.jsx:**

```javascript
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Your routes */}
      </Router>
    </AuthProvider>
  );
}
```

---

## 🔒 Protected Routes

**`src/components/ProtectedRoute.jsx`**

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

**Usage:**

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/portfolios"
          element={
            <ProtectedRoute>
              <PortfolioList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

---

## 📦 Installation (Frontend Dependencies)

```bash
# For Chart.js
npm install react-chartjs-2 chart.js

# For routing
npm install react-router-dom

# For Axios (alternative to fetch)
npm install axios
```

---

## 🧪 Testing API Connection

**`src/utils/testApi.js`**

```javascript
import API_CONFIG from '../config/api';

export const testConnection = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Backend connected:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Call this in your App.jsx on mount
```

---

## ✅ Complete Integration Checklist

- [ ] Backend is running on port 8000
- [ ] Frontend API config created
- [ ] Auth service implemented
- [ ] API service with error handling created
- [ ] Token stored in localStorage
- [ ] Protected routes configured
- [ ] CORS configured in backend .env
- [ ] Test API connection on app load
- [ ] Error handling implemented
- [ ] Loading states added to components

---

## 🎯 Quick Test

1. **Start backend:** `python main.py`
2. **Start frontend:** `npm start`
3. **Register a user**
4. **Create a portfolio**
5. **Add a stock**
6. **View analytics**

---

## 📞 Common Issues & Solutions

### Issue: CORS Error
**Solution:** Add your frontend URL to backend `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000
```

### Issue: 401 Unauthorized
**Solution:** Check if token is being sent in headers:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Issue: Network Error
**Solution:** Ensure backend is running on port 8000

### Issue: Token expired
**Solution:** Implement token refresh or redirect to login

---

**You're now ready to connect your frontend! 🚀**

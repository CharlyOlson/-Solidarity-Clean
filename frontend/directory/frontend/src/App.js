/*
 * SOLIDARITY PLATFORM - MAIN APP WITH TAB NAVIGATION
 * ===================================================
 * 
 * TRADEMARK: Scott Charles Olson - March 31, 1997
 */
import React, { useState, useEffect } from 'react';
import HankoStamps from './components/HankoStamps';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Ensure demo token exists on app load
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'hanko':
        return <HankoStamps />;
      case 'home':
      default:
        return <div>Welcome to the Solidarity Platform!</div>;
    }
  };

  return (
    <div className="app">
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>SOLIDARITY PLATFORM</h1>
          <p className="trademark">© Scott Charles Olson - φ = 1.618</p>
        </div>
        <div className="nav-tabs">
          <button
            className={activeTab === 'home' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('home')}
          >
            🏠 HOME
          </button>
          <button
            className={activeTab === 'hanko' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('hanko')}
          >
            🎴 Hanko Stamps
          </button>
        </div>
      </nav>
      <main className="tab-content">
        {renderTab()}
      </main>
    </div>
  );
}

export default App;

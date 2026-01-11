
import React, { useState } from 'react';
import HankoStamps from './components/HankoStamps';
import RepoBrowser from './components/RepoBrowser';

function App() {
  const [activeTab, setActiveTab] = useState('home');


  const renderTab = () => {
    switch (activeTab) {
      case 'hanko':
        return <HankoStamps />;
      case 'files':
        return <RepoBrowser />;
      case 'home':
      default:
        return <div>Welcome to the Solidarity Platform!</div>;
    }
  };

  return (
    <div className="app">
      {/* Main Navigation */}
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
            className={activeTab === 'files' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('files')}
          >
            📁 Files
          </button>
          <button
            className={activeTab === 'hanko' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('hanko')}
          >
            🎴 Hanko Stamps
          </button>
        </div>
      </nav>
      {/* Tab Content */}
      <main className="tab-content">
        {renderTab()}
      </main>
    </div>
  );
}

export default App;


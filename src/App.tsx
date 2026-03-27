import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Home from './pages/Home';
import VendorDashboard from './pages/VendorDashboard';
import ShopPage from './pages/ShopPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
        <Navbar user={user} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<VendorDashboard user={user} />} />
            <Route path="/shop/:vendorId" element={<ShopPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
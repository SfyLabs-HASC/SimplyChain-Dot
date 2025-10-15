
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import VideoSection from './components/VideoSection';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Privacy from './pages/Privacy';
import Pricing from './pages/Pricing';
import Docs from './pages/Docs';
import Contatti from './pages/Contatti';
import Dashboard from './pages/Dashboard';
import SfyAdmin from './pages/SfyAdmin';
import Form from './pages/Form';
import RicaricaCrediti from './pages/RicaricaCrediti';
import Notarizzazione from './pages/Notarizzazione';
import NotFound from './pages/NotFound';
import AuthEffects from './components/AuthEffects';
import CookieBanner from './components/CookieBanner';
 

const App: React.FC = () => {
  const hideChrome = false;
  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">
      <AuthEffects />
      {!hideChrome && <Header />}
      {/* Pre-mount hidden connect button to warm-up thirdweb modal */}
      {!hideChrome && (
        <div className="hidden">
          <Header />
        </div>
      )}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <VideoSection />
                <Features />
                <HowItWorks />
              </>
            }
          />
          
          <Route path="/termini" element={<Terms />} />
          <Route path="/cookie" element={<Cookies />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/prezzi" element={<Pricing />} />
          <Route path="/documentazione" element={<Docs />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sfyadmin" element={<SfyAdmin />} />
          <Route path="/form" element={<Form />} />
          <Route path="/ricaricacrediti" element={<RicaricaCrediti />} />
          <Route path="/notarizzazione" element={<Notarizzazione />} />
          {/* Piani page removed */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
      {!hideChrome && <CookieBanner />}
    </div>
  );
};

export default App;

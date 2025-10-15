
import React, { useEffect, useState } from 'react';
import { ChainIcon } from './icons/ChainIcon';
import { Link, useLocation } from 'react-router-dom';
import AuthButton from './AuthButton';
import { useActiveAccount } from 'thirdweb/react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActiveCompany, setIsActiveCompany] = useState<boolean>(false);

  const baseLinks = [
    { name: 'Ricarica', href: '/ricaricacrediti' },
    { name: 'Documentazione', href: '/documentazione' },
    { name: 'Contatti', href: '/contatti' },
  ];

  const account = useActiveAccount();
  const location = useLocation();
  const includeMetamask = location.pathname === '/sfyadmin';
  const disableAA = location.pathname === '/sfyadmin';

  useEffect(() => {
    const checkActive = async () => {
      try {
        if (!account?.address) {
          setIsActiveCompany(false);
          return;
        }
        const r = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
        if (!r.ok) { setIsActiveCompany(false); return; }
        const j = await r.json().catch(() => ({}));
        setIsActiveCompany(Boolean(j?.isActive));
      } catch { setIsActiveCompany(false); }
    };
    checkActive();
  }, [account?.address]);

  const navLinks = isActiveCompany
    ? [...baseLinks, { name: 'Dashboard', href: '/dashboard' }]
    : baseLinks;
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <ChainIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-slate-900">SimplyChain</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex md:space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-base font-medium text-slate-600 hover:text-primary transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <AuthButton label="Accedi" includeMetamask={includeMetamask} disableAA={disableAA} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-primary hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-primary hover:bg-slate-100">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            <div className="px-2">
               <div className="px-2">
                 <AuthButton label="Accedi" includeMetamask={includeMetamask} disableAA={disableAA} className="w-full justify-center" />
               </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

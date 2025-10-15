import React, { useEffect, useRef } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { getContract } from 'thirdweb/contract';
import { createThirdwebClient } from 'thirdweb';
import { arbitrum } from 'thirdweb/chains';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthEffects: React.FC = () => {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const prevAddressRef = useRef<string | undefined>(undefined);
  const client = createThirdwebClient({ clientId: (import.meta as any).env?.VITE_THIRDWEB_CLIENT_ID || '' });
  const contract = getContract({ client, chain: arbitrum, address: '0x71efb9364a896973b80786541c3a431bcf6c7efa' });
  const { data: ownerAddress } = useReadContract({
    contract,
    method: 'function owner() view returns (address)',
    params: [],
  });

  const { data: isAbilitata } = useReadContract({
    contract,
    method: 'function aziendeAbilitate(address) view returns (bool)',
    params: [account?.address || '0x0000000000000000000000000000000000000000'],
  });

  useEffect(() => {
    const prev = prevAddressRef.current;
    const curr = account?.address;
    
    console.log('AuthEffects - prev:', prev, 'curr:', curr, 'isAbilitata:', isAbilitata, 'location:', location.pathname);
    
    // Detect disconnect: went from defined to undefined
    if (prev && !curr) {
      console.log('Disconnect detected, redirecting to home');
      if (location.pathname !== '/') {
        navigate('/', { replace: false });
      }
    }
    
    // Detect connect: Handle redirect based on company status and current page
    if (!prev && curr && isAbilitata !== undefined) {
      console.log('Connect detected, checking company status...', 'isAbilitata:', isAbilitata, 'current page:', location.pathname);
      
      if (isAbilitata === false) {
        // Not enabled: always redirect to form and show 'richiesta inviata' if già inviata
        console.log('Company not enabled, redirecting to form');
        navigate('/form', { replace: false });
      } else if (isAbilitata === true) {
        // Enabled: check current page
        if (location.pathname === '/') {
          // From homepage: go to dashboard
          console.log('From homepage, redirecting to dashboard');
          navigate('/dashboard', { replace: false });
        } else if (location.pathname === '/dashboard') {
          // Already on dashboard: stay here
          console.log('Already on dashboard, staying here');
          // No redirect needed
        } else {
          // Any other page: stay on current page
          console.log('On other page, staying on current page:', location.pathname);
          // No redirect needed
        }
      }
    }
    
    // Check if already connected and on dashboard - verify if still enabled
    if (prev && curr && location.pathname === '/dashboard' && isAbilitata !== undefined) {
      console.log('Already connected on dashboard, checking if still enabled...', 'isAbilitata:', isAbilitata);
      if (isAbilitata === false) {
        console.log('No longer enabled, redirecting to form');
        navigate('/form', { replace: false });
      }
    }
    
    prevAddressRef.current = curr;
  }, [account?.address, isAbilitata, navigate, location.pathname]);

  return null;
};

export default AuthEffects;


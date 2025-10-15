import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

interface Company {
  id: string;
  email: string;
  nome: string;
  settore: string;
  isActive: boolean;
  pending: boolean;
  crediti?: number;
  createdAt?: Date;
  activatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, nome: string, settore: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user is admin
        const adminEmail = 'sfy.startup@gmail.com';
        setIsAdmin(user.email === adminEmail);
        
        // Get company data
        try {
          const companyDoc = await getDoc(doc(db, 'companies', user.uid));
          if (companyDoc.exists()) {
            setCompany(companyDoc.data() as Company);
          } else {
            setCompany(null);
          }
        } catch (error) {
          console.error('Error fetching company data:', error);
          setCompany(null);
        }
      } else {
        setCompany(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signUp = async (email: string, password: string, nome: string, settore: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create company document
    const companyData: Company = {
      id: user.uid,
      email,
      nome,
      settore,
      isActive: false,
      pending: true,
      crediti: 0,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'companies', user.uid), companyData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value: AuthContextType = {
    user,
    company,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signUp,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
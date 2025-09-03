import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { User, Plan, Subscription, Payment } from '../types';

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  paymentHistory: Payment[];
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, pass: string, plan: Plan) => boolean;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would be an API call. We'll simulate a user database.
const FAKE_USERS: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@quickshift.com', plan: 'Pro Plus', avatarUrl: null }
];

const FAKE_SUBSCRIPTION: Subscription = {
    plan: 'Pro Plus',
    startDate: new Date('2023-01-15'),
    nextPaymentDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15),
    renewalDate: new Date(new Date().getFullYear() + 1, 0, 15),
};

const FAKE_PAYMENTS: Payment[] = [
    { id: 'pay-1', date: new Date(new Date().setMonth(new Date().getMonth() -1)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
    { id: 'pay-2', date: new Date(new Date().setMonth(new Date().getMonth() -2)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
    { id: 'pay-3', date: new Date(new Date().setMonth(new Date().getMonth() -3)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
    { id: 'pay-4', date: new Date(new Date().setMonth(new Date().getMonth() -4)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
];


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, pass: string): boolean => {
    // In a real app, you'd verify the password hash. Here we just check the email.
    const foundUser = FAKE_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = (name: string, email: string, pass: string, plan: Plan): boolean => {
    const exists = FAKE_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        return false; // User already exists
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        plan,
        avatarUrl: null,
    };
    FAKE_USERS.push(newUser);
    setUser(newUser);
    return true;
  };

  const updateUser = (updatedData: Partial<User>) => {
      setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, ...updatedData };
          // Persist change to our fake user DB
          const userIndex = FAKE_USERS.findIndex(u => u.id === updatedUser.id);
          if (userIndex !== -1) {
              FAKE_USERS[userIndex] = updatedUser;
          }
          return updatedUser;
      });
  };

  const value = useMemo(() => ({ 
    user, 
    login, 
    logout, 
    register, 
    updateUser,
    subscription: user ? FAKE_SUBSCRIPTION : null,
    paymentHistory: user ? FAKE_PAYMENTS : [],
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
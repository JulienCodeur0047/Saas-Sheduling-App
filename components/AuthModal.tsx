import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plan, User } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
    initialPlan?: Plan;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', initialPlan = 'Gratuit' }) => {
    const [view, setView] = useState(initialView);
    const { login, register } = useAuth();
    const { t } = useLanguage();
    const [error, setError] = useState('');
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState<Plan>(initialPlan);

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setPlan(initialPlan);
            setError('');
            // Reset fields
            setName('');
            setEmail('');
            setPassword('');
        }
    }, [isOpen, initialView, initialPlan]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!login(email, password)) {
            setError(t('auth.invalidCredentials'));
        } else {
            onClose();
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!register(name, email, password, plan)) {
            setError(t('auth.emailExists'));
        } else {
            onClose();
        }
    };

    const toggleView = () => {
        setError('');
        setView(view === 'login' ? 'register' : 'login');
    };
    
    const title = view === 'login' ? t('auth.welcomeBack') : t('auth.createAccount');

    const toggleText = view === 'login' 
        ? t('auth.dontHaveAccount', { signUp: `<button class="font-semibold text-blue-600 hover:underline">${t('auth.signUp')}</button>` })
        : t('auth.alreadyHaveAccount', { signIn: `<button class="font-semibold text-blue-600 hover:underline">${t('auth.signIn')}</button>` });


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center mb-4">
                 <p 
                    className="text-sm text-gray-600 dark:text-gray-400"
                    onClick={(e) => { if((e.target as HTMLElement).tagName === 'BUTTON') toggleView()}}
                    dangerouslySetInnerHTML={{ __html: toggleText }}
                 >
                 </p>
            </div>

            {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 py-2 rounded-md">{error}</p>}
            
            {view === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="login-email" className="label-style">{t('auth.emailLabel')}</label>
                        <input id="login-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="label-style">{t('auth.passwordLabel')}</label>
                        <input id="login-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                    </div>
                    <button type="submit" className="w-full button-primary">{t('auth.signIn')}</button>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                     <div>
                        <label htmlFor="register-name" className="label-style">{t('auth.fullNameLabel')}</label>
                        <input id="register-name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="register-email" className="label-style">{t('auth.emailLabel')}</label>
                        <input id="register-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="register-password" className="label-style">{t('auth.passwordLabel')}</label>
                        <input id="register-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="plan" className="label-style">{t('auth.selectedPlanLabel')}</label>
                        <select id="plan" name="plan" value={plan} onChange={e => setPlan(e.target.value as Plan)} className="input-style appearance-none">
                            <option value="Gratuit">{t('pricing.freePlanName')} ($0{t('pricing.perMonth')})</option>
                            <option value="Pro">{t('pricing.proPlanName')} ($10{t('pricing.perMonth')})</option>
                            <option value="Pro Plus">{t('pricing.proPlusPlanName')} ($20{t('pricing.perMonth')})</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full button-primary">{t('auth.createAccountButton')}</button>
                </form>
            )}
             <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; }
                .dark .label-style { color: #D1D5DB; }
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
                .button-primary { padding: 0.625rem 1.25rem; background-color: #2563EB; color: #FFFFFF; font-weight: 600; border-radius: 0.375rem; transition-property: background-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
                .button-primary:hover { background-color: #1D4ED8; }
            `}</style>
        </Modal>
    );
};

export default AuthModal;
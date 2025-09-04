import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plan, BusinessType, ActivitySector } from '../types';
import { Briefcase, Check } from 'lucide-react';

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
    const [businessType, setBusinessType] = useState<BusinessType>('Company');
    const [activitySector, setActivitySector] = useState<ActivitySector | ''>('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setPlan(initialPlan);
            setError('');
            // Reset fields
            setName('');
            setEmail('');
            setPassword('');
            setBusinessType('Company');
            setActivitySector('');
            setCompanyName('');
            setAddress('');
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

        const finalCompanyName = companyName.trim() || name.trim();

        const registrationData = {
            name,
            email,
            plan,
            businessType,
            companyName: finalCompanyName,
            ...(activitySector && { activitySector }),
            ...(address && { address }),
        };
        
        if (!register(registrationData, password)) {
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
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="5xl">
            <div className="grid md:grid-cols-2 md:gap-12 min-h-[550px] text-gray-900 dark:text-gray-100">
                {/* Left side: Form */}
                <div className="flex flex-col">
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
                        <form onSubmit={handleLogin} className="space-y-4 flex-grow flex flex-col justify-center">
                            <div>
                                <label htmlFor="login-email" className="label-style">{t('auth.emailLabel')}</label>
                                <input id="login-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="label-style">{t('auth.passwordLabel')}</label>
                                <input id="login-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                            </div>
                            <button type="submit" className="w-full button-primary mt-4">{t('auth.signIn')}</button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4 overflow-y-auto pr-2">
                            <h4 className="font-semibold border-b dark:border-blue-night-700 pb-1">{t('profile.profileDetails')}</h4>
                            <div>
                                <label htmlFor="register-name" className="label-style">{t('auth.fullNameLabel')}</label>
                                <input id="register-name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="register-email" className="label-style">{t('auth.emailLabel')}</label>
                                    <input id="register-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                                </div>
                                <div>
                                    <label htmlFor="register-password" className="label-style">{t('auth.passwordLabel')}</label>
                                    <input id="register-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                                </div>
                            </div>

                            <h4 className="font-semibold border-b dark:border-blue-night-700 pb-1 pt-2">{t('auth.companyInfo')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="businessType" className="label-style">{t('auth.businessTypeLabel')}</label>
                                    <select id="businessType" name="businessType" value={businessType} onChange={e => setBusinessType(e.target.value as BusinessType)} className="input-style appearance-none">
                                        <option value="Company">{t('auth.businessTypeCompany')}</option>
                                        <option value="Individual">{t('auth.businessTypeIndividual')}</option>
                                        <option value="Other">{t('auth.businessTypeOther')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="activitySector" className="label-style">{t('auth.activitySectorLabel')}</label>
                                    <select id="activitySector" name="activitySector" value={activitySector} onChange={e => setActivitySector(e.target.value as ActivitySector)} className="input-style appearance-none">
                                        <option value="">-- {t('modals.none')} --</option>
                                        <option value="Individual">{t('auth.activitySectorIndividual')}</option>
                                        <option value="Health">{t('auth.activitySectorHealth')}</option>
                                        <option value="Technology">{t('auth.activitySectorTechnology')}</option>
                                        <option value="Administration">{t('auth.activitySectorAdministration')}</option>
                                        <option value="Finance">{t('auth.activitySectorFinance')}</option>
                                        <option value="Commerce">{t('auth.activitySectorCommerce')}</option>
                                        <option value="Social">{t('auth.activitySectorSocial')}</option>
                                        <option value="Other">{t('auth.activitySectorOther')}</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="companyName" className="label-style">{t('auth.companyNameLabel')}</label>
                                <input id="companyName" name="companyName" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={t('auth.companyNamePlaceholder')} required className="input-style" />
                            </div>
                             <div>
                                <label htmlFor="address" className="label-style">{t('auth.addressLabel')}</label>
                                <input id="address" name="address" type="text" value={address} onChange={e => setAddress(e.target.value)} className="input-style" />
                            </div>

                            <h4 className="font-semibold border-b dark:border-blue-night-700 pb-1 pt-2">{t('auth.selectedPlanLabel')}</h4>
                            <div>
                                <select id="plan" name="plan" value={plan} onChange={e => setPlan(e.target.value as Plan)} className="input-style appearance-none">
                                    <option value="Gratuit">{t('pricing.freePlanName')} - {t('pricing.freePlanPrice')}{t('pricing.perMonth')}</option>
                                    <option value="Pro">{t('pricing.proPlanName')} - {t('pricing.proPlanPrice')}{t('pricing.perMonth')}</option>
                                    <option value="Pro Plus">{t('pricing.proPlusPlanName')} - {t('pricing.proPlusPlanPrice')}{t('pricing.perMonth')}</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full button-primary mt-4">{t('auth.createAccountButton')}</button>
                        </form>
                    )}
                </div>
                
                {/* Right side: Info/Payment */}
                <div className="hidden md:flex flex-col">
                    {view === 'login' && (
                        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-blue-night-950 p-8 rounded-lg h-full">
                            <Briefcase className="w-16 h-16 text-blue-600" />
                            <h3 className="mt-4 text-2xl font-bold text-center text-gray-800 dark:text-white">{t('appName')}</h3>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                {t('landingPage.heroSubtitle')}
                            </p>
                        </div>
                    )}

                    {view === 'register' && (
                        <div className="bg-gray-50 dark:bg-blue-night-950 p-6 rounded-lg h-full flex flex-col justify-center">
                            {plan === 'Gratuit' ? (
                                <div>
                                    <h3 className="text-xl font-bold">{t('pricing.freePlanName')}</h3>
                                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('pricing.freePlanDesc')}</p>
                                    <ul className="mt-6 space-y-3 text-sm">
                                        <li className="flex items-center"><Check size={16} className="text-green-500 mr-2 flex-shrink-0" /> <span>{t('pricing.freePlanFeature1')}</span></li>
                                        <li className="flex items-center"><Check size={16} className="text-green-500 mr-2 flex-shrink-0" /> <span>{t('pricing.freePlanFeature2')}</span></li>
                                        <li className="flex items-center"><Check size={16} className="text-green-500 mr-2 flex-shrink-0" /> <span>{t('pricing.freePlanFeature3')}</span></li>
                                    </ul>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">{t('auth.paymentDetails')}</h3>
                                    <div className="p-3 border dark:border-blue-night-700 rounded-md mb-4 bg-white dark:bg-blue-night-900">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-semibold">{plan === 'Pro' ? t('pricing.proPlanName') : t('pricing.proPlusPlanName')}</span>
                                            <span className="font-bold">{plan === 'Pro' ? t('pricing.proPlanPrice') : t('pricing.proPlusPlanPrice')}{t('pricing.perMonth')}</span>
                                        </div>
                                    </div>
                                    <form className="space-y-3">
                                        <div>
                                            <label htmlFor="cardName" className="label-style !text-xs">{t('auth.cardholderName')}</label>
                                            <input id="cardName" type="text" placeholder="John Doe" className="input-style !py-2 !text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="cardNumber" className="label-style !text-xs">{t('auth.cardNumber')}</label>
                                            <input id="cardNumber" type="text" placeholder="•••• •••• •••• ••••" className="input-style !py-2 !text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="cardExpiry" className="label-style !text-xs">{t('auth.expiryDate')}</label>
                                                <input id="cardExpiry" type="text" placeholder="MM/YY" className="input-style !py-2 !text-sm" />
                                            </div>
                                            <div>
                                                <label htmlFor="cardCvc" className="label-style !text-xs">{t('auth.cvc')}</label>
                                                <input id="cardCvc" type="text" placeholder="•••" className="input-style !py-2 !text-sm" />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
             <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; text-align: left; }
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
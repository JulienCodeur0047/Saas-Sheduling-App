import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plan, BusinessType, ActivitySector } from '../types';
import { Check, Calendar, Users, BarChart3, CalendarOff, MailCheck } from 'lucide-react';
import Logo from './Logo';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'register';
    initialPlan?: Plan;
}

type AuthView = 'login' | 'register' | 'forgotPassword' | 'forgotPasswordSuccess';

const PlanSelector: React.FC<{ selectedPlan: Plan, onSelect: (plan: Plan) => void }> = ({ selectedPlan, onSelect }) => {
    const { t } = useLanguage();
    const plans: Plan[] = ['Gratuit', 'Pro', 'Pro Plus'];
    const planKeys: { [key in Plan]: string } = {
        'Gratuit': 'freePlan',
        'Pro': 'proPlan',
        'Pro Plus': 'proPlusPlan',
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            {plans.map(plan => {
                const planKey = planKeys[plan];
                const isSelected = selectedPlan === plan;
                return (
                    <div
                        key={plan}
                        onClick={() => onSelect(plan)}
                        className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${isSelected ? 'border-blue-600 dark:border-blue-night-300 bg-blue-50 dark:bg-blue-night-800' : 'border-gray-200 dark:border-blue-night-700 hover:border-gray-400'}`}
                    >
                        <p className="font-bold text-sm">{t(`pricing.${planKey}Name`)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t(`pricing.${planKey}Price`)}</p>
                    </div>
                )
            })}
        </div>
    );
};

const FeatureItem: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-night-800">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    </div>
);


const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', initialPlan = 'Pro' }) => {
    const [authView, setAuthView] = useState<AuthView>(initialView);
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
            setAuthView(initialView);
            setPlan(initialPlan);
            setError('');
            // Reset fields
            setName('');
            setEmail(authView === 'login' ? email : ''); // Keep email if coming back to login
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
    
    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // Simulate API call
        console.log(`Password reset requested for: ${email}`);
        // For security, always show success to prevent user enumeration
        setAuthView('forgotPasswordSuccess');
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const finalCompanyName = companyName.trim() || name.trim();
        if (!finalCompanyName) {
            setError(t('auth.companyNameRequired'));
            return;
        }

        if (plan !== 'Gratuit') {
            console.log(`User ${email} is proceeding to payment for plan: ${plan}. Company: ${finalCompanyName}`);
            // In a real app, save form state and redirect to a payment page.
            // For now, we just close the modal as a simulation of the next step.
            alert(t('auth.redirectToPayment'));
            onClose();
            return;
        }

        // Handle free plan registration directly
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

    const getTitle = () => {
        switch (authView) {
            case 'login': return t('auth.welcomeBack');
            case 'register': return t('auth.createAccount');
            case 'forgotPassword': return t('auth.forgotPasswordTitle');
            case 'forgotPasswordSuccess': return t('auth.resetLinkSentTitle');
            default: return '';
        }
    };
    
    const toggleText = authView === 'login' 
        ? t('auth.dontHaveAccount', { signUp: `<button class="font-semibold text-blue-600 hover:underline dark:text-blue-night-200">${t('auth.signUp')}</button>` })
        : t('auth.alreadyHaveAccount', { signIn: `<button class="font-semibold text-blue-600 hover:underline dark:text-blue-night-200">${t('auth.signIn')}</button>` });

    const planDetails: { [key in Plan]: { key: string; featureCount: number } } = {
        'Gratuit': { key: 'freePlan', featureCount: 3 },
        'Pro': { key: 'proPlan', featureCount: 4 },
        'Pro Plus': { key: 'proPlusPlan', featureCount: 4 },
    };
    const selectedPlanDetails = planDetails[plan];
    const selectedPlanFeatures = Array.from({ length: selectedPlanDetails.featureCount }, (_, i) => t(`pricing.${selectedPlanDetails.key}Feature${i + 1}`));

    const buttonPrimaryClasses = "w-full py-2.5 px-5 bg-blue-600 text-white font-semibold rounded-md transition-colors hover:bg-blue-700 dark:bg-blue-night-200 dark:text-blue-night-900 dark:hover:bg-blue-night-300";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="5xl">
            <div className={`grid md:grid-cols-2 md:gap-10 ${authView === 'register' ? 'min-h-[640px]' : ''} text-gray-900 dark:text-gray-100`}>
                {/* Left side: Form */}
                <div className="flex flex-col">
                     {(authView === 'login' || authView === 'register') && (
                        <div className="text-center mb-4">
                            <p 
                                className="text-sm text-gray-600 dark:text-gray-400"
                                onClick={(e) => { if((e.target as HTMLElement).tagName === 'BUTTON') setAuthView(authView === 'login' ? 'register' : 'login')}}
                                dangerouslySetInnerHTML={{ __html: toggleText }}
                            >
                            </p>
                        </div>
                    )}

                    {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 py-2 rounded-md">{error}</p>}
                    
                    {authView === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4 flex-grow flex flex-col justify-center">
                            <div>
                                <label htmlFor="login-email" className="label-style">{t('auth.emailLabel')}</label>
                                <input id="login-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="label-style">{t('auth.passwordLabel')}</label>
                                <input id="login-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-style" />
                            </div>
                             <div className="text-right">
                                <a href="#" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-night-200" onClick={(e) => {e.preventDefault(); setAuthView('forgotPassword'); setError('');}}>
                                    {t('auth.forgotPassword')}
                                </a>
                            </div>
                            <button type="submit" className={buttonPrimaryClasses}>{t('auth.signIn')}</button>
                            
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                                <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">{t('auth.orSeparator')}</span>
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            
                            <div className="space-y-3">
                                <button 
                                    type="button" 
                                    className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-blue-night-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled
                                    title="Coming soon"
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="mr-2 flex-shrink-0">
                                        <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                                        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                                        <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29H0.957275C0.347727 8.51727 0 10.035 0 11.29C0 8.70682 0.527273 6.26318 1.42636 4.95818L4.335 7.20636C4.13636 7.74636 4.03364 8.32318 4.03364 8.95C4.03364 8.40682 3.78409 7.83 3.96409 7.29V10.71Z" fill="#FBBC05"/>
                                        <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                                    </svg>
                                    {t('auth.continueWithGoogle')}
                                </button>
                            </div>
                        </form>
                    )}
                    {authView === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4 overflow-y-auto pr-2 -mr-2">
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
                            <PlanSelector selectedPlan={plan} onSelect={setPlan} />
                            
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-blue-night-950 rounded-lg">
                                <h5 className="font-bold text-base">{t(`pricing.${selectedPlanDetails.key}Name`)} - {t(`pricing.${selectedPlanDetails.key}Desc`)}</h5>
                                <ul className="mt-2 space-y-2 text-sm">
                                    {selectedPlanFeatures.map((feature, index) => (
                                         <li key={index} className="flex items-start">
                                            <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" /> 
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button type="submit" className={`${buttonPrimaryClasses} mt-4`}>
                                {plan === 'Gratuit' ? t('auth.createAccountButton') : t('auth.goToPayment')}
                            </button>
                        </form>
                    )}
                    {authView === 'forgotPassword' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4 flex-grow flex flex-col justify-center">
                            <p className="text-sm text-center text-gray-600 dark:text-gray-400">{t('auth.forgotPasswordInstruction')}</p>
                            <div>
                                <label htmlFor="forgot-email" className="label-style">{t('auth.emailLabel')}</label>
                                <input id="forgot-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                            </div>
                            <button type="submit" className={buttonPrimaryClasses}>{t('auth.sendResetLink')}</button>
                            <div className="text-center">
                                <button type="button" onClick={() => setAuthView('login')} className="font-semibold text-blue-600 hover:underline dark:text-blue-night-200 text-sm">
                                    {t('auth.backToLogin')}
                                </button>
                            </div>
                        </form>
                    )}
                    {authView === 'forgotPasswordSuccess' && (
                        <div className="flex flex-col items-center justify-center text-center h-full py-8">
                            <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-full">
                                <MailCheck className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold">{t('auth.resetLinkSentTitle')}</h3>
                            <p
                                className="mt-2 text-sm text-gray-600 dark:text-gray-400"
                                dangerouslySetInnerHTML={{
                                    __html: t('auth.resetLinkSentBody', { email: `<strong class="font-medium">${email}</strong>` })
                                }}
                            />
                            <button onClick={() => setAuthView('login')} className={`mt-6 ${buttonPrimaryClasses}`}>
                                {t('auth.backToLogin')}
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Right side: Info */}
                <div className="hidden md:flex flex-col bg-gray-50 dark:bg-blue-night-950 p-8 rounded-lg h-full">
                    {authView === 'register' ? (
                        <div className="flex flex-col justify-center h-full">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('auth.features.title')}</h3>
                            <div className="space-y-5">
                                <FeatureItem 
                                    icon={<Calendar size={24} className="text-blue-500 dark:text-blue-night-300"/>}
                                    title={t('auth.features.feature1Title')}
                                    description={t('auth.features.feature1Desc')}
                                />
                                <FeatureItem 
                                    icon={<Users size={24} className="text-blue-500 dark:text-blue-night-300"/>}
                                    title={t('auth.features.feature2Title')}
                                    description={t('auth.features.feature2Desc')}
                                />
                                <FeatureItem 
                                    icon={<BarChart3 size={24} className="text-blue-500 dark:text-blue-night-300"/>}
                                    title={t('auth.features.feature3Title')}
                                    description={t('auth.features.feature3Desc')}
                                />
                                <FeatureItem 
                                    icon={<CalendarOff size={24} className="text-blue-500 dark:text-blue-night-300"/>}
                                    title={t('auth.features.feature4Title')}
                                    description={t('auth.features.feature4Desc')}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Logo className="w-16 h-16" />
                            <h3 className="mt-4 text-2xl font-bold text-center text-gray-800 dark:text-white">{t('appName')}</h3>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                {t('landingPage.heroSubtitle')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
             <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: #374151; text-align: left; }
                .dark .label-style { color: #D1D5DB; }
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; background-color: #FFFFFF; color: #111827; }
                .dark .input-style { border-color: #4B5563; background-color: #1F2937; color: #F9FAFB; }
            `}</style>
        </Modal>
    );
};

export default AuthModal;

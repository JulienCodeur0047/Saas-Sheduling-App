import React from 'react';
import { Briefcase, Calendar, Users, BarChart, FileDown, Smartphone, Globe, LogIn } from 'lucide-react';
import Pricing from './Pricing';
import ThemeToggle from './ThemeToggle';
import { Plan } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: (plan: Plan) => void;
}

const LandingHeader: React.FC<{ onLoginClick: () => void, onRegisterClick: (plan: Plan) => void }> = ({ onLoginClick, onRegisterClick }) => {
  const { t } = useLanguage();
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 bg-white/80 dark:bg-blue-night-950/80 backdrop-blur-sm z-40">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Briefcase className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold ml-3 text-gray-800 dark:text-white">{t('appName')}</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{t('landingPage.navFeatures')}</a>
          <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{t('landingPage.navPricing')}</a>
        </nav>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <button onClick={onLoginClick} className="hidden md:flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
            <LogIn size={16} className="mr-2" />
            {t('landingPage.login')}
          </button>
          <button onClick={() => onRegisterClick('Pro')} className="hidden md:block bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
            {t('landingPage.getStarted')}
          </button>
        </div>
      </div>
    </header>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-night-800 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-50 dark:bg-blue-night-950 text-gray-800 dark:text-gray-300 font-sans">
      <LandingHeader onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

      <main>
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32 px-6">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white"
              dangerouslySetInnerHTML={{
                __html: t('landingPage.heroTitle', {
                  simplified: `<span class="text-blue-600">${t('landingPage.heroTitleSimplified')}</span>`
                })
              }}
            >
            </h2>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
              {t('landingPage.heroSubtitle')}
            </p>
            <button onClick={() => onRegisterClick('Gratuit')} className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 transform hover:scale-105">
              {t('landingPage.startForFree')}
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-blue-night-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('landingPage.featuresTitle')}</h2>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
                    {t('landingPage.featuresSubtitle')}
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard icon={<Calendar size={24} className="text-blue-600"/>} title={t('landingPage.interactiveCalendarTitle')}>
                    {t('landingPage.interactiveCalendarDesc')}
                </FeatureCard>
                <FeatureCard icon={<Users size={24} className="text-blue-600"/>} title={t('landingPage.personnelManagementTitle')}>
                    {t('landingPage.personnelManagementDesc')}
                </FeatureCard>
                <FeatureCard icon={<BarChart size={24} className="text-blue-600"/>} title={t('landingPage.completeDashboardTitle')}>
                    {t('landingPage.completeDashboardDesc')}
                </FeatureCard>
                <FeatureCard icon={<FileDown size={24} className="text-blue-600"/>} title={t('landingPage.easyExportTitle')}>
                    {t('landingPage.easyExportDesc')}
                </FeatureCard>
                 <FeatureCard icon={<Smartphone size={24} className="text-blue-600"/>} title={t('landingPage.mobileAppTitle')}>
                    {t('landingPage.mobileAppDesc')}
                </FeatureCard>
                <FeatureCard icon={<Globe size={24} className="text-blue-600"/>} title={t('landingPage.multiSiteTitle')}>
                    {t('landingPage.multiSiteDesc')}
                </FeatureCard>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('landingPage.pricingTitle')}</h2>
                <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
                    {t('landingPage.pricingSubtitle')}
                </p>
            </div>
            <Pricing onSelectPlan={onRegisterClick} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-blue-night-950 border-t border-gray-200 dark:border-blue-night-900">
        <div className="container mx-auto px-6 py-6 text-center text-gray-500 dark:text-gray-400">
            <p>{t('landingPage.footer', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
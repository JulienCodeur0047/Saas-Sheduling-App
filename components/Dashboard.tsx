import React, { useState, useRef, useEffect } from 'react';
import { Users, Clock, Hourglass, UserMinus, CalendarOff, Download, DollarSign } from 'lucide-react';
import { Shift, Employee, Absence, AbsenceType, Role } from '../types';
import Avatar from './Avatar';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
        <div className="bg-blue-100 dark:bg-blue-night-800 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

interface DashboardProps {
    employees: Employee[];
    shifts: Shift[];
    absences: Absence[];
    absenceTypes: AbsenceType[];
    roles: Role[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees, shifts, absences, absenceTypes, roles }) => {
    const { t } = useLanguage();
    const { formatCurrency } = useCurrency();
    const totalEmployees = employees.length;
    
    const currentWeekShifts = shifts.filter(s => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);
        return s.startTime >= startOfWeek && s.startTime <= endOfWeek;
    });

    const totalShifts = currentWeekShifts.length;
    
    const totalHours = currentWeekShifts.reduce((acc, shift) => {
        const duration = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
        return acc + duration;
    }, 0);

    const mockAverageWage = 25; // Example average wage
    const laborCost = totalHours * mockAverageWage;

    const totalAbsences = absences.length;
    
    const upcomingShifts = shifts
        .filter(s => s.startTime > new Date())
        .sort((a,b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, 5);
        
    const upcomingAbsences = absences
        .filter(a => a.startDate > new Date())
        .sort((a,b) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, 3);
        
    const hoursByRole = roles.map(role => {
        const hours = currentWeekShifts.reduce((acc, shift) => {
            const employee = employees.find(e => e.id === shift.employeeId);
            if (employee && employee.role === role.name) {
                return acc + (shift.endTime.getTime() - shift.startTime.getTime()) / 3600000;
            }
            return acc;
        }, 0);
        return { name: role.name, hours };
    });

    const maxHours = Math.max(...hoursByRole.map(r => r.hours), 1);
    
    const formatDateRange = (start: Date, end: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        if (start.getDate() === end.getDate()) {
            return start.toLocaleDateString(undefined, options);
        }
        return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
    }

    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = (period: 'week' | '2weeks' | 'month') => {
        setIsExportMenuOpen(false);

        const endDate = new Date();
        const startDate = new Date();
        let daysToSubtract = 7;
        let periodLabel = 'Last_7_Days';

        if (period === '2weeks') {
            daysToSubtract = 14;
            periodLabel = 'Last_14_Days';
        } else if (period === 'month') {
            daysToSubtract = 30;
            periodLabel = 'Last_30_Days';
        }
        startDate.setDate(endDate.getDate() - daysToSubtract);
        startDate.setHours(0, 0, 0, 0);

        const shiftsToExport = shifts.filter(s =>
            s.startTime >= startDate && s.startTime <= endDate
        );

        const employeeData = new Map<string, { name: string; role: string; totalShifts: number; totalHours: number }>();
        employees.forEach(emp => {
            employeeData.set(emp.id, {
                name: emp.name,
                role: emp.role,
                totalShifts: 0,
                totalHours: 0,
            });
        });

        shiftsToExport.forEach(shift => {
            if (shift.employeeId && employeeData.has(shift.employeeId)) {
                const data = employeeData.get(shift.employeeId)!;
                data.totalShifts += 1;
                const duration = (shift.endTime.getTime() - shift.startTime.getTime()) / 3600000;
                data.totalHours += duration;
            }
        });

        let csvContent = "Employee Name,Role,Total Shifts,Total Hours\n";
        employeeData.forEach(data => {
            if (data.totalShifts > 0) {
                 const row = [
                    `"${data.name}"`,
                    data.role,
                    data.totalShifts,
                    data.totalHours.toFixed(2)
                ].join(',');
                csvContent += row + "\n";
            }
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `work_report_${periodLabel}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('dashboard.title')}</h2>
                 <div className="relative" ref={exportMenuRef}>
                    <button 
                        onClick={() => setIsExportMenuOpen(prev => !prev)} 
                        className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        <Download size={20} className="mr-2" />
                        {t('dashboard.exportReport')}
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-blue-night-900 border border-gray-200 dark:border-blue-night-800 rounded-md shadow-lg z-20 py-1">
                            <a onClick={() => handleExport('week')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-blue-night-800 cursor-pointer">{t('dashboard.last7Days')}</a>
                            <a onClick={() => handleExport('2weeks')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-blue-night-800 cursor-pointer">{t('dashboard.last14Days')}</a>
                            <a onClick={() => handleExport('month')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-blue-night-800 cursor-pointer">{t('dashboard.last30Days')}</a>
                        </div>
                    )}
                 </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('dashboard.totalEmployees')} value={totalEmployees.toString()} icon={<Users className="text-blue-500 dark:text-blue-night-300" />} />
                <StatCard title={t('dashboard.shiftsThisWeek')} value={totalShifts.toString()} icon={<Clock className="text-green-500 dark:text-blue-night-300" />} />
                <StatCard title={t('dashboard.totalHoursScheduled')} value={`${totalHours.toFixed(1)}h`} icon={<Hourglass className="text-yellow-500 dark:text-blue-night-300" />} />
                <StatCard title={t('dashboard.laborCost')} value={formatCurrency(laborCost)} icon={<DollarSign className="text-purple-500 dark:text-blue-night-300" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('dashboard.upcomingShifts')}</h3>
                    <div className="space-y-4">
                        {upcomingShifts.length > 0 ? upcomingShifts.map(shift => {
                            const employee = employees.find(e => e.id === shift.employeeId);
                            if (!employee) return null;
                            return (
                                <div key={shift.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-blue-night-800 rounded-lg">
                                    <div className="flex items-center">
                                        <Avatar name={employee.name} src={employee.avatarUrl} className="w-8 h-8 rounded-full mr-3"/>
                                        <span className="font-medium">{employee.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{shift.startTime.toLocaleDateString()}</span>
                                    <span className="text-sm font-mono bg-blue-100 dark:bg-blue-night-950 px-2 py-1 rounded">
                                        {shift.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {shift.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            );
                        }) : <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noUpcomingShifts')}</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                     <h3 className="text-xl font-bold mb-4">{t('dashboard.hoursByRole')}</h3>
                     <div className="space-y-4">
                        {hoursByRole.map(role => (
                            <div key={role.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">{role.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{role.hours.toFixed(1)}h</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-blue-night-800 rounded-full h-2.5">
                                    <div className="bg-blue-600 dark:bg-blue-night-400 h-2.5 rounded-full" style={{width: `${(role.hours / maxHours) * 100}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="mt-8 bg-white dark:bg-blue-night-900 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">{t('dashboard.upcomingAbsences')}</h3>
                <div className="space-y-4">
                    {upcomingAbsences.length > 0 ? upcomingAbsences.map(absence => {
                        const employee = employees.find(e => e.id === absence.employeeId);
                        const absenceType = absenceTypes.find(at => at.id === absence.absenceTypeId);
                        if (!employee || !absenceType) return null;
                        return (
                            <div key={absence.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-blue-night-800 rounded-lg">
                                <div className="flex items-center">
                                    <Avatar name={employee.name} src={employee.avatarUrl} className="w-8 h-8 rounded-full mr-3"/>
                                    <span className="font-medium">{employee.name}</span>
                                </div>
                                <span style={{color: absenceType.color}} className="font-semibold text-sm">{absenceType.name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDateRange(absence.startDate, absence.endDate)}</span>
                            </div>
                        );
                    }) : <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noUpcomingAbsences')}</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
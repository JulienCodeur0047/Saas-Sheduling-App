import React, { useState, useEffect } from 'react';
import { Shift, Employee, Location, Department, Absence, AbsenceType, SpecialDay, SpecialDayType, EmployeeAvailability, AvailabilityStatus, TimeBlock } from '../types';
import { Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface ShiftEditorProps {
    shift: Shift | null;
    employees: Employee[];
    locations: Location[];
    departments: Department[];
    selectedDate: Date | null;
    allAbsences: Absence[];
    absenceTypes: AbsenceType[];
    allSpecialDays: SpecialDay[];
    allSpecialDayTypes: SpecialDayType[];
    allEmployeeAvailabilities: EmployeeAvailability[];
    onSave: (shift: Shift) => void;
    onCancel: () => void;
    onDelete?: (shiftId: string) => void;
}

const toInputDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const toInputTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const getTimeBlock = (date: Date): TimeBlock => {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
};

const getAvailabilityForShift = (employeeId: string, startTime: Date, endTime: Date, allAvailabilities: EmployeeAvailability[]): AvailabilityStatus => {
    const availabilityData = allAvailabilities.find(a => a.employeeId === employeeId);
    if (!availabilityData) return 'available'; // Default if no data

    const dayOfWeek = (startTime.getDay() + 6) % 7; // Monday = 0
    const dayAvailability = availabilityData.availability[dayOfWeek];

    const startBlock = getTimeBlock(startTime);
    const endBlock = getTimeBlock(endTime);
    
    // Create a set of all blocks this shift touches
    const blocks = new Set<TimeBlock>();
    blocks.add(startBlock);
    blocks.add(endBlock);
    if (startBlock === 'morning' && endBlock === 'evening') {
        blocks.add('afternoon');
    }

    const statuses = Array.from(blocks).map(block => dayAvailability[block]);

    if (statuses.includes('unavailable')) return 'unavailable';
    if (statuses.every(s => s === 'preferred')) return 'preferred';
    return 'available';
};


const ShiftEditor: React.FC<ShiftEditorProps> = (props) => {
    const { 
        shift, employees, locations, departments, selectedDate, allAbsences, absenceTypes,
        allSpecialDays, allSpecialDayTypes, allEmployeeAvailabilities, onSave, onCancel, onDelete 
    } = props;
    const { t } = useLanguage();
    const { user } = useAuth();
    
    const getInitialState = () => {
        const date = shift?.startTime || selectedDate || new Date();
        
        const defaultStartTime = new Date(date);
        defaultStartTime.setHours(9, 0, 0, 0);

        const defaultEndTime = new Date(date);
        defaultEndTime.setHours(17, 0, 0, 0);

        return {
            employeeId: shift?.employeeId || '', // Default to unassigned
            startDate: toInputDateString(shift?.startTime || date),
            startTime: toInputTimeString(shift?.startTime || defaultStartTime),
            endDate: toInputDateString(shift?.endTime || date),
            endTime: toInputTimeString(shift?.endTime || defaultEndTime),
            locationId: shift?.locationId || '',
            departmentId: shift?.departmentId || '',
        };
    };

    const [formData, setFormData] = useState(getInitialState);
    const [error, setError] = useState<string | null>(null);
    const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('available');

    useEffect(() => {
        setFormData(getInitialState());
    }, [shift, selectedDate, employees, locations, departments]);

    useEffect(() => {
        if (formData.employeeId) {
            const newStartTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const newEndTime = new Date(`${formData.endDate}T${formData.endTime}`);
            if (newEndTime > newStartTime) {
                const status = getAvailabilityForShift(formData.employeeId, newStartTime, newEndTime, allEmployeeAvailabilities);
                setAvailabilityStatus(status);
            }
        } else {
            setAvailabilityStatus('available');
        }
    }, [formData.employeeId, formData.startDate, formData.startTime, formData.endDate, formData.endTime, allEmployeeAvailabilities]);
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newStartTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const newEndTime = new Date(`${formData.endDate}T${formData.endTime}`);

        if (newEndTime <= newStartTime) {
            setError(t('modals.errorEndTime'));
            return;
        }

        // Holiday conflict
        const holidayOnDay = allSpecialDays.find(sd => {
            const type = allSpecialDayTypes.find(sdt => sdt.id === sd.typeId);
            return isSameDay(sd.date, newStartTime) && type?.isHoliday && sd.coverage === 'all-day';
        });

        if (holidayOnDay) {
            const typeName = allSpecialDayTypes.find(sdt => sdt.id === holidayOnDay.typeId)?.name || 'Holiday';
            setError(t('modals.errorHoliday', { typeName }));
            return;
        }
        
        // Conflict detection - only if an employee is assigned
        if (formData.employeeId) {
            // Absence conflict
            const conflictingAbsence = allAbsences.find(absence => {
                if (absence.employeeId !== formData.employeeId) return false;
                return newStartTime < absence.endDate && newEndTime > absence.startDate;
            });

            if (conflictingAbsence) {
                const absenceName = absenceTypes.find(at => at.id === conflictingAbsence.absenceTypeId)?.name || 'Absence';
                setError(t('modals.errorAbsenceConflict', { absenceName }));
                return;
            }
            // Availability conflict
            const currentAvailability = getAvailabilityForShift(formData.employeeId, newStartTime, newEndTime, allEmployeeAvailabilities);
            if(currentAvailability === 'unavailable') {
                setError(t('modals.errorUnavailable'));
                return;
            }
        }


        const updatedShift: Shift = {
            id: shift?.id || `shift-${Date.now()}`,
            employeeId: formData.employeeId || null,
            startTime: newStartTime,
            endTime: newEndTime,
            locationId: formData.locationId || undefined,
            departmentId: formData.departmentId || undefined,
            // Fix: Add missing companyId property
            companyId: user!.companyId,
        };
        onSave(updatedShift);
    };

    const handleDelete = () => {
        if (shift && onDelete && window.confirm(t('modals.confirmDeleteShift'))) {
            onDelete(shift.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {error && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{error}</p>}
            <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('modals.employeeLabel')}</label>
                <select
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-blue-night-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="">{t('modals.unassignedShift')}</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
                {formData.employeeId && (
                    <div className="mt-2 text-xs flex items-center">
                        {availabilityStatus === 'preferred' && <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle size={14} className="mr-1.5"/>{t('modals.preferredTime')}</span>}
                        {availabilityStatus === 'unavailable' && <span className="flex items-center text-red-600 dark:text-red-400"><AlertTriangle size={14} className="mr-1.5"/>{t('modals.employeeUnavailable')}</span>}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('modals.locationLabel')}</label>
                    <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="mt-1 input-field">
                        <option value="">{t('modals.none')}</option>
                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('modals.departmentLabel')}</label>
                    <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleChange} className="mt-1 input-field">
                        <option value="">{t('modals.none')}</option>
                        {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('modals.startDateLabel')}</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 input-field" />
                </div>
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('modals.startTimeLabel')}</label>
                    <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} className="mt-1 input-field" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('modals.endDateLabel')}</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 input-field" />
                </div>
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('modals.endTimeLabel')}</label>
                    <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} className="mt-1 input-field" />
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <div>
                    {shift && onDelete && (
                        <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-md text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-blue-night-800 hover:bg-gray-200 dark:hover:bg-blue-night-700">{t('modals.cancel')}</button>
                    <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{t('modals.saveShift')}</button>
                </div>
            </div>
             <style>{`
                .input-field {
                    display: block;
                    width: 100%;
                    padding-left: 0.75rem;
                    padding-right: 0.75rem;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    border-width: 1px;
                    border-radius: 0.375rem;
                    border-color: #D1D5DB;
                    background-color: #FFFFFF;
                    color: #111827;
                }
                .dark .input-field {
                    border-color: #4B5563;
                    background-color: #1F2937;
                    color: #F9FAFB;
                }
            `}</style>
        </form>
    );
};

export default ShiftEditor;
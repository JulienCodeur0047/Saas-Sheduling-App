import React, { useState, useMemo } from 'react';
import { Shift, Employee, Role, Location, Department, Absence, AbsenceType, SpecialDay, SpecialDayType, EmployeeAvailability } from '../types';
import ShiftCard from './ShiftCard';
import AbsenceCard from './AbsenceCard';
import Modal from './Modal';
import ShiftEditor from './ShiftEditor';
import AbsenceEditor from './AbsenceEditor';
import CalendarFilter from './CalendarFilter';
import SpecialDayEditor from './SpecialDayEditor';
import ExportModal from './ExportModal';
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckSquare, XSquare, UserMinus, Star, Download, Gem } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
    }
    return week;
};

const getMonthGridDays = (date: Date): Date[] => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    
    const days: Date[] = [];
    const startDate = new Date(firstDayOfMonth);
    const dayOfWeek = startDate.getDay();
    // Adjust start date to the beginning of the week (Monday)
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    startDate.setDate(startDate.getDate() - offset);

    // Always render 6 weeks for a consistent grid layout
    for (let i = 0; i < 42; i++) { 
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        days.push(day);
    }
    return days;
};


const formatDate = (date: Date) => date.toLocaleDateString([], { month: 'long', day: 'numeric' });
const formatDay = (date: Date) => date.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isDateBetween = (date: Date, start: Date, end: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0,0,0,0);
    const startDate = new Date(start);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(end);
    endDate.setHours(0,0,0,0);
    return checkDate >= startDate && checkDate <= endDate;
}


interface ScheduleCalendarProps {
    employees: Employee[];
    roles: Role[];
    shifts: Shift[];
    locations: Location[];
    departments: Department[];
    absences: Absence[];
    absenceTypes: AbsenceType[];
    specialDays: SpecialDay[];
    specialDayTypes: SpecialDayType[];
    employeeAvailabilities: EmployeeAvailability[];
    onSaveShift: (shift: Shift) => void;
    onDeleteShift: (shiftId: string) => void;
    onDeleteMultipleShifts: (shiftIds: string[]) => void;
    onUpdateShifts: (shifts: Shift[]) => void;
    onSaveAbsence: (absence: Absence) => void;
    onDeleteAbsence: (absenceId: string) => void;
    onSaveSpecialDay: (specialDay: SpecialDay) => void;
    onDeleteSpecialDay: (specialDayId: string) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = (props) => {
    const { 
        employees, roles, shifts, locations, departments, absences, absenceTypes, specialDays, specialDayTypes,
        employeeAvailabilities, onSaveShift, onDeleteShift, onDeleteMultipleShifts, onUpdateShifts, onSaveAbsence, onDeleteAbsence,
        onSaveSpecialDay, onDeleteSpecialDay
    } = props;
    
    const { permissions } = useAuth();
    const { t } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);
    const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
    const [view, setView] = useState<'week' | 'month'>('week');
    
    // Modal States
    const [shiftEditorState, setShiftEditorState] = useState<{isOpen: boolean, shift: Shift | null, date?: Date}>({isOpen: false, shift: null});
    const [absenceEditorState, setAbsenceEditorState] = useState<{isOpen: boolean, absence: Absence | null}>({isOpen: false, absence: null});
    const [specialDayEditorState, setSpecialDayEditorState] = useState<{isOpen: boolean, specialDay: SpecialDay | null, date: Date | null}>({isOpen: false, specialDay: null, date: null});
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [dayDetailModal, setDayDetailModal] = useState<{isOpen: boolean, date: Date | null}>({isOpen: false, date: null});

    const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
    const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
    
    const [filters, setFilters] = useState<{ employeeIds: string[], roleNames: string[], departmentIds: string[] }>({ employeeIds: [], roleNames: [], departmentIds: [] });

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const monthGridDays = useMemo(() => getMonthGridDays(currentDate), [currentDate]);

    const filteredCalendarItems = useMemo(() => {
        const employeeMap = new Map(employees.map(e => [e.id, e]));

        const filteredShifts = shifts.filter(shift => {
            // Always include open shifts, they are filtered out later if needed but should bypass employee filters
            if (!shift.employeeId) return true;

            const employee = employeeMap.get(shift.employeeId);
            if (!employee) return false;

            const employeeMatch = filters.employeeIds.length === 0 || filters.employeeIds.includes(employee.id);
            const roleMatch = filters.roleNames.length === 0 || filters.roleNames.includes(employee.role);
            const departmentMatch = filters.departmentIds.length === 0 || (shift.departmentId && filters.departmentIds.includes(shift.departmentId));

            return employeeMatch && roleMatch && departmentMatch;
        });
        
        const filteredAbsences = absences.filter(absence => {
            const employee = employeeMap.get(absence.employeeId);
            if (!employee) return false;

            const employeeMatch = filters.employeeIds.length === 0 || filters.employeeIds.includes(employee.id);
            const roleMatch = filters.roleNames.length === 0 || filters.roleNames.includes(employee.role);

            return employeeMatch && roleMatch;
        });

        return { shifts: filteredShifts, absences: filteredAbsences };

    }, [shifts, absences, employees, filters]);

    const handlePrev = () => {
        if (view === 'week') {
            setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)));
        } else {
            setCurrentDate(d => new Date(d.setMonth(d.getMonth() - 1)));
        }
    };
    const handleNext = () => {
        if (view === 'week') {
            setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)));
        } else {
            setCurrentDate(d => new Date(d.setMonth(d.getMonth() + 1)));
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date) => {
        e.preventDefault();
        const shiftId = e.dataTransfer.getData('shiftId');
        if (!shiftId) return;

        const originalShift = shifts.find(s => s.id === shiftId);
        if(!originalShift || !originalShift.employeeId) return; // Cannot drop open shifts

        // Conflict check
        const hasAbsenceConflict = absences.some(absence => 
            absence.employeeId === originalShift.employeeId && isDateBetween(day, absence.startDate, absence.endDate)
        );
         const holidayOnDay = specialDays.find(sd => {
            const type = specialDayTypes.find(sdt => sdt.id === sd.typeId);
            return isSameDay(sd.date, day) && type?.isHoliday && sd.coverage === 'all-day';
        });

        if (hasAbsenceConflict) {
            alert("Cannot move shift to a day where the employee is absent.");
        } else if (holidayOnDay) {
            alert("Cannot move shift to a holiday.");
        } else {
             const updatedShifts = shifts.map(shift => {
                if (shift.id === shiftId) {
                    const duration = shift.endTime.getTime() - shift.startTime.getTime();
                    const newStartTime = new Date(day);
                    newStartTime.setHours(shift.startTime.getHours(), shift.startTime.getMinutes(), shift.startTime.getSeconds(), shift.startTime.getMilliseconds());
                    const newEndTime = new Date(newStartTime.getTime() + duration);
                    return { ...shift, startTime: newStartTime, endTime: newEndTime };
                }
                return shift;
            });
            onUpdateShifts(updatedShifts);
        }

        setDragOverDate(null);
        setDraggedShiftId(null);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, shiftId: string) => {
        e.dataTransfer.setData('shiftId', shiftId);
        setDraggedShiftId(shiftId);
    };

    // Modal Openers
    const openAddShiftModal = (date: Date) => setShiftEditorState({isOpen: true, shift: null, date});
    const openEditShiftModal = (shift: Shift) => setShiftEditorState({isOpen: true, shift: shift});
    const openAddAbsenceModal = () => setAbsenceEditorState({isOpen: true, absence: null});
    const openEditAbsenceModal = (absence: Absence) => setAbsenceEditorState({isOpen: true, absence: absence});
    const openSpecialDayModal = (date: Date) => {
        const existing = specialDays.find(sd => isSameDay(sd.date, date));
        setSpecialDayEditorState({ isOpen: true, specialDay: existing || null, date });
    }
    const openDayDetailModal = (date: Date) => setDayDetailModal({isOpen: true, date: date});

    // Modal Savers
    const handleShiftSave = (shift: Shift) => { onSaveShift(shift); setShiftEditorState({isOpen: false, shift: null}); }
    const handleAbsenceSave = (absence: Absence) => { onSaveAbsence(absence); setAbsenceEditorState({isOpen: false, absence: null}); }
    const handleSpecialDaySave = (specialDay: SpecialDay) => { onSaveSpecialDay(specialDay); setSpecialDayEditorState({isOpen: false, specialDay: null, date: null}); }

    // Modal Deleters
    const handleShiftDelete = (shiftId: string) => { onDeleteShift(shiftId); setShiftEditorState({isOpen: false, shift: null}); }
    const handleAbsenceDelete = (absenceId: string) => { onDeleteAbsence(absenceId); setAbsenceEditorState({isOpen: false, absence: null}); }
    const handleSpecialDayDelete = (specialDayId: string) => { onDeleteSpecialDay(specialDayId); setSpecialDayEditorState({isOpen: false, specialDay: null, date: null}); }
    
    const toggleSelectionMode = () => { setIsSelectionModeActive(!isSelectionModeActive); setSelectedShiftIds([]); }
    const toggleShiftSelection = (shiftId: string) => setSelectedShiftIds(prev => prev.includes(shiftId) ? prev.filter(id => id !== shiftId) : [...prev, shiftId]);
    
    const handleDeleteSelected = () => {
        if(selectedShiftIds.length > 0 && window.confirm(t('modals.confirmDeleteMultiple', { count: selectedShiftIds.length }))) {
            onDeleteMultipleShifts(selectedShiftIds);
            setSelectedShiftIds([]);
            setIsSelectionModeActive(false);
        }
    }

    const getShiftEditorTitle = () => {
        if (shiftEditorState.shift) {
            return shiftEditorState.shift.employeeId ? t('schedule.editShift') : t('schedule.assignShift');
        }
        return t('schedule.addShiftTitle');
    };

    const headerTitle = view === 'week'
        ? `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`
        : currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    return (
        <div className="h-full flex flex-col">
             <header className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-blue-night-800 transition-colors"><ChevronLeft /></button>
                    <h2 className="text-xl md:text-2xl font-bold text-center w-64">{headerTitle}</h2>
                    <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-blue-night-800 transition-colors"><ChevronRight /></button>
                     <div className="flex items-center bg-gray-200 dark:bg-blue-night-800 rounded-lg p-1 ml-4">
                        <button onClick={() => setView('week')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'week' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('schedule.week')}</button>
                        <button onClick={() => setView('month')} className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'month' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('schedule.month')}</button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                     <button 
                        onClick={() => permissions.canExport && setIsExportModalOpen(true)}
                        disabled={!permissions.canExport}
                        title={!permissions.canExport ? t('tooltips.proFeature') : ''}
                        className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 relative ${!permissions.canExport ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'}`}
                     >
                        {!permissions.canExport && <Gem size={14} className="absolute -top-1 -right-1 text-yellow-400" />}
                        <Download size={20} className="mr-2" />
                        {t('schedule.export')}
                    </button>
                    <button 
                        onClick={() => permissions.canAddAbsence && openAddAbsenceModal()}
                        disabled={!permissions.canAddAbsence}
                        title={!permissions.canAddAbsence ? t('tooltips.proFeature') : ''}
                        className={`flex items-center text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 relative ${!permissions.canAddAbsence ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                    >
                        {!permissions.canAddAbsence && <Gem size={14} className="absolute -top-1 -right-1 text-yellow-400" />}
                        <UserMinus size={20} className="mr-2" />
                        {t('schedule.addAbsence')}
                    </button>
                    <button onClick={() => openAddShiftModal(new Date())} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <Plus size={20} className="mr-2" />
                        {t('schedule.addShift')}
                    </button>
                </div>
            </header>
            
            {view === 'week' && (
                <div className="flex items-center justify-end mb-4">
                     <div className="flex items-center space-x-2">
                        <button onClick={toggleSelectionMode} className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-300">
                           {isSelectionModeActive ? <XSquare size={18} className="mr-2"/> : <CheckSquare size={18} className="mr-2"/>}
                           <span className="text-sm">{isSelectionModeActive ? t('schedule.cancelSelection') : t('schedule.selectShifts')}</span>
                        </button>
                        {isSelectionModeActive && selectedShiftIds.length > 0 && (
                            <button onClick={handleDeleteSelected} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-300">
                               <Trash2 size={18} className="mr-2" />
                               <span className="text-sm">{t('schedule.deleteSelected', { count: selectedShiftIds.length })}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <CalendarFilter employees={employees} roles={roles} departments={departments} onFilterChange={setFilters} />

            {view === 'week' ? (
                 <div className="flex-1 grid grid-cols-7 gap-2 mt-4">
                    {weekDays.map(day => {
                        const openShiftsForDay = filteredCalendarItems.shifts.filter(s => !s.employeeId && isSameDay(s.startTime, day)).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
                        const assignedShiftsForDay = filteredCalendarItems.shifts.filter(s => !!s.employeeId && isDateBetween(day, s.startTime, s.endTime)).sort((a,b) => a.startTime.getTime() - b.startTime.getTime());
                        const absencesForDay = filteredCalendarItems.absences.filter(a => isDateBetween(day, a.startDate, a.endDate));
                        
                        const isDragOver = dragOverDate && isSameDay(dragOverDate, day);
                        const specialDayForDay = specialDays.find(sd => isSameDay(sd.date, day));
                        const specialDayType = specialDayForDay ? specialDayTypes.find(sdt => sdt.id === specialDayForDay.typeId) : null;
                        const isHoliday = specialDayType?.isHoliday && specialDayForDay?.coverage === 'all-day';

                        return (
                            <div key={day.toISOString()}
                                onDragOver={(e) => { e.preventDefault(); setDragOverDate(day); }}
                                onDragLeave={() => setDragOverDate(null)}
                                onDrop={(e) => handleDrop(e, day)}
                                onDoubleClick={() => openAddShiftModal(day)}
                                className={`rounded-lg p-2 flex flex-col transition-colors duration-200 
                                    ${isDragOver ? 'bg-blue-100 dark:bg-blue-night-800' : 'bg-gray-50 dark:bg-blue-night-900'}
                                    ${isHoliday ? 'bg-gray-200 dark:bg-blue-night-950/50' : ''}
                                `}
                            >
                                <div className="flex justify-between items-center text-center mb-2 pb-2 border-b-2 dark:border-blue-night-800">
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{formatDay(day)}</p>
                                        <p className="text-lg font-bold">{day.getDate()}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <button onClick={(e) => { e.stopPropagation(); openSpecialDayModal(day); }} className="p-1 rounded-full text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors" aria-label="Mark as special day">
                                            <Star size={16} className={specialDayForDay ? 'fill-current' : ''}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 h-full overflow-y-auto pr-1">
                                    {isHoliday && <div className="text-center p-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{specialDayType?.name}</div>}

                                    {openShiftsForDay.length > 0 && (
                                        <div className="pt-2">
                                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center border-b dark:border-blue-night-800 pb-1">{t('schedule.openShifts')}</h4>
                                            <div className="space-y-2 pt-1">
                                                {openShiftsForDay.map(shift => (
                                                    <ShiftCard key={shift.id} shift={shift} location={locations.find(l => l.id === shift.locationId)} department={departments.find(d => d.id === shift.departmentId)} onClick={() => openEditShiftModal(shift)} onDelete={onDeleteShift} isSelectionModeActive={false} isSelected={false} onToggleSelect={() => {}} onDragStart={() => {}} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {(openShiftsForDay.length > 0 && (assignedShiftsForDay.length > 0 || absencesForDay.length > 0)) && <hr className="border-gray-200 dark:border-blue-night-800 my-2"/>}
                                    
                                    {absencesForDay.map(absence => (
                                        <AbsenceCard key={absence.id} absence={absence} employee={employees.find(e => e.id === absence.employeeId)} absenceType={absenceTypes.find(at => at.id === absence.absenceTypeId)} onClick={() => openEditAbsenceModal(absence)} onDelete={onDeleteAbsence} />
                                    ))}
                                    {assignedShiftsForDay.map(shift => (
                                        <div key={shift.id} className={`transition-opacity duration-300 ${draggedShiftId === shift.id ? 'opacity-30' : 'opacity-100'}`}>
                                            <ShiftCard shift={shift} employee={employees.find(e => e.id === shift.employeeId)} location={locations.find(l => l.id === shift.locationId)} department={departments.find(d => d.id === shift.departmentId)} onDragStart={handleDragStart} onClick={() => openEditShiftModal(shift)} onDelete={onDeleteShift} isSelectionModeActive={isSelectionModeActive} isSelected={selectedShiftIds.includes(shift.id)} onToggleSelect={toggleShiftSelection} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1 mt-4 border-l border-t dark:border-blue-night-800">
                    {/* Month header */}
                    {weekDays.map(day => <div key={day.getDay()} className="text-center py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 border-b dark:border-blue-night-800">{formatDay(day)}</div>)}
                    {/* Month grid */}
                    {monthGridDays.map((day, index) => {
                         const shiftsForDay = filteredCalendarItems.shifts.filter(s => s.employeeId && isSameDay(s.startTime, day));
                         const absencesForDay = filteredCalendarItems.absences.filter(a => isDateBetween(day, a.startDate, a.endDate));
                         const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                         const isToday = isSameDay(day, new Date());
                         return (
                            <div 
                                key={index}
                                onClick={() => openDayDetailModal(day)}
                                className={`relative border-r border-b dark:border-blue-night-800 p-2 flex flex-col cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-night-800 transition-colors
                                ${isCurrentMonth ? 'bg-white dark:bg-blue-night-900' : 'bg-gray-50 dark:bg-blue-night-950 text-gray-400'}`}>
                                <div className={`flex justify-center items-center w-6 h-6 rounded-full text-sm ${isToday ? 'bg-blue-600 text-white' : ''}`}>
                                    {day.getDate()}
                                </div>
                                <div className="flex-grow mt-2 space-y-1">
                                     {shiftsForDay.slice(0, 2).map(shift => {
                                        const emp = employees.find(e => e.id === shift.employeeId);
                                        const roleColor = emp ? (roles.find(r => r.name === emp.role) ? 'bg-blue-500' : 'bg-gray-400') : 'bg-gray-400'; // Simplified color logic
                                        return <div key={shift.id} className={`h-1.5 w-full rounded-full ${roleColor}`}></div>
                                     })}
                                     {absencesForDay.slice(0, 1).map(absence => {
                                         const at = absenceTypes.find(t => t.id === absence.absenceTypeId);
                                         return <div key={absence.id} className={`h-1.5 w-full rounded-full`} style={{backgroundColor: at?.color || '#ccc'}}></div>
                                     })}
                                     {shiftsForDay.length + absencesForDay.length > 3 && 
                                        <div className="text-xs text-gray-500 dark:text-gray-400">+{shiftsForDay.length + absencesForDay.length - 3} more</div>
                                     }
                                </div>
                            </div>
                         );
                    })}
                </div>
            )}


            <Modal isOpen={shiftEditorState.isOpen} onClose={() => setShiftEditorState({isOpen: false, shift: null})} title={getShiftEditorTitle()}>
                <ShiftEditor 
                    shift={shiftEditorState.shift} 
                    employees={employees}
                    locations={locations}
                    departments={departments}
                    selectedDate={shiftEditorState.date}
                    onSave={handleShiftSave}
                    onCancel={() => setShiftEditorState({isOpen: false, shift: null})}
                    onDelete={shiftEditorState.shift ? handleShiftDelete : undefined}
                    allAbsences={absences}
                    absenceTypes={absenceTypes}
                    allSpecialDays={specialDays}
                    allSpecialDayTypes={specialDayTypes}
                    allEmployeeAvailabilities={employeeAvailabilities}
                />
            </Modal>
             <Modal isOpen={absenceEditorState.isOpen} onClose={() => setAbsenceEditorState({isOpen: false, absence: null})} title={absenceEditorState.absence ? t('schedule.editAbsence') : t('schedule.addAbsenceTitle')}>
                <AbsenceEditor
                    absence={absenceEditorState.absence}
                    employees={employees}
                    absenceTypes={absenceTypes}
                    onSave={handleAbsenceSave}
                    onCancel={() => setAbsenceEditorState({isOpen: false, absence: null})}
                    onDelete={absenceEditorState.absence ? handleAbsenceDelete : undefined}
                    allShifts={shifts}
                    allSpecialDays={specialDays}
                    allSpecialDayTypes={specialDayTypes}
                />
            </Modal>
            <Modal isOpen={specialDayEditorState.isOpen} onClose={() => setSpecialDayEditorState({isOpen: false, specialDay: null, date: null})} title={specialDayEditorState.specialDay ? t('schedule.editSpecialDay') : t('schedule.markSpecialDay')}>
                 {specialDayEditorState.date && (
                    <SpecialDayEditor 
                        date={specialDayEditorState.date}
                        specialDay={specialDayEditorState.specialDay}
                        specialDayTypes={specialDayTypes}
                        onSave={handleSpecialDaySave}
                        onCancel={() => setSpecialDayEditorState({isOpen: false, specialDay: null, date: null})}
                        onDelete={specialDayEditorState.specialDay ? handleSpecialDayDelete : undefined}
                    />
                 )}
            </Modal>
             <Modal 
                isOpen={dayDetailModal.isOpen} 
                onClose={() => setDayDetailModal({isOpen: false, date: null})} 
                title={t('schedule.dayScheduleTitle', { date: dayDetailModal.date?.toLocaleDateString() || '' })}
             >
                {dayDetailModal.date && (
                    <div>
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                            {filteredCalendarItems.absences.filter(a => isDateBetween(dayDetailModal.date!, a.startDate, a.endDate)).map(absence => (
                                <AbsenceCard key={absence.id} absence={absence} employee={employees.find(e => e.id === absence.employeeId)} absenceType={absenceTypes.find(at => at.id === absence.absenceTypeId)} onClick={() => openEditAbsenceModal(absence)} onDelete={onDeleteAbsence} />
                            ))}
                            {filteredCalendarItems.shifts.filter(s => isSameDay(s.startTime, dayDetailModal.date!)).sort((a,b)=>a.startTime.getTime() - b.startTime.getTime()).map(shift => (
                                <ShiftCard shift={shift} employee={employees.find(e => e.id === shift.employeeId)} location={locations.find(l => l.id === shift.locationId)} department={departments.find(d => d.id === shift.departmentId)} onDragStart={()=>{}} onClick={() => openEditShiftModal(shift)} onDelete={onDeleteShift} isSelectionModeActive={false} isSelected={false} onToggleSelect={()=>{}} />
                            ))}
                             {(filteredCalendarItems.shifts.filter(s => isSameDay(s.startTime, dayDetailModal.date!)).length === 0 &&
                               filteredCalendarItems.absences.filter(a => isDateBetween(dayDetailModal.date!, a.startDate, a.endDate)).length === 0) &&
                                <p className="text-center text-gray-500 py-4">No events scheduled for this day.</p>
                             }
                        </div>
                        <div className="mt-4 pt-4 border-t dark:border-blue-night-700 flex justify-end">
                            <button onClick={() => { setDayDetailModal({isOpen: false, date: null}); openAddShiftModal(dayDetailModal.date!); }} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                                <Plus size={20} className="mr-2" />
                                {t('schedule.addShift')}
                            </button>
                        </div>
                    </div>
                )}
             </Modal>
             <ExportModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                currentDate={currentDate}
                employees={employees}
                roles={roles}
                shifts={shifts}
                locations={locations}
                departments={departments}
                absences={absences}
                absenceTypes={absenceTypes}
                specialDays={specialDays}
                specialDayTypes={specialDayTypes}
            />
        </div>
    );
};

export default ScheduleCalendar;
import React, { useState, useEffect } from 'react';
import { View, Plan, Employee, Shift, Role, Location, Department, Absence, AbsenceType, SpecialDay, SpecialDayType, InboxMessage, EmployeeAvailability, WeeklyAvailability } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ScheduleCalendar from './components/ScheduleCalendar';
import EmployeeList from './components/EmployeeList';
import LandingPage from './components/LandingPage';
import { useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import EmployeeEditor from './components/EmployeeEditor';
import Settings from './components/Settings';
import CSVImportModal from './components/CSVImportModal';
import Profile from './components/Profile';
import { useLanguage } from './contexts/LanguageContext';
import { 
    EMPLOYEES as INITIAL_EMPLOYEES, 
    INITIAL_SHIFTS, 
    INITIAL_ROLES, 
    INITIAL_LOCATIONS,
    INITIAL_DEPARTMENTS,
    INITIAL_ABSENCE_TYPES,
    INITIAL_ABSENCES,
    INITIAL_SPECIAL_DAY_TYPES,
    INITIAL_SPECIAL_DAYS,
    INITIAL_INBOX_MESSAGES,
    INITIAL_AVAILABILITY,
} from './constants';

export default function App() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [view, setView] = useState<View>('schedule');
  const [authModal, setAuthModal] = useState<{isOpen: boolean, view: 'login' | 'register', plan?: Plan}>({isOpen: false, view: 'login'});
  
  // Global State Management
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>(INITIAL_ABSENCE_TYPES);
  const [absences, setAbsences] = useState<Absence[]>(INITIAL_ABSENCES);
  const [specialDayTypes, setSpecialDayTypes] = useState<SpecialDayType[]>(INITIAL_SPECIAL_DAY_TYPES);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>(INITIAL_SPECIAL_DAYS);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(INITIAL_INBOX_MESSAGES);
  const [employeeAvailabilities, setEmployeeAvailabilities] = useState<EmployeeAvailability[]>(INITIAL_AVAILABILITY);
  
  const [employeeEditor, setEmployeeEditor] = useState<{isOpen: boolean, employee: Employee | null}>({isOpen: false, employee: null});
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.title = t('appName');
  }, [t]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };


  const handleOpenLogin = () => setAuthModal({ isOpen: true, view: 'login' });
  const handleOpenRegister = (plan: Plan) => setAuthModal({ isOpen: true, view: 'register', plan });
  const handleCloseAuthModal = () => setAuthModal({ isOpen: false, view: 'login' });

  // Employee Handlers
  const handleOpenAddEmployee = () => setEmployeeEditor({ isOpen: true, employee: null });
  const handleOpenEditEmployee = (employee: Employee) => setEmployeeEditor({ isOpen: true, employee });
  const handleCloseEmployeeEditor = () => setEmployeeEditor({ isOpen: false, employee: null });

  const handleSaveEmployee = (employee: Employee, isNew: boolean) => {
    if (isNew) {
        setEmployees(prev => [...prev, employee]);
    } else {
        setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
    }
    handleCloseEmployeeEditor();
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    setShifts(prev => prev.filter(s => s.employeeId !== employeeId));
    setAbsences(prev => prev.filter(a => a.employeeId !== employeeId));
    handleCloseEmployeeEditor();
  };

  const handleImportEmployees = (importedData: Array<Omit<Employee, 'id' | 'avatarUrl'>>) => {
    const existingEmails = new Set(employees.map(e => e.email.toLowerCase()));
    let addedCount = 0;
    let skippedCount = 0;

    const newEmployees = importedData.reduce((acc, data) => {
        const email = data.email?.toLowerCase();
        if (email && data.name && !existingEmails.has(email)) {
            const newEmployee: Employee = {
                id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                gender: data.gender || 'Prefer not to say',
                role: data.role || 'Unassigned',
                avatarUrl: null,
            };
            acc.push(newEmployee);
            existingEmails.add(email);
            addedCount++;
        } else {
            skippedCount++;
        }
        return acc;
    }, [] as Employee[]);

    if (newEmployees.length > 0) {
        setEmployees(prev => [...prev, ...newEmployees]);
    }

    let alertMessage = `${addedCount} new employee(s) imported successfully.`;
    if (skippedCount > 0) {
        alertMessage += `\n${skippedCount} employee(s) were skipped due to duplicate email addresses or missing data.`;
    }
    alert(alertMessage);
    setIsCsvImportOpen(false);
  };
  
  // Employee Availability Handler
  const handleSaveEmployeeAvailability = (employeeId: string, availability: WeeklyAvailability) => {
    setEmployeeAvailabilities(prev => {
        const existing = prev.find(a => a.employeeId === employeeId);
        if (existing) {
            return prev.map(a => a.employeeId === employeeId ? { ...a, availability } : a);
        }
        return [...prev, { employeeId, availability }];
    });
  };

  // Shift Handlers
  const handleSaveShift = (shift: Shift) => {
    setShifts(prevShifts => {
        const exists = prevShifts.some(s => s.id === shift.id);
        if (exists) {
            return prevShifts.map(s => s.id === shift.id ? shift : s);
        } else {
            return [...prevShifts, shift];
        }
    });
  };
  const handleDeleteShift = (shiftId: string) => {
     setShifts(prev => prev.filter(s => s.id !== shiftId));
  };
   const handleDeleteMultipleShifts = (shiftIds: string[]) => {
    setShifts(prev => prev.filter(s => !shiftIds.includes(s.id)));
  };
  const handleUpdateShifts = (updatedShifts: Shift[]) => {
      setShifts(updatedShifts);
  }

  // Role Handlers
  const handleAddRole = (name: string) => setRoles(prev => [...prev, { id: `role-${Date.now()}`, name }]);
  const handleUpdateRole = (id: string, name: string) => {
    setRoles(prev => prev.map(r => (r.id === id ? { ...r, name } : r)));
    const oldRoleName = roles.find(r => r.id === id)?.name;
    if (oldRoleName) {
        setEmployees(prev => prev.map(e => e.role === oldRoleName ? { ...e, role: name } : e));
    }
  };
  const handleDeleteRole = (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (!roleToDelete || employees.some(e => e.role === roleToDelete.name)) {
      alert("This role is assigned and cannot be deleted.");
      return;
    }
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  // Location Handlers
  const handleAddLocation = (name: string, address?: string) => setLocations(prev => [...prev, { id: `loc-${Date.now()}`, name, address }]);
  const handleUpdateLocation = (id: string, name: string, address?: string) => setLocations(prev => prev.map(l => (l.id === id ? { ...l, name, address } : l)));
  const handleDeleteLocation = (id: string) => {
    if (shifts.some(s => s.locationId === id)) {
      alert("This location is in use and cannot be deleted.");
      return;
    }
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  // Department Handlers
  const handleAddDepartment = (name: string) => setDepartments(prev => [...prev, { id: `dept-${Date.now()}`, name }]);
  const handleUpdateDepartment = (id: string, name: string) => setDepartments(prev => prev.map(d => (d.id === id ? { ...d, name } : d)));
  const handleDeleteDepartment = (id: string) => {
    if (shifts.some(s => s.departmentId === id)) {
        alert("This department is assigned to shifts and cannot be deleted.");
        return;
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
  }

  // Absence Type Handlers
  const handleAddAbsenceType = (name: string, color: string) => setAbsenceTypes(prev => [...prev, { id: `abs-type-${Date.now()}`, name, color }]);
  const handleUpdateAbsenceType = (id: string, name: string, color: string) => setAbsenceTypes(prev => prev.map(at => (at.id === id ? { ...at, name, color } : at)));
  const handleDeleteAbsenceType = (id: string) => {
    if (absences.some(a => a.absenceTypeId === id)) {
        alert("This absence type is in use and cannot be deleted.");
        return;
    }
    setAbsenceTypes(prev => prev.filter(at => at.id !== id));
  }

  // Absence Handlers
    const handleSaveAbsence = (absence: Absence) => {
        setAbsences(prev => {
            const exists = prev.some(a => a.id === absence.id);
            if (exists) {
                return prev.map(a => a.id === absence.id ? absence : a);
            }
            return [...prev, absence];
        });
    };
    const handleDeleteAbsence = (absenceId: string) => {
        setAbsences(prev => prev.filter(a => a.id !== absenceId));
    };
    
    // Special Day Type Handlers
    const handleAddSpecialDayType = (name: string, isHoliday: boolean) => setSpecialDayTypes(prev => [...prev, { id: `sdt-${Date.now()}`, name, isHoliday }]);
    const handleUpdateSpecialDayType = (id: string, name: string, isHoliday: boolean) => setSpecialDayTypes(prev => prev.map(sdt => sdt.id === id ? { ...sdt, name, isHoliday } : sdt));
    const handleDeleteSpecialDayType = (id: string) => {
        if(specialDays.some(sd => sd.typeId === id)) {
            alert("This special day type is in use and cannot be deleted.");
            return;
        }
        setSpecialDayTypes(prev => prev.filter(sdt => sdt.id !== id));
    };

    // Special Day Handlers
    const handleSaveSpecialDay = (specialDay: SpecialDay) => {
        setSpecialDays(prev => {
            const exists = prev.some(sd => sd.id === specialDay.id);
            if(exists) {
                return prev.map(sd => sd.id === specialDay.id ? specialDay : sd);
            }
            return [...prev, specialDay];
        });
    };
    const handleDeleteSpecialDay = (specialDayId: string) => {
        setSpecialDays(prev => prev.filter(sd => sd.id !== specialDayId));
    };
    
    // Inbox Message Handlers
    const handleValidateRequest = (messageId: string) => {
        const message = inboxMessages.find(m => m.id === messageId);
        if (!message || !message.startDate || !message.endDate || !message.absenceTypeId) return;

        const hasConflict = shifts.some(shift => 
            shift.employeeId === message.employeeId && 
            shift.startTime < message.endDate! && 
            shift.endTime > message.startDate!
        );

        if (hasConflict) {
            alert("Cannot approve absence due to a conflicting shift. Please resolve the shift conflict first.");
            return;
        }

        const newAbsence: Absence = {
            id: `absence-${Date.now()}`,
            employeeId: message.employeeId,
            absenceTypeId: message.absenceTypeId,
            startDate: message.startDate,
            endDate: message.endDate,
        };
        handleSaveAbsence(newAbsence);
        setInboxMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'validated' } : m));
        alert('Absence request approved and added to the schedule.');
    };

    const handleRefuseRequest = (messageId: string, reason: string) => {
        setInboxMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'refused' } : m));
        alert(`Refusal reason sent to employee: "${reason}"`);
    };

    const handleFollowUpComplaint = (messageId: string) => {
        setInboxMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'followed-up' } : m));
    };


  if (!user) {
    return (
      <>
        <LandingPage onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />
        <AuthModal 
          isOpen={authModal.isOpen}
          initialView={authModal.view}
          initialPlan={authModal.plan}
          onClose={handleCloseAuthModal}
        />
      </>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard employees={employees} shifts={shifts} absences={absences} absenceTypes={absenceTypes} roles={roles} />;
      case 'schedule':
        return <ScheduleCalendar 
                    employees={employees} 
                    roles={roles}
                    shifts={shifts}
                    locations={locations}
                    departments={departments}
                    absences={absences}
                    absenceTypes={absenceTypes}
                    specialDays={specialDays}
                    specialDayTypes={specialDayTypes}
                    employeeAvailabilities={employeeAvailabilities}
                    onSaveShift={handleSaveShift}
                    onDeleteShift={handleDeleteShift}
                    onDeleteMultipleShifts={handleDeleteMultipleShifts}
                    onUpdateShifts={handleUpdateShifts}
                    onSaveAbsence={handleSaveAbsence}
                    onDeleteAbsence={handleDeleteAbsence}
                    onSaveSpecialDay={handleSaveSpecialDay}
                    onDeleteSpecialDay={handleDeleteSpecialDay}
                />;
      case 'employees':
        return <EmployeeList 
                    employees={employees} 
                    roles={roles}
                    onAdd={handleOpenAddEmployee} 
                    onEdit={handleOpenEditEmployee}
                    onDelete={handleDeleteEmployee} 
                    onImport={() => setIsCsvImportOpen(true)}
                />;
      case 'settings':
        return <Settings
                  roles={roles}
                  employees={employees}
                  locations={locations}
                  shifts={shifts}
                  departments={departments}
                  absenceTypes={absenceTypes}
                  absences={absences}
                  specialDayTypes={specialDayTypes}
                  specialDays={specialDays}
                  onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole}
                  onAddLocation={handleAddLocation} onUpdateLocation={handleUpdateLocation} onDeleteLocation={handleDeleteLocation}
                  onAddDepartment={handleAddDepartment} onUpdateDepartment={handleUpdateDepartment} onDeleteDepartment={handleDeleteDepartment}
                  onAddAbsenceType={handleAddAbsenceType} onUpdateAbsenceType={handleUpdateAbsenceType} onDeleteAbsenceType={handleDeleteAbsenceType}
                  onAddSpecialDayType={handleAddSpecialDayType} onUpdateSpecialDayType={handleUpdateSpecialDayType} onDeleteSpecialDayType={handleDeleteSpecialDayType}
               />;
      case 'profile':
        return <Profile />;
      default:
        return <ScheduleCalendar employees={employees} roles={roles} shifts={shifts} locations={locations} departments={departments} absences={absences} absenceTypes={absenceTypes} specialDays={specialDays} specialDayTypes={specialDayTypes} employeeAvailabilities={employeeAvailabilities} onSaveShift={handleSaveShift} onDeleteShift={handleDeleteShift} onDeleteMultipleShifts={handleDeleteMultipleShifts} onUpdateShifts={handleUpdateShifts} onSaveAbsence={handleSaveAbsence} onDeleteAbsence={handleDeleteAbsence} onSaveSpecialDay={handleSaveSpecialDay} onDeleteSpecialDay={handleDeleteSpecialDay} />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100 dark:bg-blue-night-950 text-gray-800 dark:text-gray-200 font-sans">
        <Sidebar 
          currentView={view} 
          setView={setView} 
          onLogout={logout} 
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            employees={employees}
            absenceTypes={absenceTypes}
            inboxMessages={inboxMessages}
            onValidateRequest={handleValidateRequest}
            onRefuseRequest={handleRefuseRequest}
            onFollowUpComplaint={handleFollowUpComplaint}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-blue-night-950 p-6">
            {renderView()}
          </main>
        </div>
      </div>
      {employeeEditor.isOpen && (
          <EmployeeEditor 
              employee={employeeEditor.employee}
              roles={roles}
              onSave={handleSaveEmployee}
              onClose={handleCloseEmployeeEditor}
              onDelete={handleDeleteEmployee}
              employeeAvailability={employeeAvailabilities.find(a => a.employeeId === employeeEditor.employee?.id)}
              onSaveAvailability={handleSaveEmployeeAvailability}
          />
      )}
      {isCsvImportOpen && (
        <CSVImportModal 
            onClose={() => setIsCsvImportOpen(false)}
            onImport={handleImportEmployees}
        />
      )}
    </>
  );
}
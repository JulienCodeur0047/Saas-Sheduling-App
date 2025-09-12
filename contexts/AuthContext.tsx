import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { User, Plan, Subscription, Payment, Company, Employee, Shift, Role, Location, Department, Absence, AbsenceType, SpecialDay, SpecialDayType, InboxMessage, EmployeeAvailability, WeeklyAvailability } from '../types';
import { DB, getCompanyData, updateCompanyData, createDefaultDataForCompany } from '../constants';

export interface Permissions {
  canAccessDashboard: boolean;
  canExport: boolean;
  canAddAbsence: boolean;
  canImportEmployees: boolean;
  employeeLimit: number;
}

type LoginResult = {
    success: boolean;
    reason?: 'invalid' | 'unverified';
}

// All data related to a single company
interface CompanyDataContextType {
    employees: Employee[];
    shifts: Shift[];
    roles: Role[];
    locations: Location[];
    departments: Department[];
    absences: Absence[];
    absenceTypes: AbsenceType[];
    specialDays: SpecialDay[];
    specialDayTypes: SpecialDayType[];
    inboxMessages: InboxMessage[];
    employeeAvailabilities: EmployeeAvailability[];
}

// All data modification handlers
interface DataHandlerContextType {
    handleSaveEmployee: (employee: Employee, isNew: boolean) => void;
    handleDeleteEmployee: (employeeId: string) => void;
    handleSaveShift: (shift: Shift) => void;
    handleDeleteShift: (shiftId: string) => void;
    handleDeleteMultipleShifts: (shiftIds: string[]) => void;
    handleUpdateShifts: (updatedShifts: Shift[]) => void;
    handleAddRole: (name: string) => void;
    handleUpdateRole: (id: string, name: string) => void;
    handleDeleteRole: (id: string) => void;
    handleAddLocation: (name: string, address?: string) => void;
    handleUpdateLocation: (id: string, name: string, address?: string) => void;
    handleDeleteLocation: (id: string) => void;
    handleAddDepartment: (name: string) => void;
    handleUpdateDepartment: (id: string, name: string) => void;
    handleDeleteDepartment: (id: string) => void;
    handleAddAbsenceType: (name: string, color: string) => void;
    handleUpdateAbsenceType: (id: string, name: string, color: string) => void;
    handleDeleteAbsenceType: (id: string) => void;
    handleSaveAbsence: (absence: Absence) => void;
    handleDeleteAbsence: (absenceId: string) => void;
    handleAddSpecialDayType: (name: string, isHoliday: boolean) => void;
    handleUpdateSpecialDayType: (id: string, name: string, isHoliday: boolean) => void;
    handleDeleteSpecialDayType: (id: string) => void;
    handleSaveSpecialDay: (specialDay: SpecialDay) => void;
    handleDeleteSpecialDay: (specialDayId: string) => void;
    handleValidateRequest: (messageId: string) => void;
    handleRefuseRequest: (messageId: string, reason: string) => void;
    handleFollowUpComplaint: (messageId: string) => void;
    handleSaveEmployeeAvailability: (employeeId: string, availability: WeeklyAvailability) => void;
    handleImportEmployees: (importedData: Array<Omit<Employee, 'id' | 'avatarUrl' | 'companyId'>>) => void;
}


interface AuthContextType extends CompanyDataContextType, DataHandlerContextType {
  user: User | null;
  subscription: Subscription | null;
  paymentHistory: Payment[];
  permissions: Permissions;
  login: (email: string, pass: string) => LoginResult;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'avatarUrl' | 'isVerified' | 'companyId'>, pass: string) => boolean;
  updateUser: (updatedData: Partial<User>) => void;
  verifyUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialCompanyData: CompanyDataContextType = {
    employees: [], shifts: [], roles: [], locations: [], departments: [], absences: [],
    absenceTypes: [], specialDays: [], specialDayTypes: [], inboxMessages: [], employeeAvailabilities: [],
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<CompanyDataContextType>(initialCompanyData);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);

  const permissions: Permissions = useMemo(() => {
    const plan = user?.plan || 'Gratuit';
    return {
      'Gratuit': { canAccessDashboard: false, canExport: false, canAddAbsence: false, canImportEmployees: false, employeeLimit: 10 },
      'Pro': { canAccessDashboard: true, canExport: true, canAddAbsence: true, canImportEmployees: true, employeeLimit: 100 },
      'Pro Plus': { canAccessDashboard: true, canExport: true, canAddAbsence: true, canImportEmployees: true, employeeLimit: 300 },
    }[plan];
  }, [user?.plan]);

  const login = (email: string, pass: string): LoginResult => {
    const foundUser = DB.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) return { success: false, reason: 'invalid' };
    if (!foundUser.isVerified) return { success: false, reason: 'unverified' };
    
    setUser(foundUser);
    setData(getCompanyData(foundUser.companyId));
    
    const company = DB.companies.find(c => c.id === foundUser.companyId);
    if (company && company.subscriptionId) {
        const sub = DB.subscriptions.find(s => s.id === company.subscriptionId);
        setSubscription(sub || null);
        if (sub) {
            const payments = DB.payments.filter(p => p.subscriptionId === sub.id);
            setPaymentHistory(payments);
        }
    } else {
        setSubscription(null);
        setPaymentHistory([]);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setData(initialCompanyData);
    setSubscription(null);
    setPaymentHistory([]);
  };

  const register = (userData: Omit<User, 'id' | 'avatarUrl' | 'isVerified' | 'companyId'>, pass: string): boolean => {
    if (DB.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) return false;

    const newUserId = `user-${Date.now()}`;
    const newCompanyId = `company-${Date.now()}`;
    
    const newCompany: Company = { id: newCompanyId, name: userData.companyName, ownerId: newUserId, subscriptionId: null };
    DB.companies.push(newCompany);

    const newUser: User = {
        id: newUserId,
        avatarUrl: null,
        ...userData,
        companyId: newCompanyId,
        isVerified: false,
    };
    DB.users.push(newUser);

    if (userData.plan !== 'Gratuit') {
        const newSubscriptionId = `sub-${Date.now()}`;
        const newSubscription: Subscription = {
            id: newSubscriptionId,
            userId: newUserId,
            companyId: newCompanyId,
            plan: userData.plan,
            status: 'active',
            startDate: new Date(),
            nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        };
        DB.subscriptions.push(newSubscription);

        newCompany.subscriptionId = newSubscriptionId;

        const planPrices: { [key in Plan]?: number } = { 'Pro': 10, 'Pro Plus': 20 };
        const amount = planPrices[userData.plan] || 0;
        
        const newPayment: Payment = {
            id: `pay-${Date.now()}`,
            userId: newUserId,
            subscriptionId: newSubscriptionId,
            date: new Date(),
            amount: amount,
            plan: userData.plan,
            status: 'Paid',
        };
        DB.payments.push(newPayment);
    }

    createDefaultDataForCompany(newCompanyId);
    return true;
  };
  
  const verifyUser = (email: string) => {
      const userIndex = DB.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) DB.users[userIndex].isVerified = true;
  }

  const updateUser = (updatedData: Partial<User>) => {
      setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, ...updatedData };
          const userIndex = DB.users.findIndex(u => u.id === updatedUser.id);
          if (userIndex !== -1) DB.users[userIndex] = updatedUser;
          return updatedUser;
      });
  };

  // --- Data Handlers ---
  const createDataUpdater = <T extends { id: string }>(dataType: keyof CompanyDataContextType) => (item: T) => {
      setData(prev => {
          const collection = prev[dataType] as unknown as T[];
          const exists = collection.some(i => i.id === item.id);
          const newCollection = exists ? collection.map(i => i.id === item.id ? item : i) : [...collection, item];
          updateCompanyData(user!.companyId, dataType, newCollection as any);
          return { ...prev, [dataType]: newCollection };
      });
  };

  const createDataDeleter = <T extends { id: string }>(dataType: keyof CompanyDataContextType) => (itemId: string) => {
      setData(prev => {
          const collection = prev[dataType] as unknown as T[];
          const newCollection = collection.filter(i => i.id !== itemId);
          updateCompanyData(user!.companyId, dataType, newCollection as any);
          return { ...prev, [dataType]: newCollection };
      });
  };
  
  const handleSaveEmployee = (employee: Employee, isNew: boolean) => {
      setData(prev => {
          const newEmployees = isNew ? [...prev.employees, employee] : prev.employees.map(e => e.id === employee.id ? employee : e);
          updateCompanyData(user!.companyId, 'employees', newEmployees);
          return { ...prev, employees: newEmployees };
      });
  };

  const handleDeleteEmployee = (employeeId: string) => {
      setData(prev => {
          const newEmployees = prev.employees.filter(e => e.id !== employeeId);
          const newShifts = prev.shifts.filter(s => s.employeeId !== employeeId);
          const newAbsences = prev.absences.filter(a => a.employeeId !== employeeId);
          updateCompanyData(user!.companyId, 'employees', newEmployees);
          updateCompanyData(user!.companyId, 'shifts', newShifts);
          updateCompanyData(user!.companyId, 'absences', newAbsences);
          return { ...prev, employees: newEmployees, shifts: newShifts, absences: newAbsences };
      });
  };
  
  const handleAddRole = (name: string) => setData(prev => {
      const newRole: Role = { id: `role-${Date.now()}`, name, companyId: user!.companyId };
      const newRoles = [...prev.roles, newRole];
      updateCompanyData(user!.companyId, 'roles', newRoles);
      return {...prev, roles: newRoles};
  });
  
  const handleUpdateRole = (id: string, name: string) => {
      const oldRoleName = data.roles.find(r => r.id === id)?.name;
      setData(prev => {
          const newRoles = prev.roles.map(r => (r.id === id ? { ...r, name } : r));
          const newEmployees = oldRoleName ? prev.employees.map(e => e.role === oldRoleName ? { ...e, role: name } : e) : prev.employees;
          updateCompanyData(user!.companyId, 'roles', newRoles);
          updateCompanyData(user!.companyId, 'employees', newEmployees);
          return {...prev, roles: newRoles, employees: newEmployees};
      });
  };

  const handleDeleteRole = (id: string) => {
      const roleToDelete = data.roles.find(r => r.id === id);
      if (!roleToDelete || data.employees.some(e => e.role === roleToDelete.name)) {
          alert("This role is assigned and cannot be deleted.");
          return;
      }
      createDataDeleter('roles')(id);
  };
  
    const handleAddLocation = (name: string, address?: string) => setData(prev => {
      const newLocation: Location = { id: `loc-${Date.now()}`, name, address, companyId: user!.companyId };
      const newLocations = [...prev.locations, newLocation];
      updateCompanyData(user!.companyId, 'locations', newLocations);
      return {...prev, locations: newLocations};
    });

  const handleUpdateLocation = (id: string, name: string, address?: string) => setData(prev => {
      const newLocations = prev.locations.map(l => (l.id === id ? { ...l, name, address } : l));
      updateCompanyData(user!.companyId, 'locations', newLocations);
      return {...prev, locations: newLocations};
  });

  const handleDeleteLocation = (id: string) => {
      if (data.shifts.some(s => s.locationId === id)) {
          alert("This location is in use and cannot be deleted.");
          return;
      }
      createDataDeleter('locations')(id);
  };
  
  const handleSaveAbsence = createDataUpdater('absences');

  const handleValidateRequest = (messageId: string) => {
      const message = data.inboxMessages.find(m => m.id === messageId);
      if (!message || !message.startDate || !message.endDate || !message.absenceTypeId) return;

      const hasConflict = data.shifts.some(shift => shift.employeeId === message.employeeId && shift.startTime < message.endDate! && shift.endTime > message.startDate!);
      if (hasConflict) {
          alert("Cannot approve absence due to a conflicting shift. Please resolve the shift conflict first.");
          return;
      }

      const newAbsence: Absence = { id: `absence-${Date.now()}`, employeeId: message.employeeId, absenceTypeId: message.absenceTypeId, startDate: message.startDate, endDate: message.endDate, companyId: user!.companyId };
      handleSaveAbsence(newAbsence);
      setData(prev => {
          const newMessages = prev.inboxMessages.map(m => m.id === messageId ? { ...m, status: 'validated' as InboxMessage['status'] } : m);
          updateCompanyData(user!.companyId, 'inboxMessages', newMessages);
          return {...prev, inboxMessages: newMessages};
      });
      alert('Absence request approved and added to the schedule.');
  };

  const handleRefuseRequest = (messageId: string, reason: string) => {
      setData(prev => {
          const newMessages = prev.inboxMessages.map(m => m.id === messageId ? { ...m, status: 'refused' as InboxMessage['status'] } : m);
          updateCompanyData(user!.companyId, 'inboxMessages', newMessages);
          return {...prev, inboxMessages: newMessages};
      });
      alert(`Refusal reason sent to employee: "${reason}"`);
  };

  const handleFollowUpComplaint = (messageId: string) => {
      setData(prev => {
          const newMessages = prev.inboxMessages.map(m => m.id === messageId ? { ...m, status: 'followed-up' as InboxMessage['status'] } : m);
          updateCompanyData(user!.companyId, 'inboxMessages', newMessages);
          return {...prev, inboxMessages: newMessages};
      });
  };

  const handleSaveEmployeeAvailability = (employeeId: string, availability: WeeklyAvailability) => {
      setData(prev => {
          const existing = prev.employeeAvailabilities.find(a => a.employeeId === employeeId);
          const newAvailabilities = existing 
              ? prev.employeeAvailabilities.map(a => a.employeeId === employeeId ? { ...a, availability } : a)
              : [...prev.employeeAvailabilities, { employeeId, availability, companyId: user!.companyId }];
          updateCompanyData(user!.companyId, 'employeeAvailabilities', newAvailabilities);
          return {...prev, employeeAvailabilities: newAvailabilities };
      });
  };
  
  const handleImportEmployees = (importedData: Array<Omit<Employee, 'id' | 'avatarUrl' | 'companyId'>>) => {
    setData(prev => {
        const existingEmails = new Set(prev.employees.map(e => e.email.toLowerCase()));
        const newEmployees: Employee[] = [];
        importedData.forEach(data => {
            const email = data.email?.toLowerCase();
            if (email && data.name && !existingEmails.has(email)) {
                newEmployees.push({
                    id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: data.name, email: data.email, phone: data.phone || '',
                    gender: data.gender || 'Prefer not to say', role: data.role || 'Unassigned',
                    avatarUrl: null, companyId: user!.companyId
                });
                existingEmails.add(email);
            }
        });

        if (newEmployees.length > 0) {
            const updatedEmployees = [...prev.employees, ...newEmployees];
            updateCompanyData(user!.companyId, 'employees', updatedEmployees);
            alert(`${newEmployees.length} new employee(s) imported.`);
            return {...prev, employees: updatedEmployees};
        }
        alert('No new employees to import.');
        return prev;
    });
  };

  const value = { 
    user, permissions, login, logout, register, updateUser, verifyUser,
    subscription, paymentHistory,
    ...data,
    handleSaveEmployee, handleDeleteEmployee,
    handleSaveShift: createDataUpdater('shifts'), handleDeleteShift: createDataDeleter('shifts'),
    handleDeleteMultipleShifts: (shiftIds: string[]) => setData(prev => {
        const newShifts = prev.shifts.filter(s => !shiftIds.includes(s.id));
        updateCompanyData(user!.companyId, 'shifts', newShifts);
        return {...prev, shifts: newShifts};
    }),
    handleUpdateShifts: (updatedShifts: Shift[]) => setData(prev => {
        updateCompanyData(user!.companyId, 'shifts', updatedShifts);
        return {...prev, shifts: updatedShifts};
    }),
    handleAddRole, handleUpdateRole, handleDeleteRole,
    handleAddLocation, handleUpdateLocation, handleDeleteLocation,
    handleAddDepartment: (name: string) => setData(prev => { const d: Department = {id: `dept-${Date.now()}`, name, companyId: user!.companyId }; const ds = [...prev.departments, d]; updateCompanyData(user!.companyId, 'departments', ds); return {...prev, departments: ds}; }),
    handleUpdateDepartment: (id: string, name: string) => setData(prev => { const ds = prev.departments.map(d => d.id === id ? {...d, name} : d); updateCompanyData(user!.companyId, 'departments', ds); return {...prev, departments: ds}; }),
    handleDeleteDepartment: (id: string) => { if(data.shifts.some(s=>s.departmentId===id)) { alert("This department is in use."); return;} createDataDeleter('departments')(id);},
    handleAddAbsenceType: (name: string, color: string) => setData(prev => { const at: AbsenceType = {id: `at-${Date.now()}`, name, color, companyId: user!.companyId }; const ats = [...prev.absenceTypes, at]; updateCompanyData(user!.companyId, 'absenceTypes', ats); return {...prev, absenceTypes: ats}; }),
    handleUpdateAbsenceType: (id: string, name: string, color: string) => setData(prev => { const ats = prev.absenceTypes.map(at => at.id === id ? {...at, name, color} : at); updateCompanyData(user!.companyId, 'absenceTypes', ats); return {...prev, absenceTypes: ats}; }),
    handleDeleteAbsenceType: (id: string) => { if(data.absences.some(a=>a.absenceTypeId===id)) { alert("This absence type is in use."); return;} createDataDeleter('absenceTypes')(id);},
    handleSaveAbsence, handleDeleteAbsence: createDataDeleter('absences'),
    handleAddSpecialDayType: (name: string, isHoliday: boolean) => setData(prev => { const sdt: SpecialDayType = {id: `sdt-${Date.now()}`, name, isHoliday, companyId: user!.companyId }; const sdts = [...prev.specialDayTypes, sdt]; updateCompanyData(user!.companyId, 'specialDayTypes', sdts); return {...prev, specialDayTypes: sdts}; }),
    handleUpdateSpecialDayType: (id: string, name: string, isHoliday: boolean) => setData(prev => { const sdts = prev.specialDayTypes.map(sdt => sdt.id === id ? {...sdt, name, isHoliday} : sdt); updateCompanyData(user!.companyId, 'specialDayTypes', sdts); return {...prev, specialDayTypes: sdts}; }),
    handleDeleteSpecialDayType: (id: string) => { if(data.specialDays.some(sd=>sd.typeId===id)) { alert("This special day type is in use."); return;} createDataDeleter('specialDayTypes')(id);},
    handleSaveSpecialDay: createDataUpdater('specialDays'), handleDeleteSpecialDay: createDataDeleter('specialDays'),
    handleValidateRequest, handleRefuseRequest, handleFollowUpComplaint, handleSaveEmployeeAvailability, handleImportEmployees
  };

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
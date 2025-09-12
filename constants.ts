import { User, Company, Employee, Shift, Role, Location, Department, AbsenceType, Absence, SpecialDayType, SpecialDay, InboxMessage, EmployeeAvailability, WeeklyAvailability, DayAvailability } from './types';

// --- DATA STORE (SIMULATED DATABASE) ---
interface Database {
    users: User[];
    companies: Company[];
    employees: Employee[];
    shifts: Shift[];
    roles: Role[];
    locations: Location[];
    departments: Department[];
    absenceTypes: AbsenceType[];
    absences: Absence[];
    specialDayTypes: SpecialDayType[];
    specialDays: SpecialDay[];
    inboxMessages: InboxMessage[];
    employeeAvailabilities: EmployeeAvailability[];
}

const DEMO_COMPANY_ID = 'company-1';
const DEMO_USER_ID = 'user-1';

// --- INITIAL DEMO DATA ---
const today = new Date();
const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setHours(0,0,0,0);
    return new Date(d.setDate(diff));
};
const startOfWeek = getStartOfWeek(today);

const DEMO_ROLES: Role[] = [
  { id: 'role-1', name: 'Manager', companyId: DEMO_COMPANY_ID },
  { id: 'role-2', name: 'Cashier', companyId: DEMO_COMPANY_ID },
  { id: 'role-3', name: 'Stocker', companyId: DEMO_COMPANY_ID },
  { id: 'role-4', name: 'Clerk', companyId: DEMO_COMPANY_ID },
];

const DEMO_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Main Office', address: '123 Main St', companyId: DEMO_COMPANY_ID },
  { id: 'loc-2', name: 'Warehouse', address: '456 Industrial Ave', companyId: DEMO_COMPANY_ID },
  { id: 'loc-3', name: 'Downtown Branch', address: '789 Central Sq', companyId: DEMO_COMPANY_ID },
];

const DEMO_DEPARTMENTS: Department[] = [
    { id: 'dept-1', name: 'Sales', companyId: DEMO_COMPANY_ID },
    { id: 'dept-2', name: 'Logistics', companyId: DEMO_COMPANY_ID },
    { id: 'dept-3', name: 'Customer Service', companyId: DEMO_COMPANY_ID },
];

const DEMO_ABSENCE_TYPES: AbsenceType[] = [
    { id: 'abs-type-1', name: 'Sick Leave', color: '#f44336', companyId: DEMO_COMPANY_ID },
    { id: 'abs-type-2', name: 'Vacation', color: '#4caf50', companyId: DEMO_COMPANY_ID },
    { id: 'abs-type-3', name: 'Personal Day', color: '#ff9800', companyId: DEMO_COMPANY_ID },
];

const DEMO_SPECIAL_DAY_TYPES: SpecialDayType[] = [
    { id: 'sdt-1', name: 'Public Holiday', isHoliday: true, companyId: DEMO_COMPANY_ID },
    { id: 'sdt-2', name: 'Company Event', isHoliday: false, companyId: DEMO_COMPANY_ID },
    { id: 'sdt-3', name: 'Maintenance', isHoliday: true, companyId: DEMO_COMPANY_ID },
];

const DEMO_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Manager', avatarUrl: null, phone: '555-0101', gender: 'Female', companyId: DEMO_COMPANY_ID },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'Cashier', avatarUrl: null, phone: '555-0102', gender: 'Male', companyId: DEMO_COMPANY_ID },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Stocker', avatarUrl: null, phone: '555-0103', gender: 'Male', companyId: DEMO_COMPANY_ID },
  { id: '4', name: 'Diana Miller', email: 'diana@example.com', role: 'Clerk', avatarUrl: null, phone: '555-0104', gender: 'Female', companyId: DEMO_COMPANY_ID },
  { id: '5', name: 'Ethan Davis', email: 'ethan@example.com', role: 'Cashier', avatarUrl: null, phone: '555-0105', gender: 'Male', companyId: DEMO_COMPANY_ID },
  { id: '6', name: 'Fiona Garcia', email: 'fiona@example.com', role: 'Stocker', avatarUrl: null, phone: '555-0106', gender: 'Female', companyId: DEMO_COMPANY_ID },
];

const createShift = (employeeIndex: number, dayOffset: number, startHour: number, endHour: number, locationIndex?: number): Shift => {
    const shiftDate = new Date(startOfWeek);
    shiftDate.setDate(startOfWeek.getDate() + dayOffset);
    const startTime = new Date(shiftDate);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(shiftDate);
    endTime.setHours(endHour, 0, 0, 0);
    return {
        id: `shift-${employeeIndex}-${dayOffset}-${startHour}`, employeeId: DEMO_EMPLOYEES[employeeIndex].id, startTime, endTime,
        locationId: locationIndex !== undefined ? DEMO_LOCATIONS[locationIndex].id : undefined, companyId: DEMO_COMPANY_ID,
    };
};

const createOpenShift = (dayOffset: number, startHour: number, endHour: number, locationIndex: number, deptIndex?: number): Shift => {
    const shiftDate = new Date(startOfWeek);
    shiftDate.setDate(startOfWeek.getDate() + dayOffset);
    const startTime = new Date(shiftDate);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(shiftDate);
    endTime.setHours(endHour, 0, 0, 0);
    return {
        id: `shift-open-${dayOffset}-${startHour}`, employeeId: null, startTime, endTime,
        locationId: DEMO_LOCATIONS[locationIndex].id,
        departmentId: deptIndex !== undefined ? DEMO_DEPARTMENTS[deptIndex].id : undefined,
        companyId: DEMO_COMPANY_ID,
    };
};

const DEMO_SHIFTS: Shift[] = [
    createShift(0, 0, 9, 17, 0), createShift(1, 0, 8, 16, 2),
    createShift(2, 1, 10, 18, 1), createShift(4, 2, 8, 12, 0),
    createShift(0, 2, 13, 21, 0), createShift(5, 3, 14, 22, 1),
    createShift(1, 3, 9, 17, 2), createShift(2, 4, 8, 16, 1),
    createShift(4, 4, 12, 20, 0), createShift(5, 5, 11, 19, 1),
    createOpenShift(0, 16, 22, 2, 0),
];

const createAbsence = (employeeIndex: number, typeIndex: number, startDayOffset: number, endDayOffset: number): Absence => {
    const startDate = new Date(startOfWeek);
    startDate.setDate(startOfWeek.getDate() + startDayOffset);
    const endDate = new Date(startOfWeek);
    endDate.setDate(startOfWeek.getDate() + endDayOffset);
    endDate.setHours(23, 59, 59, 999);
    return {
        id: `absence-${employeeIndex}-${startDayOffset}`, employeeId: DEMO_EMPLOYEES[employeeIndex].id,
        absenceTypeId: DEMO_ABSENCE_TYPES[typeIndex].id, startDate, endDate, companyId: DEMO_COMPANY_ID,
    };
};

const DEMO_ABSENCES: Absence[] = [createAbsence(3, 1, 1, 5)];

const createSpecialDay = (dayOffset: number, typeIndex: number): SpecialDay => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayOffset);
    return { id: `sd-${dayOffset}`, date, typeId: DEMO_SPECIAL_DAY_TYPES[typeIndex].id, coverage: 'all-day', companyId: DEMO_COMPANY_ID };
};

const DEMO_SPECIAL_DAYS: SpecialDay[] = [createSpecialDay(6, 0)];

const createDefaultAvailability = (): WeeklyAvailability => {
    const defaultDay: DayAvailability = { morning: 'available', afternoon: 'available', evening: 'available' };
    return Array(7).fill(defaultDay).map(() => ({...defaultDay})) as WeeklyAvailability;
};

const DEMO_AVAILABILITY: EmployeeAvailability[] = [
    { employeeId: '1', availability: createDefaultAvailability(), companyId: DEMO_COMPANY_ID },
    { employeeId: '2', availability: (() => { const a = createDefaultAvailability(); a[5].morning = a[5].afternoon = a[6].morning = a[6].afternoon = 'unavailable'; return a; })(), companyId: DEMO_COMPANY_ID },
    { employeeId: '3', availability: (() => { const a = createDefaultAvailability(); a[0].evening = a[2].evening = a[4].evening = 'preferred'; return a; })(), companyId: DEMO_COMPANY_ID },
    { employeeId: '4', availability: (() => { const a = createDefaultAvailability(); a[0].morning = a[0].afternoon = a[1].morning = a[1].afternoon = 'unavailable'; return a; })(), companyId: DEMO_COMPANY_ID },
    { employeeId: '5', availability: createDefaultAvailability(), companyId: DEMO_COMPANY_ID },
    { employeeId: '6', availability: createDefaultAvailability(), companyId: DEMO_COMPANY_ID },
];

const DEMO_INBOX_MESSAGES: InboxMessage[] = [
    { id: 'msg-1', employeeId: '2', type: 'absence-request', subject: 'Sick Leave Request', body: 'I need to request sick leave for two days next week.', date: new Date(new Date().setDate(today.getDate() - 1)), status: 'pending', absenceTypeId: 'abs-type-1', startDate: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 8)), endDate: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 9)), companyId: DEMO_COMPANY_ID },
    { id: 'msg-2', employeeId: '6', type: 'complaint', subject: 'Issue with cash register', body: 'The main cash register in the downtown branch is malfunctioning again.', date: new Date(new Date().setDate(today.getDate() - 2)), status: 'pending', companyId: DEMO_COMPANY_ID },
    { id: 'msg-3', employeeId: '1', type: 'absence-request', subject: 'Vacation approved', body: 'This is a past request that has been approved.', date: new Date(new Date().setDate(today.getDate() - 10)), status: 'validated', absenceTypeId: 'abs-type-2', startDate: new Date(new Date().setDate(today.getDate() - 20)), endDate: new Date(new Date().setDate(today.getDate() - 18)), companyId: DEMO_COMPANY_ID },
];


// --- DATABASE INITIALIZATION ---
export const DB: Database = {
    users: [{ 
        id: DEMO_USER_ID, name: 'Admin User', email: 'admin@quickshift.com', plan: 'Pro Plus', avatarUrl: null,
        businessType: 'Company', companyName: 'Quick Shift Inc.', activitySector: 'Technology',
        address: '123 Tech Lane, CA', isVerified: true, companyId: DEMO_COMPANY_ID
    }],
    companies: [{ id: DEMO_COMPANY_ID, name: 'Quick Shift Inc.', ownerId: DEMO_USER_ID }],
    employees: DEMO_EMPLOYEES,
    shifts: DEMO_SHIFTS,
    roles: DEMO_ROLES,
    locations: DEMO_LOCATIONS,
    departments: DEMO_DEPARTMENTS,
    absenceTypes: DEMO_ABSENCE_TYPES,
    absences: DEMO_ABSENCES,
    specialDayTypes: DEMO_SPECIAL_DAY_TYPES,
    specialDays: DEMO_SPECIAL_DAYS,
    inboxMessages: DEMO_INBOX_MESSAGES,
    employeeAvailabilities: DEMO_AVAILABILITY,
};

// --- DATA ACCESS HELPERS ---
export const getCompanyData = (companyId: string) => {
    return {
        employees: DB.employees.filter(e => e.companyId === companyId),
        shifts: DB.shifts.filter(s => s.companyId === companyId),
        roles: DB.roles.filter(r => r.companyId === companyId),
        locations: DB.locations.filter(l => l.companyId === companyId),
        departments: DB.departments.filter(d => d.companyId === companyId),
        absenceTypes: DB.absenceTypes.filter(a => a.companyId === companyId),
        absences: DB.absences.filter(a => a.companyId === companyId),
        specialDayTypes: DB.specialDayTypes.filter(s => s.companyId === companyId),
        specialDays: DB.specialDays.filter(s => s.companyId === companyId),
        inboxMessages: DB.inboxMessages.filter(m => m.companyId === companyId),
        employeeAvailabilities: DB.employeeAvailabilities.filter(e => e.companyId === companyId),
    };
};

export const updateCompanyData = <K extends keyof Database>(companyId: string, dataType: K, data: Database[K]) => {
    // Filter out old data for the company and add the new data
    const otherCompaniesData = DB[dataType].filter((item: any) => item.companyId !== companyId);
    DB[dataType] = [...otherCompaniesData, ...data] as any;
};

export const createDefaultDataForCompany = (companyId: string) => {
    const defaultRoles: Role[] = [
        { id: `role-${companyId}-1`, name: 'Manager', companyId },
        { id: `role-${companyId}-2`, name: 'Employee', companyId },
    ];
    const defaultAbsenceTypes: AbsenceType[] = [
        { id: `abs-type-${companyId}-1`, name: 'Sick Leave', color: '#f44336', companyId },
        { id: `abs-type-${companyId}-2`, name: 'Vacation', color: '#4caf50', companyId },
    ];
    const defaultSpecialDayTypes: SpecialDayType[] = [
        { id: `sdt-${companyId}-1`, name: 'Public Holiday', isHoliday: true, companyId },
    ];
    DB.roles.push(...defaultRoles);
    DB.absenceTypes.push(...defaultAbsenceTypes);
    DB.specialDayTypes.push(...defaultSpecialDayTypes);
};

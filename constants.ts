import { Employee, Shift, Role, Location, Department, AbsenceType, Absence, SpecialDayType, SpecialDay, InboxMessage, EmployeeAvailability, WeeklyAvailability, DayAvailability } from './types';

export const INITIAL_ROLES: Role[] = [
  { id: 'role-1', name: 'Manager' },
  { id: 'role-2', name: 'Cashier' },
  { id: 'role-3', name: 'Stocker' },
  { id: 'role-4', name: 'Clerk' },
];

export const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Main Office', address: '123 Main St' },
  { id: 'loc-2', name: 'Warehouse', address: '456 Industrial Ave' },
  { id: 'loc-3', name: 'Downtown Branch', address: '789 Central Sq' },
];

export const INITIAL_DEPARTMENTS: Department[] = [
    { id: 'dept-1', name: 'Sales' },
    { id: 'dept-2', name: 'Logistics' },
    { id: 'dept-3', name: 'Customer Service' },
];

export const INITIAL_ABSENCE_TYPES: AbsenceType[] = [
    { id: 'abs-type-1', name: 'Sick Leave', color: '#f44336' },
    { id: 'abs-type-2', name: 'Vacation', color: '#4caf50' },
    { id: 'abs-type-3', name: 'Personal Day', color: '#ff9800' },
];

export const INITIAL_SPECIAL_DAY_TYPES: SpecialDayType[] = [
    { id: 'sdt-1', name: 'Public Holiday', isHoliday: true },
    { id: 'sdt-2', name: 'Company Event', isHoliday: false },
    { id: 'sdt-3', name: 'Maintenance', isHoliday: true },
];

export const EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Manager', avatarUrl: null, phone: '555-0101', gender: 'Female' },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'Cashier', avatarUrl: null, phone: '555-0102', gender: 'Male' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Stocker', avatarUrl: null, phone: '555-0103', gender: 'Male' },
  { id: '4', name: 'Diana Miller', email: 'diana@example.com', role: 'Clerk', avatarUrl: null, phone: '555-0104', gender: 'Female' },
  { id: '5', name: 'Ethan Davis', email: 'ethan@example.com', role: 'Cashier', avatarUrl: null, phone: '555-0105', gender: 'Male' },
  { id: '6', name: 'Fiona Garcia', email: 'fiona@example.com', role: 'Stocker', avatarUrl: null, phone: '555-0106', gender: 'Female' },
];

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setHours(0,0,0,0);
    return new Date(d.setDate(diff));
};

const today = new Date();
const startOfWeek = getStartOfWeek(today);

const createShift = (employeeIndex: number, dayOffset: number, startHour: number, endHour: number, locationIndex?: number): Shift => {
    const shiftDate = new Date(startOfWeek);
    shiftDate.setDate(startOfWeek.getDate() + dayOffset);
    
    const startTime = new Date(shiftDate);
    startTime.setHours(startHour, 0, 0, 0);

    const endTime = new Date(shiftDate);
    endTime.setHours(endHour, 0, 0, 0);

    return {
        id: `shift-${employeeIndex}-${dayOffset}-${startHour}`,
        employeeId: EMPLOYEES[employeeIndex].id,
        startTime,
        endTime,
        locationId: locationIndex !== undefined ? INITIAL_LOCATIONS[locationIndex].id : undefined,
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
        id: `shift-open-${dayOffset}-${startHour}`,
        employeeId: null,
        startTime,
        endTime,
        locationId: INITIAL_LOCATIONS[locationIndex].id,
        departmentId: deptIndex !== undefined ? INITIAL_DEPARTMENTS[deptIndex].id : undefined,
    };
}

export const INITIAL_SHIFTS: Shift[] = [
    // Monday
    createShift(0, 0, 9, 17, 0),
    createShift(1, 0, 8, 16, 2),
    // Tuesday
    createShift(2, 1, 10, 18, 1),
    // createShift(3, 1, 9, 17, 2), // Diana has vacation
    // Wednesday
    createShift(4, 2, 8, 12, 0),
    createShift(0, 2, 13, 21, 0),
    // Thursday
    createShift(5, 3, 14, 22, 1),
    createShift(1, 3, 9, 17, 2),
    // Friday
    createShift(2, 4, 8, 16, 1),
    createShift(4, 4, 12, 20, 0),
    // Saturday
    // createShift(3, 5, 10, 18, 2), // Diana has vacation
    createShift(5, 5, 11, 19, 1),

    // Open Shifts
    createOpenShift(0, 16, 22, 2, 0), // Monday, Downtown, Sales
];


const createAbsence = (employeeIndex: number, typeIndex: number, startDayOffset: number, endDayOffset: number): Absence => {
    const startDate = new Date(startOfWeek);
    startDate.setDate(startOfWeek.getDate() + startDayOffset);
    
    const endDate = new Date(startOfWeek);
    endDate.setDate(startOfWeek.getDate() + endDayOffset);
    endDate.setHours(23, 59, 59, 999);

    return {
        id: `absence-${employeeIndex}-${startDayOffset}`,
        employeeId: EMPLOYEES[employeeIndex].id,
        absenceTypeId: INITIAL_ABSENCE_TYPES[typeIndex].id,
        startDate,
        endDate
    };
};

export const INITIAL_ABSENCES: Absence[] = [
    createAbsence(3, 1, 1, 5), // Diana Miller, Vacation, Tue to Sat
];

const createSpecialDay = (dayOffset: number, typeIndex: number): SpecialDay => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayOffset);
    return {
        id: `sd-${dayOffset}`,
        date,
        typeId: INITIAL_SPECIAL_DAY_TYPES[typeIndex].id,
        coverage: 'all-day',
    }
}

export const INITIAL_SPECIAL_DAYS: SpecialDay[] = [
    createSpecialDay(6, 0), // Sunday is a public holiday
];

const createDefaultAvailability = (): WeeklyAvailability => {
    const defaultDay: DayAvailability = { morning: 'available', afternoon: 'available', evening: 'available' };
    return Array(7).fill(defaultDay).map(() => ({...defaultDay})) as WeeklyAvailability;
};

export const INITIAL_AVAILABILITY: EmployeeAvailability[] = [
    {
        employeeId: '1', // Alice Johnson (Manager)
        availability: createDefaultAvailability(),
    },
    {
        employeeId: '2', // Bob Williams (Cashier)
        availability: (() => {
            const avail = createDefaultAvailability();
            avail[5].morning = 'unavailable'; // Sat morning unavailable
            avail[5].afternoon = 'unavailable';
            avail[6].morning = 'unavailable'; // Sun morning unavailable
            avail[6].afternoon = 'unavailable';
            return avail;
        })(),
    },
    {
        employeeId: '3', // Charlie Brown (Stocker)
        availability: (() => {
            const avail = createDefaultAvailability();
            avail[0].evening = 'preferred'; // Mon evening preferred
            avail[2].evening = 'preferred'; // Wed evening preferred
            avail[4].evening = 'preferred'; // Fri evening preferred
            return avail;
        })(),
    },
     {
        employeeId: '4', // Diana Miller
        availability: (() => {
            const avail = createDefaultAvailability();
            avail[0].morning = 'unavailable'; // Mon morning
            avail[0].afternoon = 'unavailable';
            avail[1].morning = 'unavailable'; // Tue morning
            avail[1].afternoon = 'unavailable';
            return avail;
        })(),
    },
    {
        employeeId: '5', // Ethan Davis
        availability: createDefaultAvailability(),
    },
    {
        employeeId: '6', // Fiona Garcia
        availability: createDefaultAvailability(),
    }
];

const nextWeekStart = new Date(startOfWeek);
nextWeekStart.setDate(startOfWeek.getDate() + 7);

const nextWeekTuesday = new Date(nextWeekStart);
nextWeekTuesday.setDate(nextWeekStart.getDate() + 1);
nextWeekTuesday.setHours(0,0,0,0);

const nextWeekWednesday = new Date(nextWeekStart);
nextWeekWednesday.setDate(nextWeekStart.getDate() + 2);
nextWeekWednesday.setHours(23,59,59,999);


export const INITIAL_INBOX_MESSAGES: InboxMessage[] = [
    {
        id: 'msg-1',
        employeeId: '2', // Bob Williams
        type: 'absence-request',
        subject: 'Sick Leave Request',
        body: 'I need to request sick leave for two days next week.',
        date: new Date(new Date().setDate(today.getDate() - 1)),
        status: 'pending',
        absenceTypeId: 'abs-type-1', // Sick Leave
        startDate: nextWeekTuesday,
        endDate: nextWeekWednesday,
    },
    {
        id: 'msg-2',
        employeeId: '6', // Fiona Garcia
        type: 'complaint',
        subject: 'Issue with cash register',
        body: 'The main cash register in the downtown branch is malfunctioning again. It\'s causing long delays for customers.',
        date: new Date(new Date().setDate(today.getDate() - 2)),
        status: 'pending',
    },
    {
        id: 'msg-3',
        employeeId: '1', // Alice Johnson
        type: 'absence-request',
        subject: 'Vacation approved',
        body: 'This is a past request that has been approved.',
        date: new Date(new Date().setDate(today.getDate() - 10)),
        status: 'validated',
        absenceTypeId: 'abs-type-2',
        startDate: new Date(new Date().setDate(today.getDate() - 20)),
        endDate: new Date(new Date().setDate(today.getDate() - 18)),
    },
];
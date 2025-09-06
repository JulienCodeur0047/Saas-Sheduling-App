import { v4 as uuidv4 } from 'uuid';

// Helper functions
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setHours(0, 0, 0, 0);
  return new Date(d.setDate(diff));
};

const today = new Date();
const startOfWeek = getStartOfWeek(today);

// Initial data that corresponds to the frontend constants
export const roles = [
  { id: 'role-1', name: 'Manager', createdAt: new Date(), updatedAt: new Date() },
  { id: 'role-2', name: 'Cashier', createdAt: new Date(), updatedAt: new Date() },
  { id: 'role-3', name: 'Stocker', createdAt: new Date(), updatedAt: new Date() },
  { id: 'role-4', name: 'Clerk', createdAt: new Date(), updatedAt: new Date() },
];

export const locations = [
  { id: 'loc-1', name: 'Main Office', address: '123 Main St', createdAt: new Date(), updatedAt: new Date() },
  { id: 'loc-2', name: 'Warehouse', address: '456 Industrial Ave', createdAt: new Date(), updatedAt: new Date() },
  { id: 'loc-3', name: 'Downtown Branch', address: '789 Central Sq', createdAt: new Date(), updatedAt: new Date() },
];

export const departments = [
  { id: 'dept-1', name: 'Sales', createdAt: new Date(), updatedAt: new Date() },
  { id: 'dept-2', name: 'Logistics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'dept-3', name: 'Customer Service', createdAt: new Date(), updatedAt: new Date() },
];

export const absenceTypes = [
  { id: 'abs-type-1', name: 'Sick Leave', color: '#f44336', createdAt: new Date(), updatedAt: new Date() },
  { id: 'abs-type-2', name: 'Vacation', color: '#4caf50', createdAt: new Date(), updatedAt: new Date() },
  { id: 'abs-type-3', name: 'Personal Day', color: '#ff9800', createdAt: new Date(), updatedAt: new Date() },
];

export const specialDayTypes = [
  { id: 'sdt-1', name: 'Public Holiday', isHoliday: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sdt-2', name: 'Company Event', isHoliday: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sdt-3', name: 'Maintenance', isHoliday: true, createdAt: new Date(), updatedAt: new Date() },
];

export const employees = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Manager', avatarUrl: null, phone: '555-0101', gender: 'Female', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Bob Williams', email: 'bob@example.com', role: 'Cashier', avatarUrl: null, phone: '555-0102', gender: 'Male', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Stocker', avatarUrl: null, phone: '555-0103', gender: 'Male', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Diana Miller', email: 'diana@example.com', role: 'Clerk', avatarUrl: null, phone: '555-0104', gender: 'Female', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'Ethan Davis', email: 'ethan@example.com', role: 'Cashier', avatarUrl: null, phone: '555-0105', gender: 'Male', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'Fiona Garcia', email: 'fiona@example.com', role: 'Stocker', avatarUrl: null, phone: '555-0106', gender: 'Female', createdAt: new Date(), updatedAt: new Date() },
];

// Helper function to create shifts
const createShift = (employeeIndex, dayOffset, startHour, endHour, locationIndex) => {
  const shiftDate = new Date(startOfWeek);
  shiftDate.setDate(startOfWeek.getDate() + dayOffset);
  
  const startTime = new Date(shiftDate);
  startTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date(shiftDate);
  endTime.setHours(endHour, 0, 0, 0);

  return {
    id: `shift-${employeeIndex}-${dayOffset}-${startHour}`,
    employeeId: employees[employeeIndex].id,
    startTime,
    endTime,
    locationId: locationIndex !== undefined ? locations[locationIndex].id : undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

const createOpenShift = (dayOffset, startHour, endHour, locationIndex, deptIndex) => {
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
    locationId: locations[locationIndex].id,
    departmentId: deptIndex !== undefined ? departments[deptIndex].id : undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const shifts = [
  // Monday
  createShift(0, 0, 9, 17, 0),
  createShift(1, 0, 8, 16, 2),
  // Tuesday
  createShift(2, 1, 10, 18, 1),
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
  createShift(5, 5, 11, 19, 1),
  // Open Shifts
  createOpenShift(0, 16, 22, 2, 0),
];

const createAbsence = (employeeIndex, typeIndex, startDayOffset, endDayOffset) => {
  const startDate = new Date(startOfWeek);
  startDate.setDate(startOfWeek.getDate() + startDayOffset);
  
  const endDate = new Date(startOfWeek);
  endDate.setDate(startOfWeek.getDate() + endDayOffset);
  endDate.setHours(23, 59, 59, 999);

  return {
    id: `absence-${employeeIndex}-${startDayOffset}`,
    employeeId: employees[employeeIndex].id,
    absenceTypeId: absenceTypes[typeIndex].id,
    startDate,
    endDate,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const absences = [
  createAbsence(3, 1, 1, 5), // Diana Miller, Vacation, Tue to Sat
];

const createSpecialDay = (dayOffset, typeIndex) => {
  const date = new Date(startOfWeek);
  date.setDate(startOfWeek.getDate() + dayOffset);
  return {
    id: `sd-${dayOffset}`,
    date,
    typeId: specialDayTypes[typeIndex].id,
    coverage: 'all-day',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const specialDays = [
  createSpecialDay(6, 0), // Sunday is a public holiday
];

const createDefaultAvailability = () => {
  const defaultDay = { morning: 'available', afternoon: 'available', evening: 'available' };
  return Array(7).fill(defaultDay).map(() => ({ ...defaultDay }));
};

export const employeeAvailabilities = [
  {
    id: uuidv4(),
    employeeId: '1', // Alice Johnson (Manager)
    availability: createDefaultAvailability(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    employeeId: '2', // Bob Williams (Cashier)
    availability: (() => {
      const avail = createDefaultAvailability();
      avail[5].morning = 'unavailable'; // Sat morning unavailable
      avail[5].afternoon = 'unavailable';
      avail[6].morning = 'unavailable'; // Sun morning unavailable
      avail[6].afternoon = 'unavailable';
      return avail;
    })(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    employeeId: '3', // Charlie Brown (Stocker)
    availability: (() => {
      const avail = createDefaultAvailability();
      avail[0].evening = 'preferred'; // Mon evening preferred
      avail[2].evening = 'preferred'; // Wed evening preferred
      avail[4].evening = 'preferred'; // Fri evening preferred
      return avail;
    })(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    employeeId: '4', // Diana Miller
    availability: (() => {
      const avail = createDefaultAvailability();
      avail[0].morning = 'unavailable'; // Mon morning
      avail[0].afternoon = 'unavailable';
      avail[1].morning = 'unavailable'; // Tue morning
      avail[1].afternoon = 'unavailable';
      return avail;
    })(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    employeeId: '5', // Ethan Davis
    availability: createDefaultAvailability(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    employeeId: '6', // Fiona Garcia
    availability: createDefaultAvailability(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const nextWeekStart = new Date(startOfWeek);
nextWeekStart.setDate(startOfWeek.getDate() + 7);

const nextWeekTuesday = new Date(nextWeekStart);
nextWeekTuesday.setDate(nextWeekStart.getDate() + 1);
nextWeekTuesday.setHours(0, 0, 0, 0);

const nextWeekWednesday = new Date(nextWeekStart);
nextWeekWednesday.setDate(nextWeekStart.getDate() + 2);
nextWeekWednesday.setHours(23, 59, 59, 999);

export const inboxMessages = [
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
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'msg-2',
    employeeId: '6', // Fiona Garcia
    type: 'complaint',
    subject: 'Issue with cash register',
    body: 'The main cash register in the downtown branch is malfunctioning again. It\'s causing long delays for customers.',
    date: new Date(new Date().setDate(today.getDate() - 2)),
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
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
    createdAt: new Date(),
    updatedAt: new Date()
  },
];
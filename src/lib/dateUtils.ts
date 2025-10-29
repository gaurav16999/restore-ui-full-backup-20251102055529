// Date conversion utilities for AD (Gregorian) and BS (Bikram Sambat) calendars

// Bikram Sambat calendar data - approximate conversion
// Note: This is a simplified conversion. For production use, consider using a proper BS calendar library
const BS_AD_OFFSET = 56.7; // Approximate years difference

// Days in BS months (approximate - varies by year)
const BS_MONTHS_DAYS = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];

// Helper function to check if AD year is leap year
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Convert AD date to BS date (approximate)
export function convertADtoBS(adDate: string): string {
  try {
    if (!adDate) return '';
    
    const date = new Date(adDate);
    if (isNaN(date.getTime())) return '';
    
    const adYear = date.getFullYear();
    const adMonth = date.getMonth() + 1; // JS months are 0-based
    const adDay = date.getDate();
    
    // More accurate conversion based on actual calendar differences
    // BS calendar typically starts around April 13-14 in AD calendar
    let bsYear = adYear + 57; // Base offset
    let bsMonth = adMonth;
    let bsDay = adDay;
    
    // Adjust for the fact that BS new year starts around April 13-14
    if (adMonth < 4 || (adMonth === 4 && adDay < 14)) {
      bsYear -= 1;
      bsMonth = adMonth + 9;
      if (bsMonth > 12) bsMonth -= 12;
    } else {
      bsMonth = adMonth - 3;
      if (bsMonth <= 0) {
        bsMonth += 12;
        bsYear -= 1;
      }
    }
    
    // Ensure valid day for BS month
    const maxDaysInBSMonth = BS_MONTHS_DAYS[bsMonth - 1] || 30;
    if (bsDay > maxDaysInBSMonth) {
      bsDay = maxDaysInBSMonth;
    }
    
    // Format as YYYY-MM-DD
    return `${bsYear}-${bsMonth.toString().padStart(2, '0')}-${bsDay.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting AD to BS:', error);
    return '';
  }
}

// Convert BS date to AD date (approximate)
export function convertBStoAD(bsDate: string): string {
  try {
    if (!bsDate) return '';
    
    // Parse BS date
    const parts = bsDate.split('-');
    if (parts.length !== 3) return '';
    
    const bsYear = parseInt(parts[0]);
    const bsMonth = parseInt(parts[1]);
    const bsDay = parseInt(parts[2]);
    
    if (isNaN(bsYear) || isNaN(bsMonth) || isNaN(bsDay)) return '';
    if (bsMonth < 1 || bsMonth > 12 || bsDay < 1 || bsDay > 32) return '';
    
    // More accurate conversion - reverse of AD to BS logic
    let adYear = bsYear - 57; // Base offset
    let adMonth = bsMonth;
    let adDay = bsDay;
    
    // Adjust for the calendar difference
    if (bsMonth <= 9) {
      adMonth = bsMonth + 3;
    } else {
      adMonth = bsMonth - 9;
      adYear += 1;
    }
    
    // Validate and adjust day if necessary
    try {
      const testDate = new Date(adYear, adMonth - 1, adDay);
      if (testDate.getMonth() !== adMonth - 1) {
        // Invalid date, adjust to last day of month
        adDay = new Date(adYear, adMonth, 0).getDate();
      }
    } catch (error) {
      // If date is invalid, use last day of month
      adDay = new Date(adYear, adMonth, 0).getDate();
    }
    
    // Format as YYYY-MM-DD
    return `${adYear}-${adMonth.toString().padStart(2, '0')}-${adDay.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting BS to AD:', error);
    return '';
  }
}

// Validate BS date format
export function isValidBSDate(bsDate: string): boolean {
  if (!bsDate) return false;
  
  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(bsDate)) return false;
  
  const parts = bsDate.split('-');
  if (parts.length !== 3) return false;
  
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  // Basic validation
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 2000 || year > 2200) return false; // Reasonable BS year range
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 32) return false;
  
  // Check against BS month days
  const maxDaysInMonth = BS_MONTHS_DAYS[month - 1] || 32;
  if (day > maxDaysInMonth) return false;
  
  return true;
}

// Get current BS date (approximate)
export function getCurrentBSDate(): string {
  const today = new Date();
  const todayAD = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  return convertADtoBS(todayAD);
}

// Validate AD date format and value
export function isValidADDate(adDate: string): boolean {
  if (!adDate) return false;
  
  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(adDate)) return false;
  
  try {
    const date = new Date(adDate);
    // Check if the date is valid and matches the input
    return date.toISOString().split('T')[0] === adDate;
  } catch (error) {
    return false;
  }
}

// Format date for display
export function formatDateForDisplay(date: string, calendarType: 'AD' | 'BS'): string {
  if (!date) return '';
  
  try {
    if (calendarType === 'AD') {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      // For BS, just return the formatted string
      const parts = date.split('-');
      if (parts.length === 3) {
        return `${parts[2]} ${getMonthNameBS(parseInt(parts[1]))} ${parts[0]} BS`;
      }
      return `${date} BS`;
    }
  } catch (error) {
    return date;
  }
}

// Get BS month name
function getMonthNameBS(month: number): string {
  const monthNames = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  return monthNames[month - 1] || 'Unknown';
}
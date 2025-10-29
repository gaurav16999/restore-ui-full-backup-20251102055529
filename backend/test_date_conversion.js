// Test the date conversion utilities
import { convertADtoBS, convertBStoAD, isValidBSDate } from '../src/lib/dateUtils.js';

console.log('Testing AD to BS conversion:');
console.log('2025-10-26 (AD) =>', convertADtoBS('2025-10-26'));
console.log('2024-01-01 (AD) =>', convertADtoBS('2024-01-01'));
console.log('2023-12-31 (AD) =>', convertADtoBS('2023-12-31'));

console.log('\nTesting BS to AD conversion:');
console.log('2081-07-10 (BS) =>', convertBStoAD('2081-07-10'));
console.log('2080-01-01 (BS) =>', convertBStoAD('2080-01-01'));
console.log('2082-12-30 (BS) =>', convertBStoAD('2082-12-30'));

console.log('\nTesting BS date validation:');
console.log('2081-07-10 is valid:', isValidBSDate('2081-07-10'));
console.log('2081-13-10 is valid:', isValidBSDate('2081-13-10'));
console.log('invalid-date is valid:', isValidBSDate('invalid-date'));
console.log('2081-07-40 is valid:', isValidBSDate('2081-07-40'));

console.log('\nTesting round-trip conversion:');
const adDate = '2025-10-26';
const bsDate = convertADtoBS(adDate);
const backToAD = convertBStoAD(bsDate);
console.log(`AD: ${adDate} -> BS: ${bsDate} -> AD: ${backToAD}`);
import { format, formatDistance, formatRelative } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function formatDate(date: Date | Timestamp | undefined | null, formatStr: string = 'PPP'): string {
  if (!date) return '';

  try {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    if (!(jsDate instanceof Date) || isNaN(jsDate.getTime())) {
      return '';
    }
    return format(jsDate, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function formatTime(date: Date | Timestamp | undefined | null, formatStr: string = 'p'): string {
  if (!date) return '';

  try {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    if (!(jsDate instanceof Date) || isNaN(jsDate.getTime())) {
      return '';
    }
    return format(jsDate, formatStr);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

export function formatDateTime(date: Date | Timestamp | undefined | null): string {
  if (!date) return '';

  try {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    if (!(jsDate instanceof Date) || isNaN(jsDate.getTime())) {
      return '';
    }
    return format(jsDate, 'PPP p');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
}

export function formatRelativeTime(date: Date | Timestamp | undefined | null): string {
  if (!date) return '';

  try {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    if (!(jsDate instanceof Date) || isNaN(jsDate.getTime())) {
      return '';
    }
    return formatDistance(jsDate, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

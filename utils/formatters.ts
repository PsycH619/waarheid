import { format, formatDistance, formatRelative } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function formatDate(date: Date | Timestamp, formatStr: string = 'PPP'): string {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return format(jsDate, formatStr);
}

export function formatTime(date: Date | Timestamp, formatStr: string = 'p'): string {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return format(jsDate, formatStr);
}

export function formatDateTime(date: Date | Timestamp): string {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return format(jsDate, 'PPP p');
}

export function formatRelativeTime(date: Date | Timestamp): string {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return formatDistance(jsDate, new Date(), { addSuffix: true });
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

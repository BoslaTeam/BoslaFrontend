export function formatTimeAgo(date: Date | string | number): string {
  if (!date) return 'منذ فترة';
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return 'منذ فترة';

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  
  if (diffMs < 0) return 'الآن';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) {
    if (diffDays === 1) return 'منذ يوم';
    if (diffDays === 2) return 'منذ يومين';
    return `منذ ${diffDays} أيام`;
  }
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) {
    if (diffWeeks === 1) return 'منذ أسبوع';
    if (diffWeeks === 2) return 'منذ أسبوعين';
    return `منذ ${diffWeeks} أسابيع`;
  }
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    if (diffMonths === 1) return 'منذ شهر';
    if (diffMonths === 2) return 'منذ شهرين';
    return `منذ ${diffMonths} أشهر`;
  }
  
  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return 'منذ سنة';
  if (diffYears === 2) return 'منذ سنتين';
  return `منذ ${diffYears} سنوات`;
}

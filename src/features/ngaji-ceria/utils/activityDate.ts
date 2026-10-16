export function activityDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function yesterdayActivityDate(date = new Date()): string {
  return activityDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
}

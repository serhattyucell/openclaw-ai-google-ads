export const dateRange = (days: number) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - days);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
};

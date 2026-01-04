export const filterByTime = (news, timeFilter) => {
  const now = new Date();
  const newsDate = new Date(news.date);
  const diffDays = Math.floor((now - newsDate) / (1000 * 60 * 60 * 24));
  
  if (timeFilter === 'today') return diffDays === 0;
  if (timeFilter === '7days') return diffDays <= 7;
  if (timeFilter === '30days') return diffDays <= 30;
  return true;
};

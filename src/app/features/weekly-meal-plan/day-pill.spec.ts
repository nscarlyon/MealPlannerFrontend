import { DayPillHelper } from './day-pill';

describe('DayPillHelper', () => {
  describe('getDatesForWeek', () => {
    it('should return 7 consecutive dates starting on Monday when given a Wednesday', () => {
      // Wednesday, Oct 14, 2026
      const wednesday = new Date(2026, 9, 14);
      const dates = DayPillHelper.getDatesForWeek(wednesday);

      expect(dates.length).toBe(7);
      expect(dates[0].getDay()).toBe(1); // Monday (Oct 12, 2026)
      expect(dates[0].getDate()).toBe(12);
      expect(dates[1].getDate()).toBe(13); // Tuesday
      expect(dates[2].getDate()).toBe(14); // Wednesday
      expect(dates[3].getDate()).toBe(15); // Thursday
      expect(dates[4].getDate()).toBe(16); // Friday
      expect(dates[5].getDate()).toBe(17); // Saturday
      expect(dates[6].getDate()).toBe(18); // Sunday
      expect(dates[6].getDay()).toBe(0); // Sunday
    });

    it('should correctly handle Sunday as the end of the current week', () => {
      // Sunday, Oct 18, 2026
      const sunday = new Date(2026, 9, 18);
      const dates = DayPillHelper.getDatesForWeek(sunday);

      expect(dates.length).toBe(7);
      expect(dates[0].getDate()).toBe(12); // Monday (Oct 12, 2026)
      expect(dates[0].getDay()).toBe(1);
      expect(dates[6].getDate()).toBe(18); // Sunday (Oct 18, 2026)
      expect(dates[6].getDay()).toBe(0);
    });

    it('should correctly handle Monday as the start of the current week', () => {
      // Monday, Oct 12, 2026
      const monday = new Date(2026, 9, 12);
      const dates = DayPillHelper.getDatesForWeek(monday);

      expect(dates.length).toBe(7);
      expect(dates[0].getDate()).toBe(12);
      expect(dates[6].getDate()).toBe(18);
    });

    it('should return distinct Date instances and not mutate each other', () => {
      const dates = DayPillHelper.getDatesForWeek(new Date(2026, 9, 14));
      const mondayOriginalTime = dates[0].getTime();

      // Mutating the Tuesday date object should not affect Monday
      dates[1].setDate(dates[1].getDate() + 10);
      expect(dates[0].getTime()).toBe(mondayOriginalTime);
    });
  });

  describe('getDayPills', () => {
    it('should return 7 DayPill objects with correct labels, names, classes, and dates', () => {
      const referenceDate = new Date(2026, 9, 14);
      const pills = DayPillHelper.getDayPills(referenceDate);

      expect(pills.length).toBe(7);

      expect(pills[0].label).toBe('M');
      expect(pills[0].name).toBe('Monday');
      expect(pills[0].className).toBe('pill-m');
      expect(pills[0].numberOfMeals).toBe(0);
      expect(pills[0].date.getDay()).toBe(1);

      expect(pills[6].label).toBe('Su');
      expect(pills[6].name).toBe('Sunday');
      expect(pills[6].className).toBe('pill-su');
      expect(pills[6].numberOfMeals).toBe(0);
      expect(pills[6].date.getDay()).toBe(0);
    });
  });
});

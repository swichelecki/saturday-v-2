import moment from 'moment-timezone';

const handleDayNightCheck = (weather_code) => {
  if (weather_code > 2) return weather_code;

  const MOON = 100;
  const MOON_CLOUDS = 101;

  const today = moment().tz('America/Chicago').format();
  const year = moment().tz('America/Chicago').format('YYYY');
  const nextYear = parseInt(year) + 1;

  let todayFormattedWinterSunrise = today.split('T')[0];
  todayFormattedWinterSunrise = `${todayFormattedWinterSunrise}T06:00:00-00:00`;
  let todayFormattedWinterSunSet = today.split('T')[0];
  todayFormattedWinterSunSet = `${todayFormattedWinterSunSet}T17:00:00-00:00`;

  let todayFormattedSummerSunrise = today.split('T')[0];
  todayFormattedSummerSunrise = `${todayFormattedSummerSunrise}T07:00:00-00:00`;
  let todayFormattedSummerSunSet = today.split('T')[0];
  todayFormattedSummerSunSet = `${todayFormattedSummerSunSet}T20:00:00-00:00`;

  // check for fall/winter
  if (moment(today).isBetween(`${year}-10-01`, `${nextYear}-04-01`)) {
    // check day or night
    if (
      moment(today).isBetween(
        todayFormattedWinterSunrise,
        todayFormattedWinterSunSet,
        'hour'
      )
    ) {
      return weather_code;
    } else {
      // check weather code for night
      if (weather_code === 0 || weather_code === 1) {
        return MOON;
      } else {
        return MOON_CLOUDS;
      }
    }
  }

  // check for spring/summer
  if (moment(today).isBetween(`${year}-04-02`, `${nextYear}-09-30`)) {
    // check day or night
    if (
      moment(today).isBetween(
        todayFormattedSummerSunrise,
        todayFormattedSummerSunSet,
        'hour'
      )
    ) {
      return weather_code;
    } else {
      // check weather code for night
      if (weather_code === 0 || weather_code === 1) {
        return MOON;
      } else {
        return MOON_CLOUDS;
      }
    }
  }
};

export default handleDayNightCheck;

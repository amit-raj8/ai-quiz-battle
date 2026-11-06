/**
 * Deterministic Tier Badge System based on Wins
 * 
 * Progression Stages:
 * - 0 Wins: Unranked
 * - 1st Win (1-4 Wins): Bronze
 * - 5th Win (5-9 Wins): Silver
 * - 10th Win (10-14 Wins): Gold
 * - 15th Win (15-34 Wins): Diamond
 * - 35th Win (35-49 Wins): Master
 * - 50th Win (50+ Wins): Grandmaster with Roman Numerals (50 = Grandmaster I, 51 = Grandmaster II, etc.)
 */

export function toRoman(num) {
  if (!num || num <= 0) return '';
  const romanMap = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result;
}

export const BADGE_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    minWins: 1,
    maxWins: 4,
    color: '#CD7F32',
    accent: 'text-[#CD7F32]',
    bg: 'bg-[#2E180A]',
    border: 'border-[#CD7F32]',
    glow: 'shadow-[0_0_12px_rgba(205,127,50,0.3)]',
    badgeColor: 'from-[#8C4A1E] to-[#CD7F32]',
    description: 'Awarded upon securing your 1st arena victory.'
  },
  {
    id: 'silver',
    name: 'Silver',
    minWins: 5,
    maxWins: 9,
    color: '#E0E0E0',
    accent: 'text-[#E0E0E0]',
    bg: 'bg-[#1E2024]',
    border: 'border-[#CCCCCC]',
    glow: 'shadow-[0_0_12px_rgba(224,224,224,0.3)]',
    badgeColor: 'from-[#666666] to-[#E0E0E0]',
    description: 'Awarded upon reaching 5 arena victories.'
  },
  {
    id: 'gold',
    name: 'Gold',
    minWins: 10,
    maxWins: 14,
    color: '#FFC000',
    accent: 'text-[#FFC000]',
    bg: 'bg-[#241A04]',
    border: 'border-[#FFC000]',
    glow: 'shadow-[0_0_15px_rgba(255,192,0,0.35)]',
    badgeColor: 'from-[#B8860B] to-[#FFC000]',
    description: 'Awarded upon reaching 10 arena victories.'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    minWins: 15,
    maxWins: 34,
    color: '#00F0FF',
    accent: 'text-[#00F0FF]',
    bg: 'bg-[#041E24]',
    border: 'border-[#00F0FF]',
    glow: 'shadow-[0_0_15px_rgba(0,240,255,0.4)]',
    badgeColor: 'from-[#0284C7] to-[#00F0FF]',
    description: 'Awarded upon reaching 15 arena victories.'
  },
  {
    id: 'master',
    name: 'Master',
    minWins: 35,
    maxWins: 49,
    color: '#C084FC',
    accent: 'text-[#C084FC]',
    bg: 'bg-[#1C0A2E]',
    border: 'border-[#A855F7]',
    glow: 'shadow-[0_0_18px_rgba(168,85,247,0.45)]',
    badgeColor: 'from-[#7E22CE] to-[#C084FC]',
    description: 'Awarded upon reaching 35 arena victories.'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    minWins: 50,
    maxWins: Infinity,
    color: '#FF2D55',
    accent: 'text-[#FF2D55]',
    bg: 'bg-[#290810]',
    border: 'border-[#FF2D55]',
    glow: 'shadow-[0_0_22px_rgba(255,45,85,0.5)]',
    badgeColor: 'from-[#BE123C] to-[#FF2D55]',
    description: 'Apex combat rank awarded upon achieving 50+ arena victories. Advances in Roman numerals with every victory.'
  }
];

/**
 * Calculates current badge and progress toward the next badge based on wins.
 * 
 * @param {number} rawWins - Total career wins
 * @returns {Object} Complete badge telemetry object
 */
export function getBadge(rawWins = 0) {
  const wins = Math.max(0, Number(rawWins) || 0);

  if (wins === 0) {
    return {
      id: 'unranked',
      tier: 'Unranked',
      name: 'Unranked',
      roman: '',
      color: '#7D7D7D',
      accent: 'text-[#7D7D7D]',
      bg: 'bg-[#141414]',
      border: 'border-[#333333]',
      glow: '',
      badgeColor: 'from-[#222222] to-[#333333]',
      wins,
      isUnlocked: false,
      nextBadge: {
        id: 'bronze',
        name: 'Bronze',
        requiredWins: 1,
        winsLeft: 1,
        progressPercent: 0,
        nextGoalText: '1 win until Bronze badge'
      }
    };
  }

  // 50+ Wins: Grandmaster with Roman Numerals
  if (wins >= 50) {
    const gmLevel = wins - 49;
    const romanNumeral = toRoman(gmLevel);
    const nextRoman = toRoman(gmLevel + 1);

    return {
      ...BADGE_TIERS[5],
      tier: 'Grandmaster',
      name: `Grandmaster ${romanNumeral}`,
      roman: romanNumeral,
      wins,
      isUnlocked: true,
      nextBadge: {
        id: 'grandmaster',
        name: `Grandmaster ${nextRoman}`,
        requiredWins: wins + 1,
        winsLeft: 1,
        progressPercent: 100,
        nextGoalText: `1 win until Grandmaster ${nextRoman} (at ${wins + 1} wins)`
      }
    };
  }

  // 35 - 49 Wins: Master
  if (wins >= 35) {
    const winsLeft = 50 - wins;
    const progressPercent = Math.round(((wins - 35) / (50 - 35)) * 100);
    return {
      ...BADGE_TIERS[4],
      tier: 'Master',
      name: 'Master',
      roman: '',
      wins,
      isUnlocked: true,
      nextBadge: {
        id: 'grandmaster',
        name: 'Grandmaster I',
        requiredWins: 50,
        winsLeft,
        progressPercent,
        nextGoalText: `${winsLeft} win${winsLeft === 1 ? '' : 's'} until Grandmaster badge (at 50 wins)`
      }
    };
  }

  // 15 - 34 Wins: Diamond
  if (wins >= 15) {
    const winsLeft = 35 - wins;
    const progressPercent = Math.round(((wins - 15) / (35 - 15)) * 100);
    return {
      ...BADGE_TIERS[3],
      tier: 'Diamond',
      name: 'Diamond',
      roman: '',
      wins,
      isUnlocked: true,
      nextBadge: {
        id: 'master',
        name: 'Master',
        requiredWins: 35,
        winsLeft,
        progressPercent,
        nextGoalText: `${winsLeft} win${winsLeft === 1 ? '' : 's'} until Master badge (at 35 wins)`
      }
    };
  }

  // 10 - 14 Wins: Gold
  if (wins >= 10) {
    const winsLeft = 15 - wins;
    const progressPercent = Math.round(((wins - 10) / (15 - 10)) * 100);
    return {
      ...BADGE_TIERS[2],
      tier: 'Gold',
      name: 'Gold',
      roman: '',
      wins,
      isUnlocked: true,
      nextBadge: {
        id: 'diamond',
        name: 'Diamond',
        requiredWins: 15,
        winsLeft,
        progressPercent,
        nextGoalText: `${winsLeft} win${winsLeft === 1 ? '' : 's'} until Diamond badge (at 15 wins)`
      }
    };
  }

  // 5 - 9 Wins: Silver
  if (wins >= 5) {
    const winsLeft = 10 - wins;
    const progressPercent = Math.round(((wins - 5) / (10 - 5)) * 100);
    return {
      ...BADGE_TIERS[1],
      tier: 'Silver',
      name: 'Silver',
      roman: '',
      wins,
      isUnlocked: true,
      nextBadge: {
        id: 'gold',
        name: 'Gold',
        requiredWins: 10,
        winsLeft,
        progressPercent,
        nextGoalText: `${winsLeft} win${winsLeft === 1 ? '' : 's'} until Gold badge (at 10 wins)`
      }
    };
  }

  // 1 - 4 Wins: Bronze
  const winsLeft = 5 - wins;
  const progressPercent = Math.round(((wins - 1) / (5 - 1)) * 100);
  return {
    ...BADGE_TIERS[0],
    tier: 'Bronze',
    name: 'Bronze',
    roman: '',
    wins,
    isUnlocked: true,
    nextBadge: {
      id: 'silver',
      name: 'Silver',
      requiredWins: 5,
      winsLeft,
      progressPercent,
      nextGoalText: `${winsLeft} win${winsLeft === 1 ? '' : 's'} until Silver badge (at 5 wins)`
    }
  };
}

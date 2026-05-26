// teamFlags.js
// Maps team names (as stored in the DB from football-data.org) to emoji flags.
// Returns '?' for any unmapped team.

const FLAGS = {
  'Algeria':             '🇩🇿',
  'Argentina':           '🇦🇷',
  'Australia':           '🇦🇺',
  'Austria':             '🇦🇹',
  'Belgium':             '🇧🇪',
  'Bosnia-Herzegovina':  '🇧🇦',
  'Brazil':              '🇧🇷',
  'Canada':              '🇨🇦',
  'Cape Verde Islands':  '🇨🇻',
  'Colombia':            '🇨🇴',
  'Congo DR':            '🇨🇩',
  'Croatia':             '🇭🇷',
  'Curaçao':             '🇨🇼',
  'Czechia':             '🇨🇿',
  'Ecuador':             '🇪🇨',
  'Egypt':               '🇪🇬',
  'England':             '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France':              '🇫🇷',
  'Germany':             '🇩🇪',
  'Ghana':               '🇬🇭',
  'Haiti':               '🇭🇹',
  'Iran':                '🇮🇷',
  'Iraq':                '🇮🇶',
  'Ivory Coast':         '🇨🇮',
  'Japan':               '🇯🇵',
  'Jordan':              '🇯🇴',
  'Mexico':              '🇲🇽',
  'Morocco':             '🇲🇦',
  'Netherlands':         '🇳🇱',
  'New Zealand':         '🇳🇿',
  'Norway':              '🇳🇴',
  'Panama':              '🇵🇦',
  'Paraguay':            '🇵🇾',
  'Portugal':            '🇵🇹',
  'Qatar':               '🇶🇦',
  'Saudi Arabia':        '🇸🇦',
  'Scotland':            '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Senegal':             '🇸🇳',
  'South Africa':        '🇿🇦',
  'South Korea':         '🇰🇷',
  'Spain':               '🇪🇸',
  'Sweden':              '🇸🇪',
  'Switzerland':         '🇨🇭',
  'Tunisia':             '🇹🇳',
  'Turkey':              '🇹🇷',
  'United States':       '🇺🇸',
  'Uruguay':             '🇺🇾',
  'Uzbekistan':          '🇺🇿',
}

/**
 * Returns the emoji flag for a team name, or '?' if not found.
 * @param {string} teamName
 * @returns {string}
 */
export function getFlag(teamName) {
  return FLAGS[teamName] ?? '?'
}

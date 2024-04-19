function format(diff, divisor, unit, past, future, isInTheFuture) {
    var val = Math.round(Math.abs(diff) / divisor);
    if (isInTheFuture)
        return val <= 1 ? future : 'in ' + val + ' ' + unit + 's';
    return val <= 1 ? past : val + ' ' + unit + 's ago';
}
var units = [
    { max: 2760000, value: 60000, name: 'minute', past: 'il y a une minute', future: 'dans une minute' },
    { max: 72000000, value: 3600000, name: 'heure', past: 'il y a une heure', future: 'dans une heure' },
    { max: 518400000, value: 86400000, name: 'jour', past: 'hier', future: 'demain' },
    { max: 2419200000, value: 604800000, name: 'semaine', past: 'la semaine dernière', future: 'dans une semaine' },
    { max: 28512000000, value: 2592000000, name: 'mois', past: 'le mois dernier', future: 'dans un mois' } // max: 11 mois
];

module.exports = function ago(date, max) {
    var diff = Date.now() - date.getTime();
    // less than a minute
    if (Math.abs(diff) < 60000)
        return 'just now';
    for (var i = 0; i < units.length; i++) {
        if (Math.abs(diff) < units[i].max || (max && units[i].name === max)) {
            return format(diff, units[i].value, units[i].name, units[i].past, units[i].future, diff < 0);
        }
    }
    // `year` is the final unit.
    // same as:
    //  {
    //    max: Infinity,
    //    value: 31536000000,
    //    name: 'year',
    //    past: 'last year'
    //  }
    return format(diff, 31536000000, 'year', 'last year', 'in a year', diff < 0);
};

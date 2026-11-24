/* Jasiri tickets · sample data for the demo.
   Games, seats, prices, people and numbers are invented. The arena layout is approximate. */
(function (G) {
  var BLOCKS = {
    G1: { side: 'North', tier: 'upper tier, north', colour: 'g', gate: 'Gate 2', arrive: '5:15–5:45 pm', price: 1000 },
    G2: { side: 'North', tier: 'upper tier, north', colour: 'g', gate: 'Gate 2', arrive: '5:15–5:45 pm', price: 1000 },
    G3: { side: 'North', tier: 'upper tier, north', colour: 'g', gate: 'Gate 2', arrive: '5:15–5:45 pm', price: 1000 },
    G4: { side: 'North', tier: 'upper tier, north', colour: 'g', gate: 'Gate 2', arrive: '5:15–5:45 pm', price: 1000 },
    Y1: { side: 'South', tier: 'upper tier, south', colour: 'y', gate: 'Gate 1', arrive: '5:00–5:30 pm', price: 1000 },
    Y2: { side: 'South', tier: 'upper tier, south', colour: 'y', gate: 'Gate 1', arrive: '5:00–5:30 pm', price: 1000 },
    Y3: { side: 'South', tier: 'upper tier, south', colour: 'y', gate: 'Gate 1', arrive: '5:00–5:30 pm', price: 1000, soldOut: true },
    Y4: { side: 'South', tier: 'upper tier, south', colour: 'y', gate: 'Gate 1', arrive: '5:00–5:30 pm', price: 1000 },
    B1: { side: 'West end', tier: 'end tier, west', colour: 'b', gate: 'Gate 3', arrive: '5:15–5:45 pm', price: 1000 },
    B2: { side: 'West end', tier: 'end tier, west', colour: 'b', gate: 'Gate 3', arrive: '5:15–5:45 pm', price: 1000 },
    B3: { side: 'East end', tier: 'end tier, east', colour: 'b', gate: 'Gate 4', arrive: '5:30–6:00 pm', price: 1000 },
    B4: { side: 'East end', tier: 'end tier, east', colour: 'b', gate: 'Gate 4', arrive: '5:30–6:00 pm', price: 1000 },
    VN: { side: 'Courtside', tier: 'courtside VIP, north', colour: 'r', gate: 'Gate 2', arrive: '5:15–5:45 pm', price: 2000, name: 'Courtside N' },
    VS: { side: 'Courtside', tier: 'courtside VIP, south', colour: 'r', gate: 'Gate 1', arrive: '5:00–5:30 pm', price: 2000, name: 'Courtside S' }
  };
  var COLOUR = { g: { name: 'Green', hex: '#2FA866' }, y: { name: 'Yellow', hex: '#E9C440' }, b: { name: 'Blue', hex: '#4A86E8' }, r: { name: 'Red', hex: '#E5484D' } };
  var RESALE = { G1: ['B5', 'B6'], G2: ['B2', 'B3', 'F11'], Y2: ['E9'] };
  var KEEP_OPEN = { G2: ['C4', 'C5', 'C6'] };
  var SEATS_PER_ROW = 14;

  function rowsFor(id) { return id.charAt(0) == 'V' ? ['A', 'B'] : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; }

  // Deterministic seat map per block: 'open', 'taken' or 'resale'.
  function seatMap(id) {
    var seed = 0; for (var i = 0; i < id.length; i++) seed = seed * 31 + id.charCodeAt(i);
    seed = seed % 233280;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var rows = rowsFor(id), map = {}, b = BLOCKS[id], rs = RESALE[id] || [], keep = KEEP_OPEN[id] || [];
    rows.forEach(function (r) {
      for (var n = 1; n <= SEATS_PER_ROW; n++) {
        var s = r + n, roll = rnd();
        if (b.soldOut) map[s] = 'taken';
        else if (rs.indexOf(s) >= 0) map[s] = 'resale';
        else if (keep.indexOf(s) >= 0) map[s] = 'open';
        else map[s] = roll < (id.charAt(0) == 'V' ? 0.5 : 0.34) ? 'taken' : 'open';
      }
    });
    return map;
  }

  G.JT_DATA = {
    game: { title: 'Thunder vs KPA', sport: 'Basketball', league: 'League basketball', venue: 'Kasarani indoor arena', day: 'Sat 28 Nov', time: '6:00 pm', gatesOpen: '5:15 pm' },
    other: { title: 'Kenya vs Uganda', venue: 'Kasarani stadium', day: 'Sat 5 Dec', queueOpens: 'Mon 12:00 pm' },
    blocks: BLOCKS, colour: COLOUR, seatsPerRow: SEATS_PER_ROW, rowsFor: rowsFor, seatMap: seatMap,
    phone: '0712 ··· 448',
    contacts: [
      { id: 'brian', name: 'Brian Otieno', short: 'Brian', initials: 'BO', phone: '0722 ··· 105' },
      { id: 'aisha', name: 'Aisha Mwangi', short: 'Aisha', initials: 'AM', phone: '0733 ··· 271' }
    ],
    queue: { ahead: 3412, total: 41880, left: 18240 },
    steward: [
      { kind: 'ok', title: 'Let in', sub: 'G2 · Row C · Seat 4', lines: ['Green seats, north side', 'Ticket 1 of 3 · 0712 ··· 448'], foot: 'Scanned just now' },
      { kind: 'dup', title: "Don't let in", sub: 'Already scanned', lines: ['First scanned at Gate 2, 5:12 pm', '19 minutes ago · probably a copy'], foot: 'Has an M-Pesa code? Send them to the help desk' },
      { kind: 'gate', title: 'Wrong gate', sub: 'Send to Gate 4', lines: ['B3 · Row F · Seat 9 · blue seats', 'Turn left, about 2 minutes'], foot: 'Valid ticket · not scanned yet' }
    ]
  };
})(window);

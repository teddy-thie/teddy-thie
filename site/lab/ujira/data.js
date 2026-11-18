/* Ujira · demo data. Every person, company, number, rate, reference and licence here is invented.
   The rules (M-Pesa's KSh 250,000 per payment and KSh 500,000 a day, PesaLink's KSh 999,999 per
   transfer) are the real published limits the design is built around. */
window.UJ_DATA = {
  today: '2026-11-18',
  overdueDay: '2026-12-03',
  rate: 129.90,          // demo rate, KSh per US dollar
  rateDrift: -0.20,      // how far the demo rate moves when a quote runs out
  feePerThousand: 5,     // 0.5%
  lockSeconds: 60,
  mpesa: { perPayment: 250000, perDay: 500000 },
  pesalink: { perTransfer: 999999 },
  me: { first: 'Wanjiru', name: 'Wanjiru Kamau', initials: 'WK', phone: '07•• ••• 123', mpesaName: 'W. Kamau', bank: 'Demo Bank ••• 482', email: 'wanjiru@example.com', role: 'Product designer · Nairobi, Kenya' },
  client: { name: 'Lumen Studio', legal: 'Lumen Studio (demo)', initials: 'LS', contact: 'Tom', email: 'tom@lumen.example.com' },
  custodian: { name: 'Mfano Custody Ltd (demo)', licence: 'VASP-DEMO-001' },
  refs: ['DEMO7K2P9Q', 'DEMO8M4R2T', 'DEMO5N2W8X', 'DEMO9C4V6B', 'DEMO4J7H2D', 'DEMO6P3S8F', 'DEMO2X9L5G', 'DEMO3V1Q7K', 'DEMO8B6T4N', 'DEMO1F5R9W', 'DEMO7Y2C3M', 'DEMO5H8D1Z'],

  seed(firstRun) {
    if (firstRun) {
      return { firstRun: true, welcome: true, usd: 0, rate: this.rate, sentToday: 0, activity: [], invoices: [], payments: [], autoSplit: { on: false, pct: 40 } };
    }
    // Paid invoices in 2026, by month (Jan–Nov). The rate is the one each payment was valued at.
    const months = [
      ['2026-01-16', 'UJ-DEMO-0031', 3000, 129.10], ['2026-02-17', 'UJ-DEMO-0032', 3000, 129.20],
      ['2026-03-16', 'UJ-DEMO-0033', 3000, 129.35], ['2026-04-15', 'UJ-DEMO-0034', 3500, 129.40],
      ['2026-05-18', 'UJ-DEMO-0035', 3000, 129.30], ['2026-06-16', 'UJ-DEMO-0036', 3000, 129.45],
      ['2026-07-17', 'UJ-DEMO-0037', 3000, 129.50], ['2026-08-18', 'UJ-DEMO-0038', 2500, 129.64],
      ['2026-09-16', 'UJ-DEMO-0039', 3000, 129.60], ['2026-10-16', 'UJ-DEMO-0040', 3000, 129.75],
      ['2026-11-18', 'UJ-DEMO-0041', 3000, 129.90],
    ];
    return {
      firstRun: false, welcome: false,
      usd: 4240.50, rate: this.rate, sentToday: 0,
      autoSplit: { on: false, pct: 40 },
      payments: months.map(([date, no, usd, rate]) => ({ date, no, usd, rate, client: 'Lumen Studio' })),
      activity: [
        { id: 'a1', kind: 'in', title: 'Lumen Studio', no: 'UJ-DEMO-0041', usd: 3000, date: '2026-11-18', time: '14:02', rate: 129.90 },
        { id: 'a2', kind: 'out', dest: 'mpesa', title: 'To M-Pesa', usd: 1500, date: '2026-11-02', time: '10:24', rate: 129.25, gross: 193875, fee: 969, net: 192906,
          legs: [{ amount: 192906, status: 'arrived', ref: 'DEMO3H8T1L', time: '10:24:07' }] },
        { id: 'a3', kind: 'in', title: 'Lumen Studio', no: 'UJ-DEMO-0040', usd: 3000, date: '2026-10-16', time: '09:48', rate: 129.75 },
        { id: 'a4', kind: 'out', dest: 'bank', title: 'To bank', usd: 800, date: '2026-10-15', time: '16:40', rate: 129.50, gross: 103600, fee: 518, net: 103082,
          legs: [{ amount: 103082, status: 'arrived', ref: 'DEMO2B5K7N', time: '16:41:12' }] },
      ],
      invoices: [
        { no: 'UJ-DEMO-0042', what: 'Design retainer, November', period: 'Product design, 1–30 Nov 2026', usd: 3000, issued: '2026-11-01', due: '2026-11-30', status: 'open',
          events: [{ label: 'Created', date: '2026-11-01', time: '09:12' }, { label: 'Sent to tom@lumen.example.com', date: '2026-11-01', time: '09:13' }, { label: 'Opened by the client', date: '2026-11-18', time: '11:40' }] },
        { no: 'UJ-DEMO-0041', what: 'Design retainer, October', period: 'Product design, 1–31 Oct 2026', usd: 3000, issued: '2026-10-20', due: '2026-11-19', status: 'paid', paidDate: '2026-11-18', paidTime: '14:02',
          events: [{ label: 'Created', date: '2026-10-20', time: '09:00' }, { label: 'Sent to tom@lumen.example.com', date: '2026-10-20', time: '09:01' }, { label: 'Opened by the client', date: '2026-10-21', time: '10:15' }, { label: 'Paid', date: '2026-11-18', time: '14:02' }] },
      ],
    };
  },
};

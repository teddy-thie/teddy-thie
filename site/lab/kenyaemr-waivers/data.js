/* KenyaEMR waivers v3: invented data for a personal concept.
   Every facility, person, patient, rule and amount here is made up.
   The AI's suggestions are scripted: nothing on this page calls a model. */

window.WAIVER_DATA = {
  startClock: '09:31',

  facility: {
    name: 'Mfano Sub-County Hospital',
    secondApprovalOver: 5000,
    rulesVersion: 'v3'
  },

  people: {
    approver: { name: 'Sister Wanjiru', role: 'Waiver approver', title: 'nurse in‑charge', initials: 'SW' },
    second: { name: 'Dr Kiprono', role: 'Second approver', title: 'medical superintendent', initials: 'DK' },
    auditor: { name: 'Facility finance officer', role: 'Auditor', title: 'monthly review', initials: 'FO' }
  },

  /* Reasons a person gives when they go against the AI, or decide without a lean. */
  reasons: {
    decline: ['Old evidence', 'Wrong rule', 'Missing information', 'Other'],
    approve: ['Hardship (social worker assessed)', 'Rule missing from the setup', 'Missing information', 'Other']
  },

  requests: [
    {
      id: 'wanjiku', name: 'Wanjiku Muthoni', sex: 'Female', age: '61 yrs', mrn: 'MFN-09316',
      visit: 'Inpatient', reason: 'Admitted 12 Nov, 5 days', asked: '08:47', note: 'Family can’t pay the balance.',
      payer: 'Wanjiku’s family', askAgain: 'If the family’s situation changes, a new request links to this one.',
      billSub: 'Inpatient stay · admitted 12 Nov 2026',
      lines: [['Ward stay (5 days)', 10000], ['Medicines', 5200], ['Lab tests', 1900], ['Imaging', 1300]],
      insurance: 12000,
      ai: {
        answer: 'not', sub: 'No rule matches', section: 'Why',
        reasons: [
          { text: 'No category in Mfano rules v3 matches: she’s 61, with no custody escort recorded.', src: 'Mfano rules v3 · updated 2 Nov 2026',
            panel: { title: 'Mfano rules v3', meta: 'Updated 2 Nov 2026 · set by the facility', lines: ['W1 Prisoners and remandees: only when today’s visit records a custody escort.', 'W2 Children under 5: consultation and lab tests.', 'W3 Hardship: needs a social worker assessment. The approver decides.'] } },
          { text: 'National insurance is active and covers KSh 12,000 of the bill.', src: 'National insurance check · today, 08:51',
            panel: { title: 'National insurance check', meta: 'Today, 08:51', lines: ['Active inpatient cover.', 'Pays KSh 12,000 of KSh 18,400. Balance KSh 6,400.'] } },
          { text: 'A social worker assessment is attached. Hardship is the approver’s call, not the AI’s.', src: 'Social worker assessment · today, 08:40',
            panel: { title: 'Social worker assessment', meta: 'Today, 08:40 · social work desk', quote: 'Lives alone. Her pension payments stopped in September. She can’t pay the KSh 6,400 balance. Recommend waiving it.' } }
        ]
      }
    },
    {
      id: 'otieno', name: 'Otieno Okoth', sex: 'Male', age: '34 yrs', mrn: 'MFN-11907',
      visit: 'Outpatient', reason: 'Review, hand injury', asked: '09:05', note: 'Patient says he can’t pay today.',
      payer: 'Otieno', askAgain: 'If today’s visit records a custody escort, a new request links to this one.',
      billSub: 'Outpatient visit · 17 Nov 2026',
      lines: [['Consultation', 300], ['Wound dressing', 400], ['X-ray, hand', 500]],
      insurance: 0,
      ai: {
        answer: 'eligible', sub: 'Prisoners and remandees · rule W1', section: 'Why', flag: '1 source is from an earlier visit',
        reasons: [
          { text: 'Rule W1 waives all services for prisoners and remandees.', src: 'Rule W1 · Mfano rules v3, 2 Nov 2026',
            panel: { title: 'Rule W1', meta: 'Mfano rules v3 · 2 Nov 2026', lines: ['Prisoners and remandees: all services are waived.', 'Applies when today’s visit records a custody escort.'] } },
          { text: 'A registration note says a prison officer escorted him.', src: 'Registration note · 14 Mar 2026', earlier: true,
            panel: { title: 'Registration note', earlier: '8 months before today’s visit', label: 'Registration note', quote: '“Escorted by prison officer. Remand.”', meta: 'Outpatient visit · 14 Mar 2026, 10:42 · Registration desk',
              warn: ['From an earlier visit', 'Rule W1 only applies when today’s visit records a custody escort.'],
              today: ['Today’s registration', '17 Nov 2026, 08:55. Arrived alone and paid the KSh 100 registration fee in cash. No escort recorded.'],
              shortcut: 'Old evidence' } },
          { text: 'No active national insurance cover.', src: 'National insurance check · today, 09:02',
            panel: { title: 'National insurance check', meta: 'Today, 09:02', lines: ['No active cover found for MFN-11907.'] } }
        ]
      }
    },
    {
      id: 'juma', name: 'Juma Ouma', sex: 'Male', age: '3 yrs', mrn: 'MFN-20431',
      visit: 'Outpatient', reason: 'Fever, 2 days', asked: '09:12', note: 'Mother asked about the fee.',
      payer: 'Juma’s mother', askAgain: 'If something changes, a new request links to this one.',
      billSub: 'Outpatient visit · 17 Nov 2026',
      lines: [['Consultation', 300], ['Malaria test (RDT)', 350]],
      insurance: 0,
      ai: {
        answer: 'eligible', sub: 'Children under 5 · rule W2', section: 'Why',
        reasons: [
          { text: 'Rule W2 waives consultation and lab tests for children under 5.', src: 'Rule W2 · Mfano rules v3, 2 Nov 2026',
            panel: { title: 'Rule W2', meta: 'Mfano rules v3 · 2 Nov 2026', lines: ['Children under 5: consultation and lab tests are waived.', 'Applies from the date of birth. No tag needed at registration.'] } },
          { text: 'Juma is 3. His date of birth comes from his birth notification, not an estimate.', src: 'Patient record · date of birth, recorded 4 Jun 2023',
            panel: { title: 'Patient record', meta: 'Recorded 4 Jun 2023', lines: ['Date of birth: 4 Jun 2023.', 'Source: birth notification. Estimated: no.'] } },
          { text: 'No active national insurance cover to bill first.', src: 'National insurance check · today, 09:14',
            panel: { title: 'National insurance check', meta: 'Today, 09:14', lines: ['No active cover found for MFN-20431.'] } }
        ],
        notice: ['info', 'Found from the record', 'No category was tagged at registration. Rule W2 matched from his date of birth.']
      }
    },
    {
      id: 'mary', name: 'Mary Akinyi', sex: 'Female', age: '46 yrs', mrn: 'MFN-18872',
      visit: 'Inpatient', reason: 'Admitted 14 Nov, 3 days', asked: '09:18', note: 'Asked for a hardship waiver.',
      payer: 'Mary’s family', askAgain: 'Once the social worker assessment is in, a new request links to this one.',
      billSub: 'Inpatient stay · admitted 14 Nov 2026',
      lines: [['Ward stay (3 days)', 6000], ['Medicines', 4700], ['Lab tests', 2100], ['Imaging', 1400]],
      insurance: null,
      ai: {
        answer: 'unsure', sub: 'Not enough to suggest', section: 'What’s missing',
        missing: [
          { id: 'ins', text: 'The national insurance check didn’t respond.', detail: 'Timed out at 09:20.', action: 'Retry check' },
          { id: 'sw', text: 'There’s no social worker assessment yet.', detail: 'Hardship waivers need one (rule W3).', action: 'Request assessment' }
        ],
        notice: ['info', 'The AI won’t lean', 'Hardship is the approver’s call. Hold this until the assessment is in.']
      }
    }
  ],

  /* Earlier decisions this month. */
  history: [
    { when: '14 Nov, 08:50', mrn: '41', amount: 3200, ai: 'eligible', rule: 'W1', decision: 'approved', by: 'Mr Barasa', reason: '', note: '', rules: 'v3' },
    { when: '13 Nov, 16:30', mrn: '58', amount: 600, ai: 'not', decision: 'declined', by: 'Sister Wanjiru', reason: '', note: '', rules: 'v3' },
    { when: '11 Nov, 09:15', mrn: '26', amount: 1050, ai: 'eligible', rule: 'W2', decision: 'declined', by: 'Sister Wanjiru', reason: 'Wrong rule', note: 'W2 covers consultation and labs, not medicines', rules: 'v3' },
    { when: '8 Nov, 11:40', mrn: '73', amount: 9800, ai: 'unsure', decision: 'approved', by: 'Sister Wanjiru', second: 'Dr Kiprono', reason: 'Hardship (social worker assessed)', note: '', rules: 'v3' },
    { when: '5 Nov, 14:20', mrn: '09', amount: 2300, ai: 'eligible', rule: 'W1', decision: 'approved', by: 'Mr Barasa', reason: '', note: '', rules: 'v3' },
    { when: '1 Nov, 10:05', mrn: '64', amount: 450, ai: 'eligible', rule: 'W2', decision: 'approved', by: 'Sister Wanjiru', reason: '', note: '', rules: 'v2' }
  ]
};

// ═══════════════════════════════════════════════════════
// FISHNESS — i18n String Definitions
// Add every user-facing string here. Never hardcode text
// in screens directly.
// ═══════════════════════════════════════════════════════

export type Language = 'en' | 'gu'

export type Strings = typeof en

const en = {
  // ── Language Screen ─────────────────────────────────
  language: {
    title: 'Choose Your Language',
    subtitle: 'You can change this later in settings',
    english: 'English',
    englishNative: 'English',
    gujarati: 'Gujarati',
    gujaratiNative: 'ગુજરાતી',
    continueBtn: 'Continue',
  },

  // ── Phone Screen ─────────────────────────────────────
  phone: {
    appTagline: 'Fish Management Platform',
    cardTitle: 'Enter Your Number',
    cardSubtitle: 'Login via OTP — no password needed',
    placeholder: '10-digit number',
    securityNote: 'Your personal information is completely secure',
    nextBtn: 'Continue',
    nextBtnArrow: '→',
  },

  // ── OTP Screen ───────────────────────────────────────
  otp: {
    cardTitle: 'Verify OTP',
    cardSubtitle: (phone: string) => `A ${6}-digit OTP was sent to +91 ${phone}`,
    noOtp: "Didn't receive OTP? ",
    resendIn: (sec: number) => `Resend in ${sec}s`,
    resendBtn: 'Resend',
    verifyBtn: 'Verify ✓',
    verifying: 'Verifying...',
  },

  // ── Role Screen ──────────────────────────────────────
  role: {
    headerLabel: '— I AM A —',
    headerTitle: 'Select\nYour Role',
    headerSubtitle: 'Fishness customises your\nexperience based on your role',
    continuePrefix: 'Continue as',
    continuePlaceholder: 'Select a role',

    boatOwner: 'Boat Owner',
    boatOwnerSub: 'Trips · Financials · Crew',
    boatManager: 'Boat Manager',
    boatManagerSub: 'Tali · Expenses · Reports',
    supplier: 'Supplier (Dango)',
    supplierSub: 'Review & Confirm tali weights',
    mehtaji: 'Mehtaji / Manager',
    mehtajiSub: 'Tali · Bills · Kharchi',
  },

  // ── Owner Home ───────────────────────────────────────
  home: {
    greeting: (name: string) => `Hello, ${name}`,
    seasonLabel: (season: string, location: string) =>
      `Season ${season} · ${location}`,

    totalProfitLabel: 'Total profit this year',
    totalCatchLabel: 'Total catch this year',
    totalBoatsLabel: 'Total Boats',
    seasonAdvanceLabel: 'Season Advance',
    maintenanceLabel: 'Maintenance',
    dieselLabel: 'Diesel',

    quickActions: 'Quick Actions',
    manage: 'Manage',

    addTali: 'Add Tali',
    addTaliSub: 'Weight logging',
    addExpense: 'Add Expense',
    addExpenseSub: 'Add a expense',
    addKharchi: 'Add Kharchi',
    addKharchiSub: 'Crew expenses',
    more: 'More',
    moreSub: 'Other actions',

    trips: 'Trips',
    tripsSub: 'See All Trips',
    boats: 'Boats',
    boatsSub: 'See All Boats',
    crew: 'Crew',
    crewSub: 'See All Crew',
    ledger: 'Ledger',
    ledgerSub: 'See All Records',

    navHome: 'Home',
    navTali: 'Tali',
    navTrips: 'Trips',
    navLedger: 'Ledger',
    navMore: 'More',
  },

  // ── Common ───────────────────────────────────────────
  common: {
    back: '←',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
  },

  // ── Tali Screen ──────────────────────────────────────
  tali: {
    headerTitle: 'Tali',
    headerSubtitle: 'Weight Session',
    endSession: 'End',
    emptyTitle: 'No fish added yet',
    emptyText: 'Tap + button to add fish...',
    addFish: 'Add Fish',
    addFishTitle: 'Select Fish',
    addBtn: 'Add',
    totalLabel: 'Total Weight',
    paused: '⏸ Paused',
    pausedAt: (count: number) => `Last count: ${count}`,
    resume: '▶ Resume',
    resumeHint: 'Tap to resume',
    tapHint: 'Tap',
    partialTitle: 'Enter Last Weight',
    partialPlaceholder: 'e.g. 18',
    deleteFishTitle: 'Remove Fish?',
    deleteFishMsg: 'All counts for this fish will be deleted.',
    deleteConfirm: 'Remove',
    invalidWeight: 'Enter a valid weight',
    endConfirmTitle: 'End Session?',
    endConfirmMsg: 'Are you sure you want to end this tali session?',
    endConfirmYes: 'Yes, End',
    searchPlaceholder: 'Search...',
    customFish: 'Custom Fish',
    bucketWeightLabel: 'How many kg per bucket?',
    deckLabel: (n: number) => `Deck ${n}`,
  },
}

const gu: Strings = {
  // ── Language Screen ─────────────────────────────────
  language: {
    title: 'ભાષા પસંદ કરો',
    subtitle: 'તમે આ પછી Settings માં બદલી શકો છો',
    english: 'English',
    englishNative: 'English',
    gujarati: 'ગુજરાતી',
    gujaratiNative: 'ગુજરાતી',
    continueBtn: 'આગળ વધો',
  },

  // ── Phone Screen ─────────────────────────────────────
  phone: {
    appTagline: 'માછલી વ્યવસ્થાપન પ્લેટફોર્મ',
    cardTitle: 'નંબર દાખલ કરો',
    cardSubtitle: 'OTP વડે login — કોઈ password નહીં',
    placeholder: '10 આંકડાનો નંબર',
    securityNote: 'તમારી અંગત માહિતી સંપૂર્ણ સુરક્ષિત છે',
    nextBtn: 'આગળ વધો',
    nextBtnArrow: '→',
  },

  // ── OTP Screen ───────────────────────────────────────
  otp: {
    cardTitle: 'OTP ચકાસો',
    cardSubtitle: (phone: string) => `+91 ${phone} પર ${6} આંકડાનો OTP મોકલ્યો`,
    noOtp: 'OTP નથી મળ્યો?  ',
    resendIn: (sec: number) => `${sec}s માં ફરી મોકલો`,
    resendBtn: 'ફરી મોકલો',
    verifyBtn: 'ચકાસો ✓',
    verifying: 'ચકાસી રહ્યું છે...',
  },

  // ── Role Screen ──────────────────────────────────────
  role: {
    headerLabel: '— હું છું —',
    headerTitle: 'તમારી ભૂમિકા\nપસંદ કરો',
    headerSubtitle: 'Fishness તમારા role પ્રમાણે\nexperience customize કરે છે',
    continuePrefix: 'તરીકે ચાલુ',
    continuePlaceholder: 'ભૂમિકા પસંદ કરો',

    boatOwner: 'બોટ માલિક',
    boatOwnerSub: 'Trips · Financials · Crew',
    boatManager: 'બોટ મેનેજર',
    boatManagerSub: 'Tali · Expenses · Reports',
    supplier: 'સપ્લાયર (દાંગો)',
    supplierSub: 'Review & Confirm tali weights',
    mehtaji: 'મહેતાજી / મેનેજર',
    mehtajiSub: 'Tali · Bills · Kharchi',
  },

  // ── Owner Home ───────────────────────────────────────
  home: {
    greeting: (name: string) => `નમસ્કાર, ${name}`,
    seasonLabel: (season: string, location: string) =>
      `સીઝન ${season} · ${location}`,

    totalProfitLabel: 'આ વર્ષનો કુલ નફો',
    totalCatchLabel: 'આ વર્ષનો કુલ catch',
    totalBoatsLabel: 'કુલ બોટ',
    seasonAdvanceLabel: 'સીઝન એડવાન્સ',
    maintenanceLabel: 'જાળવણી',
    dieselLabel: 'ડીઝલ',

    quickActions: 'ઝડપી ક્રિયા',
    manage: 'મેનેજ કરો',

    addTali: 'તાલી ઉમેરો',
    addTaliSub: 'વજન નોંધ',
    addExpense: 'ખર્ચ ઉમેરો',
    addExpenseSub: 'ખર્ચ ઉમેરો',
    addKharchi: 'ખારચી ઉમેરો',
    addKharchiSub: 'ક્રૂ ખર્ચ',
    more: 'વધુ',
    moreSub: 'અન્ય ક્રિયા',

    trips: 'ટ્રિપ્સ',
    tripsSub: 'બધી ટ્રિપ્સ જુઓ',
    boats: 'બોટ',
    boatsSub: 'બધી બોટ જુઓ',
    crew: 'ક્રૂ',
    crewSub: 'બધો ક્રૂ જુઓ',
    ledger: 'ખાતાવહી',
    ledgerSub: 'બધા રેકોર્ડ જુઓ',

    navHome: 'હોમ',
    navTali: 'તાલી',
    navTrips: 'ટ્રિપ્સ',
    navLedger: 'ખાતાવહી',
    navMore: 'વધુ',
  },

  // ── Common ───────────────────────────────────────────
  common: {
    back: '←',
    loading: 'લોડ થઈ રહ્યું છે...',
    error: 'કંઈક ખોટું થઈ ગયું',
    retry: 'ફરી પ્રયાસ કરો',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    delete: 'ભૂંસો',
    confirm: 'પુષ્ટિ કરો',
    yes: 'હા',
    no: 'ના',
  },

  // ── Tali Screen ──────────────────────────────────────
  tali: {
    headerTitle: 'તાલી',
    headerSubtitle: 'વજન સત્ર',
    endSession: 'પૂરું',
    emptyTitle: 'કોઈ માછલી ઉમેરી નથી',
    emptyText: '+ બટન દબાવો માછલી ઉમેરવા માટે...',
    addFish: 'માછલી ઉમેરો',
    addFishTitle: 'માછલી પસંદ કરો',
    addBtn: 'ઉમેરો',
    totalLabel: 'કુલ વજન',
    paused: '⏸ અટકેલ છે',
    pausedAt: (count: number) => `છેલ્લો કાઉન્ટ: ${count}`,
    resume: '▶ ચાલુ કરો',
    resumeHint: 'ફરી ચાલુ કરવા ટેપ કરો',
    tapHint: 'ટેપ કરો',
    partialTitle: 'છેલ્લું વજન નાખો',
    partialPlaceholder: 'જેમ કે 18',
    deleteFishTitle: 'માછલી કાઢો?',
    deleteFishMsg: 'આ માછલી ની બધી ગણતરી ભૂંસાઈ જશે.',
    deleteConfirm: 'કાઢો',
    invalidWeight: 'સાચું વજન નાખો',
    endConfirmTitle: 'સેશન પૂરું કરો?',
    endConfirmMsg: 'શું તમે ખરેખર આ તાલી સેશન પૂરું કરવા માંગો છો?',
    endConfirmYes: 'હા, પૂરું કરો',
    searchPlaceholder: 'શોધો...',
    customFish: 'કસ્ટમ માછલી',
    bucketWeightLabel: 'દરેક ટોપલી કેટલા kg ની છે?',
    deckLabel: (n: number) => `તાલી ${n}`,
  },
}

export const translations: Record<Language, Strings> = { en, gu }
/**
 * โชคดีทุกวัน (Everyday Lucky) - Frontend Application Script
 * รองรับทั้งสองโหมด:
 * 1. โหมด Offline Demo (ทำงานได้ทันที 100% โดยไม่ต้องพึ่งพาเซิร์ฟเวอร์)
 * 2. โหมด Live Google Sheets API (เมื่อผู้ใช้ใส่ Web App URL ของ Apps Script)
 */

// ฐานข้อมูลดวงและสีมงคลประจำวัน 2569 (สำหรับวันที่สวมใส่ในแต่ละวัน: อาทิตย์ - เสาร์)
const DAILY_TRANSITING_RULES = {
  'อาทิตย์': {
    dayName: 'วันอาทิตย์',
    planet: 'พระอาทิตย์',
    work: { name: 'ส้ม, เทา, ม่วงเปลือกมังคุด', hex: ['#FF9800', '#9E9E9E', '#4A154B'] },
    money: { name: 'เขียวสด, ม่วง, ดำ', hex: ['#2E7D32', '#7B1FA2', '#212121'] },
    love: { name: 'ชมพู, ขาว, ครีม', hex: ['#F48FB1', '#FFFFFF', '#FFFDD0'] },
    kalakini: { name: 'น้ำเงิน, ฟ้า, คราม', hex: ['#1565C0', '#42A5F5', '#1A237E'] }
  },
  'จันทร์': {
    dayName: 'วันจันทร์',
    planet: 'พระจันทร์',
    work: { name: 'เขียวสด, เขียวใบไม้, เทาเข้ม', hex: ['#388E3C', '#2E7D32', '#616161'] },
    money: { name: 'ม่วง, ส้มอิฐ, ดำ', hex: ['#7B1FA2', '#D84315', '#212121'] },
    love: { name: 'ฟ้า, น้ำเงิน, ครีม', hex: ['#42A5F5', '#1976D2', '#FFFDD0'] },
    kalakini: { name: 'แดงสด, แดงเพลิง', hex: ['#D50000', '#FF1744'] }
  },
  'อังคาร': {
    dayName: 'วันอังคาร',
    planet: 'พระอังคาร',
    work: { name: 'ม่วง, ดำ, น้ำเงินเข้ม', hex: ['#7B1FA2', '#212121', '#0D47A1'] },
    money: { name: 'ส้ม, ทอง, น้ำตาล', hex: ['#FF9800', '#FFD700', '#6D4C41'] },
    love: { name: 'แดง, ชมพู', hex: ['#D32F2F', '#F06292'] },
    kalakini: { name: 'เหลือง, ขาว, ครีม', hex: ['#FBC02D', '#FFFFFF', '#FFFDD0'] }
  },
  'พุธ': {
    dayName: 'วันพุธ',
    planet: 'พระพุธ',
    work: { name: 'ส้ม, ทอง, แสด', hex: ['#FF9800', '#FFD700', '#FF6D00'] },
    money: { name: 'ดำ, เทาควันบุหรี่, ม่วง', hex: ['#212121', '#757575', '#8E24AA'] },
    love: { name: 'ขาว, ครีม, เหลือง', hex: ['#FFFFFF', '#FFFDD0', '#FDD835'] },
    kalakini: { name: 'ชมพู, โอรส, บานเย็น', hex: ['#F48FB1', '#FFAB91', '#C2185B'] }
  },
  'พฤหัสบดี': {
    dayName: 'วันพฤหัสบดี',
    planet: 'พระพฤหัสบดี',
    work: { name: 'ฟ้า, น้ำเงิน, คราม', hex: ['#42A5F5', '#1565C0', '#1A237E'] },
    money: { name: 'แดง, ส้มอิฐ, ทอง', hex: ['#C62828', '#D84315', '#FFD700'] },
    love: { name: 'เขียว, ขาว, มุก', hex: ['#2E7D32', '#FFFFFF', '#ECEFF1'] },
    kalakini: { name: 'ม่วง, ดำ, น้ำตาลเข้ม', hex: ['#6A1B9A', '#212121', '#3E2723'] }
  },
  'ศุกร์': {
    dayName: 'วันศุกร์',
    planet: 'พระศุกร์',
    work: { name: 'ขาว, ครีม, เหลืองอ่อน', hex: ['#FFFFFF', '#FFFDD0', '#FFF59D'] },
    money: { name: 'ชมพู, แดงกุหลาบ, เขียวมิ้นต์', hex: ['#F48FB1', '#E91E63', '#80CBC4'] },
    love: { name: 'ส้ม, ฟ้า, ทอง', hex: ['#FF9800', '#42A5F5', '#FFD700'] },
    kalakini: { name: 'เทาเข้ม, ดำหม่น, น้ำตาล', hex: ['#424242', '#212121', '#5D4037'] }
  },
  'เสาร์': {
    dayName: 'วันเสาร์',
    planet: 'พระเสาร์',
    work: { name: 'เทา, เทาเข้ม, ดำ', hex: ['#757575', '#424242', '#212121'] },
    money: { name: 'ฟ้า, น้ำเงิน, แดงสด', hex: ['#42A5F5', '#1565C0', '#D32F2F'] },
    love: { name: 'ชมพู, ม่วงพาสเทล', hex: ['#F06292', '#BA68C8'] },
    kalakini: { name: 'เขียวทุกเฉด', hex: ['#2E7D32', '#4CAF50', '#81C784'] }
  }
};

// สีกาลกิณีประจำวันเกิดของบุคคล (Natal Kalakini Protection)
const NATAL_KALAKINI_RULES = {
  'อาทิตย์': { names: ['น้ำเงิน', 'ฟ้า', 'คราม'], label: 'น้ำเงิน, ฟ้า, คราม' },
  'จันทร์': { names: ['แดง', 'แดงสด', 'แดงเพลิง', 'เลือดหมู'], label: 'แดงสด, แดงเพลิง' },
  'อังคาร': { names: ['เหลือง', 'ขาว', 'ครีม', 'เทาอ่อน'], label: 'เหลือง, ขาว, ครีม' },
  'พุธ (กลางวัน)': { names: ['ชมพู', 'โอรส', 'บานเย็น'], label: 'ชมพู, โอรส, บานเย็น' },
  'พุธ (กลางคืน)': { names: ['ส้ม', 'ทอง', 'เหลืองเข้ม', 'แสด'], label: 'ส้ม, ทอง, เหลืองเข้ม' },
  'พฤหัสบดี': { names: ['ม่วง', 'ดำ', 'น้ำตาลเข้ม'], label: 'ม่วง, ดำ, น้ำตาลเข้ม' },
  'ศุกร์': { names: ['เทาเข้ม', 'ดำหม่น', 'น้ำตาล'], label: 'เทาเข้ม, ดำหม่น, น้ำตาล' },
  'เสาร์': { names: ['เขียว', 'เขียวสด', 'เขียวมิ้นต์', 'เขียวใบไม้', 'เขียวทุกเฉด'], label: 'เขียวทุกเฉด' }
};

// ฟังก์ชันคัดกรองดวงชะตาสองชั้น: วันที่สวมใส่ (Transiting) x วันเกิดบุคคล (Natal)
function evaluateTransitingColors(targetDay, userBirthDay, goal) {
  const cleanTarget = (targetDay === 'พุธ (กลางวัน)' || targetDay === 'พุธ (กลางคืน)') ? 'พุธ' : (targetDay || 'จันทร์');
  const dayRules = DAILY_TRANSITING_RULES[cleanTarget] || DAILY_TRANSITING_RULES['จันทร์'];
  const natal = NATAL_KALAKINI_RULES[userBirthDay] || NATAL_KALAKINI_RULES['จันทร์'];

  const checkCategory = (catObj) => {
    const rawNames = catObj.name.split(',').map(s => s.trim());
    const safeNames = [];
    const safeHex = [];
    const conflicts = [];

    rawNames.forEach((name, idx) => {
      const isConflict = natal.names.some(k => name.includes(k) || k.includes(name));
      if (isConflict) {
        conflicts.push(name);
      } else {
        safeNames.push(name);
        if (catObj.hex[idx]) safeHex.push(catObj.hex[idx]);
      }
    });

    return {
      rawName: catObj.name,
      safeName: safeNames.length > 0 ? safeNames.join(', ') : 'ขาวมุก, ครีมธรรมชาติ (สีเป็นกลาง)',
      safeHex: safeHex.length > 0 ? safeHex : ['#FFFDD0', '#F5F5DC'],
      conflicts: conflicts,
      hasConflict: conflicts.length > 0
    };
  };

  const work = checkCategory(dayRules.work);
  const money = checkCategory(dayRules.money);
  const love = checkCategory(dayRules.love);

  let activeCat = work;
  if (goal === 'money') activeCat = money;
  else if (goal === 'love') activeCat = love;

  const totalConflicts = [...work.conflicts, ...money.conflicts, ...love.conflicts];

  return {
    targetDay: cleanTarget,
    dayRules,
    work,
    money,
    love,
    activeCat,
    hasAnyConflict: totalConflicts.length > 0,
    allConflicts: Array.from(new Set(totalConflicts)),
    natalKalakini: natal.label
  };
}

const LOCAL_DEITY_TRIVIA = {
  'อาทิตย์': { name: 'พระอาทิตย์', trait: 'บารมี ความเป็นผู้นำ และเกียรติยศ', story: 'สร้างจากราชสีห์ 6 ตัว ห่อด้วยผ้าสีแดง พรมน้ำอมฤต ผิวกายสีแดง เด็ดขาด ทรงพลัง' },
  'จันทร์': { name: 'พระจันทร์', trait: 'เสน่ห์ เมตตามหานิยม และการปรับตัว', story: 'สร้างจากเทพธิดา 15 นาง ห่อด้วยผ้าสีขาวนวล ผิวกายขาวนวล อ่อนโยน มีเสน่ห์จับใจ' },
  'อังคาร': { name: 'พระอังคาร', trait: 'ความกล้าหาญ ความเด็ดเดี่ยว และพลังลุย', story: 'สร้างจากกระบือ 8 ตัว ห่อด้วยผ้าสีชมพูหม่น เทพแห่งนักรบ ไม่ย่อท้อต่ออุปสรรค' },
  'พุธ (กลางวัน)': { name: 'พระพุธ', trait: 'การเจรจาค้าขาย สติปัญญา และวาทศิลป์', story: 'สร้างจากช้าง 17 เชือก ห่อด้วยผ้าสีเขียวใบไม้ เชาวน์ปัญญาเป็นเลิศ เจรจาคล่องแคล่ว' },
  'พุธ (กลางคืน)': { name: 'พระราหู', trait: 'โชคลาภที่ไม่คาดคิด ความเฉลียวฉลาดทันคน', story: 'สร้างจากหัวกะโหลก 12 หัว ห่อผ้าสีนิล พลังลึกลับ พลิกวิกฤตเป็นโอกาส' },
  'พฤหัสบดี': { name: 'พระพฤหัสบดี', trait: 'ผู้ใหญ่อุปถัมภ์ ปัญญาขั้นสูง ความสำเร็จ', story: 'สร้างจากพระฤๅษี 19 ตน ห่อด้วยผ้าสีส้มแดง ครูแห่งทวยเทพ คุณธรรมล้ำเลิศ' },
  'ศุกร์': { name: 'พระศุกร์', trait: 'ความรัก ความสุขสำราญ และการเงินมั่งคั่ง', story: 'สร้างจากโค 21 ตัว ห่อด้วยผ้าสีฟ้าอ่อน เทพแห่งศิลปะ ความงดงาม และสุนทรียภาพ' },
  'เสาร์': { name: 'พระเสาร์', trait: 'ความอดทน ทรัพย์สินมรดก ความมั่นคงหนักแน่น', story: 'สร้างจากเสือ 10 ตัว ห่อด้วยผ้าสีดำ ทรงพลัง หนักแน่นดั่งขุนเขา' }
};

const LOCAL_WALLETS = {
  'อาทิตย์': { walletLucky: 'ดำ, ม่วง, น้ำตาลเข้ม', walletAvoid: 'น้ำเงิน, ฟ้า', gem: 'ทับทิม (Ruby)', gemProp: 'เสริมบารมี พลังอำนาจ และภาวะผู้นำ' },
  'จันทร์': { walletLucky: 'เหลืองเข้ม, ทอง', walletAvoid: 'ส้ม, แดง', gem: 'ไข่มุก (Pearl), มุกดาหาร', gemProp: 'เสริมเสน่ห์ เมตตา และโชคลาภ' },
  'อังคาร': { walletLucky: 'เทาเข้ม', walletAvoid: 'เหลืองอ่อน, ขาว', gem: 'แอเมทิสต์ (Amethyst)', gemProp: 'คุ้มครอง ป้องกันอุปสรรค' },
  'พุธ (กลางวัน)': { walletLucky: 'น้ำเงิน, คราม, ฟ้า', walletAvoid: 'ชมพู', gem: 'มรกต (Emerald)', gemProp: 'สติปัญญา ค้าขายคล่อง' },
  'พุธ (กลางคืน)': { walletLucky: 'ชมพู', walletAvoid: 'เหลืองเข้ม, ทอง', gem: 'โกเมนเขียว, ออบซิเดียน', gemProp: 'พลิกวิกฤตเป็นโอกาส' },
  'พฤหัสบดี': { walletLucky: 'เหลืองอ่อน, ขาว, เทา', walletAvoid: 'ดำ, ม่วง', gem: 'บุษราคัม (Yellow Sapphire)', gemProp: 'ผู้ใหญ่อุปถัมภ์ ปัญญา' },
  'ศุกร์': { walletLucky: 'เขียว', walletAvoid: 'ม่วง, ดำ', gem: 'ไพลิน (Blue Sapphire)', gemProp: 'ความรัก สุขสำราญ เงินทอง' },
  'เสาร์': { walletLucky: 'แดง', walletAvoid: 'เขียว', gem: 'นิลดำ (Onyx)', gemProp: 'ความอดทน มั่งคั่ง บารมีหนักแน่น' }
};

function getTodayThaiDayName() {
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  return days[new Date().getDay()];
}

// Google Apps Script Web App URL ถาวร (เชื่อมต่อชีต DATA โชคดีทุกวัน)
const API_URL = 'https://script.google.com/macros/s/AKfycbzq5M_wOok95sOW0LKqtUAmMFC719IqHBzF8jH5O85rrilutOheaZJBxtoEr9SYK1k20w/exec';

// State การทำงานของแอปพลิเคชัน
const AppState = {
  currentUser: {
    isLoggedIn: false,
    displayName: '',
    email: '',
    gender: 'female', // 'female', 'male', 'unisex'
    birthDay: 'จันทร์',
    zodiac: 'ราศีพฤษภ',
    personalColor: 'Spring',
    plan: 'free',
    token: null
  },
  currentGoal: 'work', // 'work', 'money', 'love', 'casual'
  bottomStyle: 'pants', // 'pants', 'skirt'
  todayDay: getTodayThaiDayName(), // วันนี้ตามปฏิทินจริง (Real-world today)
  selectedDay: getTodayThaiDayName(), // วันที่ผู้ใช้เลือกดู (Default = วันนี้)
  apiUrl: API_URL,
  activeTab: 'tabHome'
};

// DOM Elements
const DOM = {
  // Views
  viewAuth: document.getElementById('viewAuth'),
  viewMain: document.getElementById('viewMain'),

  // Auth Landing View
  btnTabLogin: document.getElementById('btnTabLogin'),
  btnTabRegister: document.getElementById('btnTabRegister'),
  formMainLogin: document.getElementById('formMainLogin'),
  formMainRegister: document.getElementById('formMainRegister'),
  authLoginEmail: document.getElementById('authLoginEmail'),
  authLoginPassword: document.getElementById('authLoginPassword'),
  authRegName: document.getElementById('authRegName'),
  authRegEmail: document.getElementById('authRegEmail'),
  authRegPassword: document.getElementById('authRegPassword'),
  authRegBirthDay: document.getElementById('authRegBirthDay'),
  authRegPersonalColor: document.getElementById('authRegPersonalColor'),
  authRegGender: document.getElementById('authRegGender'),
  authRegPdpaConsent: document.getElementById('authRegPdpaConsent'),

  // Main View Header
  currentDateDisplay: document.getElementById('currentDateDisplay'),
  displayUserName: document.getElementById('displayUserName'),
  badgeBirthDay: document.getElementById('badgeBirthDay'),
  badgeSeason: document.getElementById('badgeSeason'),
  badgeGender: document.getElementById('badgeGender'),
  badgePlan: document.getElementById('badgePlan'),
  btnSwitchToProfile: document.getElementById('btnSwitchToProfile'),
  
  // Weekly Day Selector & Protection Banner
  dayPillBtns: document.querySelectorAll('.day-pill-btn'),
  btnQuickToday: document.getElementById('btnQuickToday'),
  btnOpenWeeklyModal: document.getElementById('btnOpenWeeklyModal'),
  modalWeeklyOverview: document.getElementById('modalWeeklyOverview'),
  btnCloseWeeklyModal: document.getElementById('btnCloseWeeklyModal'),
  btnDoneWeeklyModal: document.getElementById('btnDoneWeeklyModal'),
  weeklyTableContainer: document.getElementById('weeklyTableContainer'),
  txtWeeklyModalSubtitle: document.getElementById('txtWeeklyModalSubtitle'),
  badgeTargetDay: document.getElementById('badgeTargetDay'),
  txtHeroDayTitle: document.getElementById('txtHeroDayTitle'),
  txtHeroDayDesc: document.getElementById('txtHeroDayDesc'),
  boxPersonalizedNotice: document.getElementById('boxPersonalizedNotice'),
  iconProtectionNotice: document.getElementById('iconProtectionNotice'),
  titleProtectionNotice: document.getElementById('titleProtectionNotice'),
  tagProtectionStatus: document.getElementById('tagProtectionStatus'),
  txtPersonalizedDetail: document.getElementById('txtPersonalizedDetail'),

  // Tab Home Elements
  txtWorkColors: document.getElementById('txtWorkColors'),
  txtMoneyColors: document.getElementById('txtMoneyColors'),
  txtLoveColors: document.getElementById('txtLoveColors'),
  txtKalakiniColors: document.getElementById('txtKalakiniColors'),
  swatchWork: document.getElementById('swatchWork'),
  swatchMoney: document.getElementById('swatchMoney'),
  swatchLove: document.getElementById('swatchLove'),
  
  // Flat-lay Clothing SVG Elements
  bottomStyleToggle: document.getElementById('bottomStyleToggle'),
  btnStylePants: document.getElementById('btnStylePants'),
  btnStyleSkirt: document.getElementById('btnStyleSkirt'),
  itemPants: document.getElementById('itemPants'),
  itemSkirt: document.getElementById('itemSkirt'),
  pathShirt: document.getElementById('pathShirt'),
  pathPants: document.getElementById('pathPants'),
  pathSkirt: document.getElementById('pathSkirt'),
  flatlayCaptionText: document.getElementById('flatlayCaptionText'),
  flatlayAcc: document.getElementById('flatlayAcc'),

  txtAdviceTitle: document.getElementById('txtAdviceTitle'),
  txtAdviceDescription: document.getElementById('txtAdviceDescription'),
  adviceColorBar: document.getElementById('adviceColorBar'),
  txtDeityName: document.getElementById('txtDeityName'),
  txtDeityTrait: document.getElementById('txtDeityTrait'),
  txtDeityStory: document.getElementById('txtDeityStory'),
  
  // Radar Chart Elements
  radarChartCanvas: document.getElementById('radarChartCanvas'),
  radarTotalScore: document.getElementById('radarTotalScore'),
  radarScoreLevel: document.getElementById('radarScoreLevel'),
  valScoreWork: document.getElementById('valScoreWork'),
  valScoreMoney: document.getElementById('valScoreMoney'),
  valScoreLove: document.getElementById('valScoreLove'),
  valScoreHealth: document.getElementById('valScoreHealth'),
  valScoreWisdom: document.getElementById('valScoreWisdom'),
  radarInsightText: document.getElementById('radarInsightText'),
  itemScoreWork: document.getElementById('itemScoreWork'),
  itemScoreMoney: document.getElementById('itemScoreMoney'),
  itemScoreLove: document.getElementById('itemScoreLove'),
  itemScoreHealth: document.getElementById('itemScoreHealth'),
  itemScoreWisdom: document.getElementById('itemScoreWisdom'),

  
  // Tab Wardrobe
  seasonCards: document.querySelectorAll('.season-card'),
  
  // Tab Remedies & Eco
  txtWalletLucky: document.getElementById('txtWalletLucky'),
  txtWalletAvoid: document.getElementById('txtWalletAvoid'),
  txtGemstone: document.getElementById('txtGemstone'),
  txtGemstoneProp: document.getElementById('txtGemstoneProp'),
  btnGoToRemedy: document.getElementById('btnGoToRemedy'),

  // Tab Profile
  profileAvatar: document.getElementById('profileAvatar'),
  profDisplayName: document.getElementById('profDisplayName'),
  profEmail: document.getElementById('profEmail'),
  profPlanTag: document.getElementById('profPlanTag'),
  selectBirthDay: document.getElementById('selectBirthDay'),
  selectZodiac: document.getElementById('selectZodiac'),
  selectPersonalColor: document.getElementById('selectPersonalColor'),
  selectGender: document.getElementById('selectGender'),
  btnSaveProfile: document.getElementById('btnSaveProfile'),

  btnLogout: document.getElementById('btnLogout'),

  // Tab Tarot & Teaser
  btnHomeOpenTarot: document.getElementById('btnHomeOpenTarot'),
  tarotCardScene: document.getElementById('tarotCardScene'),
  tarotCardObject: document.getElementById('tarotCardObject'),
  tarotImg: document.getElementById('tarotImg'),
  tarotOrientationBadge: document.getElementById('tarotOrientationBadge'),
  tarotInstruction: document.getElementById('tarotInstruction'),
  btnDrawTarot: document.getElementById('btnDrawTarot'),
  btnRedrawTarot: document.getElementById('btnRedrawTarot'),
  tarotResultSection: document.getElementById('tarotResultSection'),
  resTarotNumber: document.getElementById('resTarotNumber'),
  resTarotName: document.getElementById('resTarotName'),
  resTarotOrientTag: document.getElementById('resTarotOrientTag'),
  resTarotElement: document.getElementById('resTarotElement'),
  resTarotKeywords: document.getElementById('resTarotKeywords'),
  resTarotCore: document.getElementById('resTarotCore'),
  resTarotYesNo: document.getElementById('resTarotYesNo'),
  resTarotCareer: document.getElementById('resTarotCareer'),
  resTarotFinance: document.getElementById('resTarotFinance'),
  resTarotLove: document.getElementById('resTarotLove'),
  resTarotMind: document.getElementById('resTarotMind'),
  resTarotAdvice: document.getElementById('resTarotAdvice'),
  resTarotColorTip: document.getElementById('resTarotColorTip'),
  btnShareTarot: document.getElementById('btnShareTarot'),

  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  tabPages: document.querySelectorAll('.tab-page'),
  chipBtns: document.querySelectorAll('.chip-btn'),

};

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  loadSavedUser();
  setupEventListeners();
  renderApp();
  initTarot();
});

function loadSavedUser() {
  const saved = localStorage.getItem('LUCKY_USER');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // หากเป็นบัญชี Guest หรือผู้เยี่ยมชมเดิม ให้ยกเลิก เพื่อบังคับให้สมัครสมาชิกหรือเข้าสู่ระบบจริง
      if (parsed && parsed.token && (parsed.token.startsWith('GUEST_') || parsed.email === 'guest@everydaylucky.app')) {
        localStorage.removeItem('LUCKY_USER');
        return;
      }
      if (parsed && typeof parsed.isLoggedIn === 'boolean') {
        if (!parsed.plan) parsed.plan = 'free';
        AppState.currentUser = parsed;
      }
    } catch(e) {
      console.warn('Failed to parse saved user', e);
    }
  }
}

function saveUserToStorage() {
  localStorage.setItem('LUCKY_USER', JSON.stringify(AppState.currentUser));
}

function updateViewMode() {
  const isAuth = AppState.currentUser && AppState.currentUser.isLoggedIn;
  if (isAuth) {
    DOM.viewAuth.style.display = 'none';
    DOM.viewMain.style.display = 'block';
  } else {
    DOM.viewAuth.style.display = 'flex';
    DOM.viewMain.style.display = 'none';
  }
}

function setupEventListeners() {
  // --- Auth Screen Tabs (Login / Register Switch) ---
  if (DOM.btnTabLogin && DOM.btnTabRegister) {
    DOM.btnTabLogin.addEventListener('click', () => switchMainAuthTab('login'));
    DOM.btnTabRegister.addEventListener('click', () => switchMainAuthTab('register'));
  }

  // --- Auth Form Submissions ---
  if (DOM.formMainLogin) {
    DOM.formMainLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      handleMainLogin();
    });
  }

  if (DOM.formMainRegister) {
    DOM.formMainRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      handleMainRegister();
    });
  }

  // --- Header Profile Button ---
  if (DOM.btnSwitchToProfile) {
    DOM.btnSwitchToProfile.addEventListener('click', () => {
      switchTab('tabProfile');
    });
  }

  // --- Navigation Tabs in Main View ---
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // --- Goal Chips ---
  DOM.chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.chipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.currentGoal = btn.getAttribute('data-goal');
      updateDailyColorsAndAdvice();
    });
  });

  // --- Personal Color Season Cards in Wardrobe ---
  DOM.seasonCards.forEach(card => {
    card.addEventListener('click', () => {
      DOM.seasonCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const season = card.getAttribute('data-season');
      AppState.currentUser.personalColor = season;
      DOM.selectPersonalColor.value = season;
      saveUserToStorage();
      updateHeaderBadges();
      updateDailyColorsAndAdvice();
    });
  });

  // --- Quick button to Remedies ---
  if (DOM.btnGoToRemedy) {
    DOM.btnGoToRemedy.addEventListener('click', () => {
      switchTab('tabRemedies');
    });
  }

  // --- Weekly Day Selector Pills (อาทิตย์ - เสาร์) ---
  if (DOM.dayPillBtns) {
    DOM.dayPillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.getAttribute('data-day');
        AppState.selectedDay = day;
        updateDayPillsUI();
        updateDailyColorsAndAdvice();
      });
    });
  }

  // --- Quick "วันนี้" Button ---
  if (DOM.btnQuickToday) {
    DOM.btnQuickToday.addEventListener('click', () => {
      AppState.selectedDay = AppState.todayDay;
      updateDayPillsUI();
      updateDailyColorsAndAdvice();
    });
  }

  // --- Weekly 7-Day Overview Modal ---
  if (DOM.btnOpenWeeklyModal) {
    DOM.btnOpenWeeklyModal.addEventListener('click', () => {
      renderWeeklyMatrix();
      if (DOM.modalWeeklyOverview) DOM.modalWeeklyOverview.classList.add('active');
    });
  }
  if (DOM.btnCloseWeeklyModal) {
    DOM.btnCloseWeeklyModal.addEventListener('click', () => {
      if (DOM.modalWeeklyOverview) DOM.modalWeeklyOverview.classList.remove('active');
    });
  }
  if (DOM.btnDoneWeeklyModal) {
    DOM.btnDoneWeeklyModal.addEventListener('click', () => {
      if (DOM.modalWeeklyOverview) DOM.modalWeeklyOverview.classList.remove('active');
    });
  }
  if (DOM.modalWeeklyOverview) {
    DOM.modalWeeklyOverview.addEventListener('click', (e) => {
      if (e.target === DOM.modalWeeklyOverview) DOM.modalWeeklyOverview.classList.remove('active');
    });
  }

  // --- Save Profile (From Profile Tab) ---
  if (DOM.btnSaveProfile) {
    DOM.btnSaveProfile.addEventListener('click', () => {
      AppState.currentUser.birthDay = DOM.selectBirthDay.value;
      AppState.currentUser.zodiac = DOM.selectZodiac.value;
      AppState.currentUser.personalColor = DOM.selectPersonalColor.value;
      if (DOM.selectGender) {
        AppState.currentUser.gender = DOM.selectGender.value;
      }
      saveUserToStorage();
      renderApp();
      alert('บันทึกข้อมูลดวงชะตาเรียบร้อยแล้ว!');
    });
  }

  // --- Style Selector: กางเกง vs กระโปรง ---
  if (DOM.btnStylePants && DOM.btnStyleSkirt) {
    DOM.btnStylePants.addEventListener('click', () => setBottomStyle('pants'));
    DOM.btnStyleSkirt.addEventListener('click', () => setBottomStyle('skirt'));
  }


  // --- Logout Button ---
  if (DOM.btnLogout) {
    DOM.btnLogout.addEventListener('click', () => {
      AppState.currentUser.isLoggedIn = false;
      AppState.currentUser.token = null;
      saveUserToStorage();
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Tarot Listeners ---
  if (DOM.btnHomeOpenTarot) {
    DOM.btnHomeOpenTarot.addEventListener('click', () => {
      switchTab('tabTarot');
    });
  }
  if (DOM.btnDrawTarot) {
    DOM.btnDrawTarot.addEventListener('click', handleDrawTarot);
  }
  if (DOM.tarotCardScene) {
    DOM.tarotCardScene.addEventListener('click', () => {
      if (DOM.tarotCardObject && !DOM.tarotCardObject.classList.contains('flipped')) {
        handleDrawTarot();
      }
    });
  }
  if (DOM.btnRedrawTarot) {
    DOM.btnRedrawTarot.addEventListener('click', handleResetTarot);
  }
  if (DOM.btnShareTarot) {
    DOM.btnShareTarot.addEventListener('click', handleShareTarot);
  }

  // --- Resize Listener for Radar Chart ---
  window.addEventListener('resize', () => {
    if (AppState.currentUser && AppState.currentUser.isLoggedIn && AppState.activeTab === 'tabHome') {
      renderRadarChart();
    }
  });
}


function switchMainAuthTab(mode) {
  if (mode === 'login') {
    DOM.btnTabLogin.classList.add('active');
    DOM.btnTabRegister.classList.remove('active');
    DOM.formMainLogin.classList.add('active');
    DOM.formMainRegister.classList.remove('active');
  } else {
    DOM.btnTabLogin.classList.remove('active');
    DOM.btnTabRegister.classList.add('active');
    DOM.formMainLogin.classList.remove('active');
    DOM.formMainRegister.classList.add('active');
  }
}

async function handleMainLogin() {
  const email = DOM.authLoginEmail.value.trim();
  const password = DOM.authLoginPassword.value;

  if (!email || !password) {
    alert('กรุณากรอกอีเมลและรหัสผ่าน');
    return;
  }

  const submitBtn = DOM.formMainLogin ? DOM.formMainLogin.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ กำลังเข้าสู่ระบบ...';
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'login', email, password })
    });
    const data = await res.json();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }

    if (data.success) {
      AppState.currentUser = {
        isLoggedIn: true,
        displayName: data.user.displayName,
        email: data.user.email,
        gender: data.user.gender || 'female',
        birthDay: data.user.birthDay,
        zodiac: data.user.zodiac || 'ราศีพฤษภ',
        personalColor: data.user.personalColor || 'Spring',
        plan: 'free',
        token: data.token
      };
      saveUserToStorage();
      renderApp();
      alert(data.message || 'เข้าสู่ระบบสำเร็จ');
      return;
    } else {
      alert(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      return;
    }
  } catch(err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
    console.error('Login error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets: ' + (err.message || 'โปรดตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง'));
  }
}

async function handleMainRegister() {
  const name = DOM.authRegName.value.trim();
  const email = DOM.authRegEmail.value.trim();
  const password = DOM.authRegPassword.value;
  const birthDay = DOM.authRegBirthDay.value;
  const personalColor = DOM.authRegPersonalColor.value;
  const gender = (DOM.authRegGender && DOM.authRegGender.value) || 'female';
  const pdpaConsent = DOM.authRegPdpaConsent.checked;

  if (!name || !email || !password) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  if (!pdpaConsent) {
    alert('กรุณายินยอมเงื่อนไขการคุ้มครองข้อมูลส่วนบุคคล (PDPA)');
    return;
  }

  const submitBtn = DOM.formMainRegister ? DOM.formMainRegister.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ กำลังบันทึกข้อมูลสมาชิกลงชีต...';
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'register',
        displayName: name,
        email: email,
        password: password,
        gender: gender,
        birthDay: birthDay,
        personalColor: personalColor,
        plan: 'free',
        pdpaConsent: true
      })
    });

    const data = await res.json();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }

    if (data.success) {
      AppState.currentUser = {
        isLoggedIn: true,
        displayName: data.user.displayName,
        email: data.user.email,
        gender: gender,
        birthDay: data.user.birthDay,
        zodiac: data.user.zodiac || 'ราศีพฤษภ',
        personalColor: data.user.personalColor || personalColor,
        plan: 'free',
        token: data.token
      };
      saveUserToStorage();
      renderApp();
      alert('🎉 สมัครสมาชิกสำเร็จ!\nยินดีต้อนรับสู่ Look&Luck (ข้อมูลบันทึกลง Google Sheets เรียบร้อยแล้ว)');
      return;
    } else {
      alert('❌ ไม่สามารถลงทะเบียนได้:\n' + (data.message || 'โปรดลองใหม่อีกครั้ง'));
      return;
    }
  } catch(err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
    console.error('Register error:', err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets: ' + (err.message || 'โปรดตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง'));
  }
}

function switchTab(tabId) {
  AppState.activeTab = tabId;
  DOM.navItems.forEach(n => {
    n.classList.toggle('active', n.getAttribute('data-tab') === tabId);
  });
  DOM.tabPages.forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
  if (tabId === 'tabHome') {
    setTimeout(renderRadarChart, 60);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateHeaderBadges() {
  const u = AppState.currentUser;
  if (!u || !u.isLoggedIn) return;

  const gender = u.gender || 'female';
  const genderLabels = { female: 'เพศ: หญิง', male: 'เพศ: ชาย', unisex: 'เพศ: ยูนิเซ็กส์' };

  DOM.displayUserName.textContent = u.displayName || 'ผู้ใช้งาน';
  if (DOM.badgeGender) DOM.badgeGender.textContent = genderLabels[gender] || 'เพศ: หญิง';
  DOM.badgeBirthDay.textContent = `เกิดวัน${u.birthDay}`;
  DOM.badgeSeason.textContent = `Personal Color: ${u.personalColor}`;
  DOM.badgePlan.textContent = u.plan === 'premium' ? '👑 Premium Member' : 'Free Member';

  // Profile Page
  DOM.profDisplayName.textContent = u.displayName || 'ผู้ใช้งาน';
  DOM.profEmail.textContent = u.email || 'user@example.com';
  DOM.profileAvatar.textContent = (u.displayName || 'ช').charAt(0);
  DOM.selectBirthDay.value = u.birthDay;
  DOM.selectZodiac.value = u.zodiac || 'ราศีพฤษภ';
  DOM.selectPersonalColor.value = u.personalColor || 'Spring';
  if (DOM.selectGender) DOM.selectGender.value = gender;
  DOM.profPlanTag.textContent = u.plan === 'premium' ? '👑 สมาชิกพรีเมียม (VIP)' : 'สมาชิกฟรี (Free)';

  // Gender specific clothing toggle behavior:
  if (DOM.btnStyleSkirt) {
    if (gender === 'male') {
      DOM.btnStyleSkirt.style.display = 'none';
      setBottomStyle('pants');
    } else {
      DOM.btnStyleSkirt.style.display = 'inline-block';
    }
  }

  // Sync Season Grid in Wardrobe
  DOM.seasonCards.forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-season') === u.personalColor);
  });
}


function renderApp() {
  updateViewMode();
  if (AppState.currentUser && AppState.currentUser.isLoggedIn) {
    updateCurrentDate();
    updateHeaderBadges();
    updateDayPillsUI();
    updateDailyColorsAndAdvice();
  }
}

function updateDayPillsUI() {
  const currentDay = AppState.todayDay;
  const selectedDay = AppState.selectedDay;

  // แบดจ์ "วันนี้"
  const dayBadgeMap = {
    'อาทิตย์': 'badgeTodaySun',
    'จันทร์': 'badgeTodayMon',
    'อังคาร': 'badgeTodayTue',
    'พุธ': 'badgeTodayWed',
    'พฤหัสบดี': 'badgeTodayThu',
    'ศุกร์': 'badgeTodayFri',
    'เสาร์': 'badgeTodaySat'
  };

  Object.entries(dayBadgeMap).forEach(([day, badgeId]) => {
    const el = document.getElementById(badgeId);
    if (el) el.style.display = (day === currentDay) ? 'inline-block' : 'none';
  });

  if (DOM.dayPillBtns) {
    DOM.dayPillBtns.forEach(btn => {
      const d = btn.getAttribute('data-day');
      btn.classList.toggle('active', d === selectedDay);
    });
  }

  if (DOM.btnQuickToday) {
    DOM.btnQuickToday.classList.toggle('active', selectedDay === currentDay);
  }
}

function updateCurrentDate() {
  const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const now = new Date();
  const dayName = days[now.getDay()];
  const dateNum = now.getDate();
  const monthName = months[now.getMonth()];
  const yearTh = now.getFullYear() + 543;
  DOM.currentDateDisplay.textContent = `${dayName}ที่ ${dateNum} ${monthName} ${yearTh}`;
}

function setBottomStyle(style) {
  AppState.bottomStyle = style;
  if (style === 'skirt') {
    if (DOM.btnStyleSkirt) DOM.btnStyleSkirt.classList.add('active');
    if (DOM.btnStylePants) DOM.btnStylePants.classList.remove('active');
    if (DOM.itemSkirt) DOM.itemSkirt.style.display = 'block';
    if (DOM.itemPants) DOM.itemPants.style.display = 'none';
  } else {
    if (DOM.btnStylePants) DOM.btnStylePants.classList.add('active');
    if (DOM.btnStyleSkirt) DOM.btnStyleSkirt.classList.remove('active');
    if (DOM.itemPants) DOM.itemPants.style.display = 'block';
    if (DOM.itemSkirt) DOM.itemSkirt.style.display = 'none';
  }
  updateFlatlayCaption();
  updateDailyColorsAndAdvice();
}

function updateFlatlayCaption() {
  if (!DOM.flatlayCaptionText) return;
  const user = AppState.currentUser;
  const gender = (user && user.gender) || 'female';
  let bottomName = '';
  if (gender === 'male') {
    bottomName = 'กางเกงสแล็คสีเบจ';
  } else if (AppState.bottomStyle === 'skirt') {
    bottomName = 'กระโปรงทรงเอสีเบจ';
  } else {
    bottomName = 'กางเกงสแล็คทรงสวย';
  }
  DOM.flatlayCaptionText.textContent = `เสื้อสีมงคล + ${bottomName}`;
}

function updateDailyColorsAndAdvice() {
  const user = AppState.currentUser;
  const userBirthDay = (user && user.birthDay) ? user.birthDay : 'จันทร์';
  const targetDay = AppState.selectedDay || AppState.todayDay || 'จันทร์';
  const goal = AppState.currentGoal || 'work';
  const season = (user && user.personalColor) ? user.personalColor : 'Spring';

  // คำนวณแบบ 2 แกน: วันที่สวมใส่ (Target Transiting Day) x วันเกิดบุคคล (Natal Protection)
  const evalData = evaluateTransitingColors(targetDay, userBirthDay, goal);
  const dayRules = evalData.dayRules;

  // 1. อัปเดตข้อความหัวการ์ดและป้ายวันเป้าหมาย
  if (DOM.txtHeroDayTitle) {
    const isToday = (targetDay === AppState.todayDay);
    DOM.txtHeroDayTitle.textContent = isToday ? `สีมงคลวันนี้ (วัน${targetDay})` : `สีมงคลประจำวัน${targetDay}`;
  }
  if (DOM.badgeTargetDay) {
    DOM.badgeTargetDay.textContent = `สำหรับสวมใส่: วัน${targetDay}`;
  }
  if (DOM.txtHeroDayDesc) {
    DOM.txtHeroDayDesc.textContent = `คำนวณตามพลังงานดาวประจำวัน${targetDay} ผสานความปลอดภัยตามวันเกิดของคุณ`;
  }

  // 2. แสดงผล Swatches สีมงคล (ใช้สีที่ผ่านการกรองความปลอดภัยแล้ว)
  DOM.txtWorkColors.textContent = evalData.work.safeName;
  DOM.txtMoneyColors.textContent = evalData.money.safeName;
  DOM.txtLoveColors.textContent = evalData.love.safeName;
  DOM.txtKalakiniColors.textContent = dayRules.kalakini.name;

  if (evalData.work.safeHex.length > 0) {
    DOM.swatchWork.style.background = `linear-gradient(135deg, ${evalData.work.safeHex[0]}, ${evalData.work.safeHex[1] || evalData.work.safeHex[0]})`;
  }
  if (evalData.money.safeHex.length > 0) {
    DOM.swatchMoney.style.background = `linear-gradient(135deg, ${evalData.money.safeHex[0]}, ${evalData.money.safeHex[1] || evalData.money.safeHex[0]})`;
  }
  if (evalData.love.safeHex.length > 0) {
    DOM.swatchLove.style.background = `linear-gradient(135deg, ${evalData.love.safeHex[0]}, ${evalData.love.safeHex[1] || evalData.love.safeHex[0]})`;
  }

  // 3. ปรับแต่งกล่องแจ้งเตือนการกรองความปลอดภัยตามวันเกิด (Natal Protection Banner)
  if (DOM.boxPersonalizedNotice) {
    if (DOM.titleProtectionNotice) {
      DOM.titleProtectionNotice.textContent = `ระบบกรองดวงเฉพาะตัว (เกิดวัน${userBirthDay}):`;
    }
    if (evalData.hasAnyConflict) {
      DOM.boxPersonalizedNotice.classList.add('warning');
      if (DOM.iconProtectionNotice) DOM.iconProtectionNotice.textContent = '⚡';
      if (DOM.tagProtectionStatus) {
        DOM.tagProtectionStatus.className = 'protection-status-tag filtered';
        DOM.tagProtectionStatus.textContent = 'ปรับสีปลอดภัยแล้ว';
      }
      if (DOM.txtPersonalizedDetail) {
        DOM.txtPersonalizedDetail.textContent = `เนื่องจากคุณเกิดวัน${userBirthDay} (มี ${evalData.natalKalakini} เป็นสีกาลกิณีประจำตัว) ระบบได้คัดกรองสีที่ขัดแย้งออก [${evalData.allConflicts.join(', ')}] และแนะนำเฉดสีที่ปลอดภัยเสริมดวงให้คุณแล้ว 100%!`;
      }
    } else {
      DOM.boxPersonalizedNotice.classList.remove('warning');
      if (DOM.iconProtectionNotice) DOM.iconProtectionNotice.textContent = '🛡️';
      if (DOM.tagProtectionStatus) {
        DOM.tagProtectionStatus.className = 'protection-status-tag safe';
        DOM.tagProtectionStatus.textContent = 'ปลอดภัย 100%';
      }
      if (DOM.txtPersonalizedDetail) {
        DOM.txtPersonalizedDetail.textContent = `สีมงคลประจำวัน${targetDay}ส่งพลังเกื้อหนุนดีเยี่ยมกับวันเกิดของคุณ ไร้สีกาลกิณีขัดแย้ง สวมใส่ได้อย่างมั่นใจเต็มร้อย`;
      }
    }
  }

  // 4. คำแนะนำการแต่งกายตามเป้าหมาย (Goal)
  let activeColors = evalData.activeCat.safeName;
  let activeHex = evalData.activeCat.safeHex;
  let headline = '';
  const userGender = user.gender || 'female';
  let bottomText = '';
  if (userGender === 'male') {
    bottomText = 'กางเกงสแล็คหรือกางเกงชิโน่สีเบจ/ครีม';
  } else if (userGender === 'female') {
    bottomText = AppState.bottomStyle === 'skirt' ? 'กระโปรงทรงเอสีเบจ/ครีม' : 'กางเกงสแล็คทรงโมเดิร์นสีเบจ/ครีม';
  } else {
    bottomText = 'กางเกงขายาวทรงกระบอกหรือกระโปรงมินิมอลสีเบจ';
  }

  if (goal === 'work') {
    headline = `แนะนำลุคเสริมการงาน &amp; เจรจาในวัน${targetDay} (เดช)`;
    outfitDesc = userGender === 'male'
      ? `เลือกสวมใส่เสื้อเชิ้ตหรือเสื้อโปโลสี ${activeColors} จับคู่กับ${bottomText} ให้บุคลิกดูภูมิฐาน ทรงอำนาจ และเจรจาราบรื่น`
      : `เลือกสวมใส่เสื้อเชิ้ตหรือเบลเซอร์สี ${activeColors} จับคู่กับ${bottomText} ให้บุคลิกดูสง่างาม มีบารมี และเจรจาสำเร็จ`;
  } else if (goal === 'money') {
    headline = `แนะนำลุคเรียกทรัพย์ &amp; โชคลาภในวัน${targetDay} (ศรี)`;
    outfitDesc = `ดึงดูดเงินทองด้วยเสื้อผ้ากลุ่มสี ${activeColors} จับคู่กับ${bottomText} เสริมเครื่องประดับเพื่อรวมพลังความมั่งคั่ง`;
  } else if (goal === 'love') {
    headline = `แนะนำลุคเสริมความรัก &amp; เสน่ห์เมตตาในวัน${targetDay}`;
    outfitDesc = `สวมใส่เสื้อผ้าโทนสีละมุน ${activeColors} ดีไซน์สบายตา จับคู่กับ${bottomText} ช่วยให้ผู้คนรอบข้างรู้สึกเข้าถึงง่ายและเกิดความรักใคร่เอ็นดู`;
  } else {
    activeColors = 'ขาว, ครีม, เทาอ่อน, เขียวธรรมชาติ';
    activeHex = ['#FFFDD0', '#E0E0E0', '#81C784'];
    headline = `แนะนำลุควันพักผ่อน &amp; ผ่อนคลายจิตใจในวัน${targetDay}`;
    outfitDesc = `เน้นเสื้อผ้าเนื้อผ้าคอตตอนหรือลินินสี ${activeColors} สวมคู่กับ${bottomText} เพื่อบำบัดความเหนื่อยล้า คืนพลังงานบริสุทธิ์ให้ร่างกาย`;
  }

  // Personal Color Adaptation
  let seasonNote = '';
  if (season === 'Spring') {
    seasonNote = ' (ปรับสำหรับ Warm Tone สว่าง: แนะนำเลือกเฉดที่สดใสสว่างและอบอุ่น เช่น ส้มคอรัลหรือเหลืองนวล)';
  } else if (season === 'Autumn') {
    seasonNote = ' (ปรับสำหรับ Warm Tone ลึก: แนะนำเลือกเฉดเอิร์ธโทนลึก เช่น เทอราคอตตาหรือช็อกโกแลต)';
  } else if (season === 'Summer') {
    seasonNote = ' (ปรับสำหรับ Cool Tone สว่าง: แนะนำเลือกเฉดพาสเทลนุ่มนวล เช่น ลาเวนเดอร์หรือฟ้าเบบี้บลู)';
  } else {
    seasonNote = ' (ปรับสำหรับ Cool Tone คมชัด: แนะนำเลือกเฉดที่มีคอนทราสต์ชัดเจน เช่น รอยัลบลูหรือเบอร์กันดี)';
  }

  DOM.txtAdviceTitle.innerHTML = headline;
  DOM.txtAdviceDescription.textContent = outfitDesc + seasonNote;

  // 5. อัปเดตสีเสื้อเวกเตอร์ SVG
  if (activeHex.length > 0 && DOM.pathShirt) {
    DOM.pathShirt.setAttribute('fill', activeHex[0]);
  }
  if (DOM.pathPants) DOM.pathPants.setAttribute('fill', '#E8DFD8');
  if (DOM.pathSkirt) DOM.pathSkirt.setAttribute('fill', '#E8DFD8');
  updateFlatlayCaption();

  // Render color dots
  DOM.adviceColorBar.innerHTML = '';
  activeHex.forEach(hex => {
    const dot = document.createElement('div');
    dot.className = 'advice-color-dot';
    dot.style.backgroundColor = hex;
    dot.title = hex;
    DOM.adviceColorBar.appendChild(dot);
  });

  // 6. เทวดานพเคราะห์ประจำวันเป้าหมาย
  const cleanTarget = (targetDay === 'พุธ (กลางวัน)' || targetDay === 'พุธ (กลางคืน)') ? 'พุธ (กลางวัน)' : targetDay;
  const deity = LOCAL_DEITY_TRIVIA[cleanTarget] || LOCAL_DEITY_TRIVIA['จันทร์'];
  DOM.txtDeityName.textContent = deity.name;
  DOM.txtDeityTrait.textContent = deity.trait;
  DOM.txtDeityStory.textContent = deity.story;

  // 7. กระเป๋าสตางค์และอัญมณี (อิงตามวันเกิดของผู้ใช้เพื่อพลังงานเฉพาะตัว)
  const wg = LOCAL_WALLETS[userBirthDay] || LOCAL_WALLETS['จันทร์'];
  DOM.txtWalletLucky.textContent = wg.walletLucky;
  DOM.txtWalletAvoid.textContent = `เลี่ยง: ${wg.walletAvoid}`;
  DOM.txtGemstone.textContent = wg.gem;
  DOM.txtGemstoneProp.textContent = wg.gemProp;

  // 8. อัปเดตกราฟเรดาร์
  renderRadarChart();
}

/**
 * แสดงตารางสรุป 7 วัน (Weekly 7-Day Matrix Modal)
 */
function renderWeeklyMatrix() {
  if (!DOM.weeklyTableContainer) return;
  const user = AppState.currentUser;
  const userBirthDay = (user && user.birthDay) ? user.birthDay : 'จันทร์';
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  if (DOM.txtWeeklyModalSubtitle) {
    DOM.txtWeeklyModalSubtitle.textContent = `ตารางสีมงคล 7 วัน คำนวณปรับเข้ากับคนเกิดวัน${userBirthDay} โดยเฉพาะ`;
  }

  DOM.weeklyTableContainer.innerHTML = '';

  days.forEach(day => {
    const evalData = evaluateTransitingColors(day, userBirthDay, 'work');
    const isCurrent = (day === AppState.selectedDay);
    const isToday = (day === AppState.todayDay);

    const card = document.createElement('div');
    card.className = `weekly-day-card ${isCurrent ? 'current' : ''}`;
    card.style.cursor = 'pointer';
    card.title = `คลิกเพื่อเลือกดูวัน${day}`;

    card.innerHTML = `
      <div class="weekly-day-card-header">
        <div>
          <strong>วัน${day}</strong>
          ${isToday ? '<span class="weekly-badge-today">วันนี้</span>' : ''}
          ${evalData.hasAnyConflict ? '<span style="font-size:0.6rem; margin-left:6px; background:#FEF3C7; color:#92400E; padding:1px 5px; border-radius:4px; font-weight:600;">⚡ กรองสีชนแล้ว</span>' : ''}
        </div>
        <button type="button" class="btn-text-link" style="font-size:0.7rem;">เลือกดูวันนี้ &rsaquo;</button>
      </div>
      <div class="weekly-colors-grid">
        <div class="weekly-color-field">
          <span class="label">💼 งาน/เดช:</span>
          <span class="value">${evalData.work.safeName}</span>
        </div>
        <div class="weekly-color-field">
          <span class="label">💰 เงิน/ศรี:</span>
          <span class="value">${evalData.money.safeName}</span>
        </div>
        <div class="weekly-color-field">
          <span class="label">💖 รัก/เมตตา:</span>
          <span class="value">${evalData.love.safeName}</span>
        </div>
        <div class="weekly-color-field kalakini">
          <span class="label">⚠️ เลี่ยง/กาลกิณี:</span>
          <span class="value">${evalData.dayRules.kalakini.name}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      AppState.selectedDay = day;
      updateDayPillsUI();
      updateDailyColorsAndAdvice();
      if (DOM.modalWeeklyOverview) DOM.modalWeeklyOverview.classList.remove('active');
    });

    DOM.weeklyTableContainer.appendChild(card);
  });
}

/**
 * ฟังก์ชันวาดกราฟเรดาร์ (Spider/Radar Chart) แสดงคะแนนพลังดวง 5 มิติ
 */
function renderRadarChart() {
  const canvas = DOM.radarChartCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const user = AppState.currentUser;
  const userBirthDay = (user && user.birthDay) ? user.birthDay : 'จันทร์';
  const targetDay = AppState.selectedDay || AppState.todayDay || 'จันทร์';
  const goal = AppState.currentGoal || 'work';

  // ฐานคะแนนดวง: ผสมระหว่างพลังงานของวันเป้าหมาย (targetDay 60%) กับวันเกิดผู้ใช้ (userBirthDay 40%)
  const baseScores = {
    'อาทิตย์': { work: 92, money: 84, love: 82, health: 85, wisdom: 88 },
    'จันทร์': { work: 84, money: 90, love: 95, health: 82, wisdom: 86 },
    'อังคาร': { work: 94, money: 86, love: 79, health: 91, wisdom: 83 },
    'พุธ': { work: 86, money: 88, love: 85, health: 81, wisdom: 96 },
    'พุธ (กลางวัน)': { work: 86, money: 88, love: 85, health: 81, wisdom: 96 },
    'พุธ (กลางคืน)': { work: 88, money: 94, love: 83, health: 79, wisdom: 89 },
    'พฤหัสบดี': { work: 89, money: 85, love: 87, health: 86, wisdom: 97 },
    'ศุกร์': { work: 83, money: 93, love: 96, health: 85, wisdom: 88 },
    'เสาร์': { work: 91, money: 88, love: 80, health: 89, wisdom: 86 }
  };

  const natalScore = baseScores[userBirthDay] || baseScores['จันทร์'];
  const transitingScore = baseScores[targetDay] || baseScores['จันทร์'];

  const scores = {
    work: Math.round(transitingScore.work * 0.6 + natalScore.work * 0.4),
    money: Math.round(transitingScore.money * 0.6 + natalScore.money * 0.4),
    love: Math.round(transitingScore.love * 0.6 + natalScore.love * 0.4),
    health: Math.round(transitingScore.health * 0.6 + natalScore.health * 0.4),
    wisdom: Math.round(transitingScore.wisdom * 0.6 + natalScore.wisdom * 0.4)
  };

  // บูสต์คะแนนตามเป้าหมายที่ผู้ใช้เลือกในวันนั้น (Goal Alignment)
  if (goal === 'work') scores.work = Math.min(99, scores.work + 6);
  else if (goal === 'money') scores.money = Math.min(99, scores.money + 6);
  else if (goal === 'love') scores.love = Math.min(99, scores.love + 6);
  else if (goal === 'casual') scores.health = Math.min(99, scores.health + 6);

  // อัปเดตตัวเลขในกล่อง Badge ด้านล่างกราฟ
  if (DOM.valScoreWork) DOM.valScoreWork.textContent = scores.work + '%';
  if (DOM.valScoreMoney) DOM.valScoreMoney.textContent = scores.money + '%';
  if (DOM.valScoreLove) DOM.valScoreLove.textContent = scores.love + '%';
  if (DOM.valScoreHealth) DOM.valScoreHealth.textContent = scores.health + '%';
  if (DOM.valScoreWisdom) DOM.valScoreWisdom.textContent = scores.wisdom + '%';

  // ไฮไลต์ป้ายคะแนนด้านที่ตรงกับเป้าหมาย
  const mapItem = { work: DOM.itemScoreWork, money: DOM.itemScoreMoney, love: DOM.itemScoreLove, casual: DOM.itemScoreHealth };
  [DOM.itemScoreWork, DOM.itemScoreMoney, DOM.itemScoreLove, DOM.itemScoreHealth, DOM.itemScoreWisdom].forEach(el => {
    if (el) el.classList.remove('active');
  });
  if (mapItem[goal]) mapItem[goal].classList.add('active');

  // คำนวณคะแนนรวมเฉลี่ย
  const totalAvg = Math.round((scores.work + scores.money + scores.love + scores.health + scores.wisdom) / 5);
  if (DOM.radarTotalScore) DOM.radarTotalScore.textContent = totalAvg + '%';
  if (DOM.radarScoreLevel) {
    if (totalAvg >= 88) DOM.radarScoreLevel.textContent = 'เกณฑ์ดีเยี่ยม';
    else if (totalAvg >= 78) DOM.radarScoreLevel.textContent = 'เกณฑ์ดีมาก';
    else DOM.radarScoreLevel.textContent = 'เกณฑ์ปานกลาง';
  }

  // คำทำนายเชิงลึกตามมิติที่เด่นที่สุด
  if (DOM.radarInsightText) {
    if (goal === 'money' || scores.money >= 92) {
      DOM.radarInsightText.textContent = `วันนี้คลื่นพลังการเงิน (${scores.money}%) พุ่งสูงเป็นพิเศษ แนะนำสวมใส่สีเสริมทรัพย์เพื่อกระตุ้นโชคลาภและการค้าขาย`;
    } else if (goal === 'work' || scores.work >= 92) {
      DOM.radarInsightText.textContent = `วันนี้คลื่นพลังอำนาจบารมี (${scores.work}%) โดดเด่น หนุนนำให้การเจรจาและการตัดสินใจได้รับความเชื่อมั่น`;
    } else if (goal === 'love' || scores.love >= 92) {
      DOM.radarInsightText.textContent = `วันนี้เสน่ห์เมตตามหานิยม (${scores.love}%) ส่องประกาย ช่วยให้การประสานงานและการออกเดตราบรื่นน่าประทับใจ`;
    } else {
      DOM.radarInsightText.textContent = `วันนี้ความสมดุลกายใจ (${scores.health}%) และสติปัญญา (${scores.wisdom}%) ยอดเยี่ยม เหมาะแก่การวางแผนระยะยาว`;
    }
  }

  // รองรับหน้าจอ Retina / High DPI
  const dpr = window.devicePixelRatio || 1;
  const width = 340;
  const height = 280;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 6;
  const radius = 86;
  const axes = [
    { label: 'การงาน', score: scores.work, key: 'work' },
    { label: 'การเงิน', score: scores.money, key: 'money' },
    { label: 'ความรัก', score: scores.love, key: 'love' },
    { label: 'สุขภาพ', score: scores.health, key: 'health' },
    { label: 'สติปัญญา', score: scores.wisdom, key: 'wisdom' }
  ];
  const numAxes = axes.length;
  const angleStep = (Math.PI * 2) / numAxes;
  const startAngle = -Math.PI / 2; // เริ่มจากด้านบน

  // 1. วาดโครงร่างใยแมงมุม 5 ระดับ (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  levels.forEach((lvl, idx) => {
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const a = startAngle + i * angleStep;
      const x = cx + radius * lvl * Math.cos(a);
      const y = cy + radius * lvl * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = idx === levels.length - 1 ? '#D7CFBE' : '#EFEAE0';
    ctx.lineWidth = idx === levels.length - 1 ? 1.5 : 1;
    ctx.stroke();
  });

  // 2. วาดแกนกิ่งเชื่อมจากจุดกึ่งกลาง (Axis Spokes)
  for (let i = 0; i < numAxes; i++) {
    const a = startAngle + i * angleStep;
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#EAE4D7';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 3. วาดรูปร่างพื้นที่คะแนนดวง (Filled Radar Polygon)
  ctx.beginPath();
  const points = [];
  for (let i = 0; i < numAxes; i++) {
    const a = startAngle + i * angleStep;
    const norm = Math.max(0.15, Math.min(1.0, axes[i].score / 100));
    const r = radius * norm;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    points.push({ x, y, score: axes[i].score, label: axes[i].label, key: axes[i].key });
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // ลงสีไล่ระดับแสงทองนวลแฟชั่น
  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
  grad.addColorStop(0, 'rgba(197, 160, 89, 0.45)');
  grad.addColorStop(1, 'rgba(235, 196, 142, 0.16)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = '#9C7238';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // 4. วาดจุดมาร์กเกอร์และตัวหนังสือรอบด้าน
  points.forEach((pt, i) => {
    // จุดวงกลมบนยอดมุม
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#9C7238';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ตำแหน่งชื่อป้ายรอบนอก
    const a = startAngle + i * angleStep;
    const labelDist = radius + 22;
    const lx = cx + labelDist * Math.cos(a);
    const ly = cy + labelDist * Math.sin(a) + 3;

    ctx.font = '600 11px Prompt, Sarabun, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const isHighlighted = (pt.key === goal || (goal === 'casual' && pt.key === 'health'));
    ctx.fillStyle = isHighlighted ? '#8C6239' : '#332D29';
    ctx.fillText(`${pt.label} ${pt.score}%`, lx, ly);
  });
}

// ===================================================
// TAROT ORACLE MODULE (ระบบไพ่ทาโรต์ดวงวันนี้)
// ===================================================

function initTarot() {
  const todayKey = 'LOOKLUCK_TAROT_' + new Date().toISOString().slice(0, 10);
  const saved = localStorage.getItem(todayKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.card) {
        displayTarotResult(parsed, false);
      }
    } catch(e) {
      console.warn('Tarot storage parse error', e);
    }
  }
}

function handleDrawTarot() {
  if (typeof TarotEngine === 'undefined') {
    alert('ระบบฐานข้อมูลไพ่ทาโรต์กำลังโหลด กรุณาลองใหม่อีกครั้ง');
    return;
  }

  if (DOM.btnDrawTarot) {
    DOM.btnDrawTarot.disabled = true;
    DOM.btnDrawTarot.textContent = '⏳ กำลังเปิดไพ่พยากรณ์...';
  }

  // Draw card using TarotEngine
  const result = TarotEngine.drawCard();
  
  // Save today's draw in localStorage
  const todayKey = 'LOOKLUCK_TAROT_' + new Date().toISOString().slice(0, 10);
  try {
    localStorage.setItem(todayKey, JSON.stringify(result));
  } catch(e) {}

  displayTarotResult(result, true);
}

function displayTarotResult(result, animate = true) {
  const card = result.card;
  const isReversed = result.isReversed;
  const data = result.data;

  // Set Front Image
  if (DOM.tarotImg) {
    DOM.tarotImg.src = card.image;
    DOM.tarotImg.alt = card.nameEn;
    // Error fallback image if connection issue
    DOM.tarotImg.onerror = function() {
      this.src = 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg';
    };
  }

  if (DOM.tarotOrientationBadge) {
    DOM.tarotOrientationBadge.textContent = result.orientationText;
  }

  // Animate Flip
  if (DOM.tarotCardObject) {
    DOM.tarotCardObject.classList.remove('is-reversed');
    if (isReversed) {
      DOM.tarotCardObject.classList.add('is-reversed');
    }
    DOM.tarotCardObject.classList.add('flipped');
  }

  // Fill in content
  if (DOM.resTarotNumber) DOM.resTarotNumber.textContent = `${card.arcana} • ${card.number}`;
  if (DOM.resTarotName) DOM.resTarotName.textContent = `${card.nameEn} (${card.nameTh})`;
  if (DOM.resTarotOrientTag) {
    DOM.resTarotOrientTag.textContent = result.orientationText;
    DOM.resTarotOrientTag.className = 'res-badge-orient ' + (isReversed ? 'reversed' : 'upright');
  }
  if (DOM.resTarotElement) DOM.resTarotElement.textContent = card.element;
  if (DOM.resTarotKeywords) DOM.resTarotKeywords.textContent = 'คำสำคัญ: ' + data.keywords.join(', ');
  if (DOM.resTarotCore) DOM.resTarotCore.textContent = data.general;
  if (DOM.resTarotYesNo) DOM.resTarotYesNo.textContent = data.yesNo;
  if (DOM.resTarotCareer) DOM.resTarotCareer.textContent = data.career;
  if (DOM.resTarotFinance) DOM.resTarotFinance.textContent = data.finance;
  if (DOM.resTarotLove) DOM.resTarotLove.textContent = data.love;
  if (DOM.resTarotMind) DOM.resTarotMind.textContent = data.mind;
  if (DOM.resTarotAdvice) DOM.resTarotAdvice.textContent = data.advice;
  if (DOM.resTarotColorTip) {
    DOM.resTarotColorTip.innerHTML = `🎨 <strong>ทริกเสริมสีมงคล Look&amp;Luck:</strong> ${data.colorTip}`;
  }

  // Update instruction & controls
  if (DOM.tarotInstruction) {
    DOM.tarotInstruction.textContent = '✨ สารจากไพ่ทาโรต์ได้เปิดเผยแล้ว นำข้อคิดไปปรับใช้ในการดำเนินชีวิตวันนี้';
  }
  if (DOM.btnDrawTarot) {
    DOM.btnDrawTarot.style.display = 'none';
    DOM.btnDrawTarot.disabled = false;
    DOM.btnDrawTarot.textContent = '✨ แตะเพื่อเปิดไพ่ทาโรต์ดวงวันนี้';
  }
  if (DOM.btnRedrawTarot) {
    DOM.btnRedrawTarot.style.display = 'block';
  }

  // Reveal result section
  setTimeout(() => {
    if (DOM.tarotResultSection) {
      DOM.tarotResultSection.style.display = 'flex';
      if (animate) {
        DOM.tarotResultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, animate ? 600 : 0);
}

function handleResetTarot() {
  if (DOM.tarotCardObject) {
    DOM.tarotCardObject.classList.remove('flipped');
    DOM.tarotCardObject.classList.remove('is-reversed');
  }
  if (DOM.tarotResultSection) {
    DOM.tarotResultSection.style.display = 'none';
  }
  if (DOM.btnRedrawTarot) {
    DOM.btnRedrawTarot.style.display = 'none';
  }
  if (DOM.btnDrawTarot) {
    DOM.btnDrawTarot.style.display = 'block';
  }
  if (DOM.tarotInstruction) {
    DOM.tarotInstruction.textContent = '🧘 หลับตา หายใจเข้าลึกๆ ตั้งจิตระลึกถึงสิ่งที่ท่านอยากได้คำแนะนำในวันนี้ แล้วกดปุ่มเพื่อเปิดไพ่';
  }
}

function handleShareTarot() {
  const cardName = DOM.resTarotName ? DOM.resTarotName.textContent : 'ไพ่ทาโรต์';
  const orient = DOM.resTarotOrientTag ? DOM.resTarotOrientTag.textContent : '';
  const core = DOM.resTarotCore ? DOM.resTarotCore.textContent : '';
  const shareText = `🔮 ไพ่ทาโรต์ดวงวันนี้ของฉันบน Look&Luck:\n【${cardName}】(${orient})\n\n🌟 คำทำนาย: ${core}\n\nเช็กสีเสื้อมงคลและเปิดไพ่ทาโรต์ได้ที่ Look&Luck!`;

  if (navigator.share) {
    navigator.share({
      title: 'Look&Luck - ไพ่ทาโรต์ดวงวันนี้',
      text: shareText
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('คัดลอกคำทำนายไพ่ทาโรต์เรียบร้อยแล้ว! สามารถนำไปแชร์ให้เพื่อนได้เลย');
    }).catch(() => {
      alert(shareText);
    });
  }
}



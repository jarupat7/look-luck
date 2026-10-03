/**
 * โชคดีทุกวัน (Everyday Lucky) - Frontend Application Script
 * รองรับทั้งสองโหมด:
 * 1. โหมด Offline Demo (ทำงานได้ทันที 100% โดยไม่ต้องพึ่งพาเซิร์ฟเวอร์)
 * 2. โหมด Live Google Sheets API (เมื่อผู้ใช้ใส่ Web App URL ของ Apps Script)
 */

// ฐานข้อมูลดวงและสีมงคลในเครื่อง (Client-side Astrological Knowledge Base)
const LOCAL_COLOR_RULES = {
  'อาทิตย์': {
    work: { name: 'ม่วงเปลือกมังคุด, ดำ, แดง', hex: ['#4A154B', '#1A1A1A', '#D32F2F'] },
    money: { name: 'เขียวสด, เขียวอ่อน, เทา', hex: ['#2E7D32', '#81C784', '#9E9E9E'] },
    love: { name: 'ชมพู, ขาว, ครีม, เบจ', hex: ['#F48FB1', '#FFFFFF', '#FFFDD0', '#F5F5DC'] },
    kalakini: { name: 'น้ำเงิน, ฟ้า, คราม', hex: ['#1565C0', '#42A5F5', '#1A237E'] }
  },
  'จันทร์': {
    work: { name: 'ส้ม, น้ำตาล, ฟ้า, เทาเข้ม', hex: ['#FF9800', '#795548', '#42A5F5', '#424242'] },
    money: { name: 'ดำ, ม่วง, เหลืองทอง', hex: ['#1A1A1A', '#7B1FA2', '#FFD700'] },
    love: { name: 'เขียว, ขาว, ครีม, น้ำเงิน', hex: ['#388E3C', '#FFFFFF', '#FFFDD0', '#1976D2'] },
    kalakini: { name: 'แดงสด, แดงเพลิง', hex: ['#D50000', '#FF1744'] }
  },
  'อังคาร': {
    work: { name: 'ม่วง, ชมพู, น้ำเงินเข้ม, แดง', hex: ['#7B1FA2', '#F06292', '#0D47A1', '#D32F2F'] },
    money: { name: 'ส้ม, น้ำตาล, ทอง', hex: ['#FF9800', '#6D4C41', '#FFD700'] },
    love: { name: 'ชมพู, แดงสด, ดำ', hex: ['#EC407A', '#C62828', '#212121'] },
    kalakini: { name: 'เหลือง, ขาว, เทาอ่อน', hex: ['#FBC02D', '#FAFAFA', '#E0E0E0'] }
  },
  'พุธ (กลางวัน)': {
    work: { name: 'น้ำเงิน, กรมท่า, ส้มแสด', hex: ['#1976D2', '#1A237E', '#FF6D00'] },
    money: { name: 'ม่วง, เทาควันบุหรี่, ดำ', hex: ['#8E24AA', '#757575', '#212121'] },
    love: { name: 'ส้ม, น้ำตาล, ขาว, เหลือง', hex: ['#FB8C00', '#795548', '#FFFFFF', '#FDD835'] },
    kalakini: { name: 'ชมพู, โอรส', hex: ['#F48FB1', '#FFAB91'] }
  },
  'พุธ (กลางคืน)': {
    work: { name: 'ดำ, เหลือง, ส้มแสด', hex: ['#212121', '#FBC02D', '#FF6D00'] },
    money: { name: 'แดง, ชมพู', hex: ['#D32F2F', '#F06292'] },
    love: { name: 'เทา, ม่วงพาสเทล', hex: ['#757575', '#CE93D8'] },
    kalakini: { name: 'เหลืองเข้ม, ทอง', hex: ['#F57F17', '#FFD700'] }
  },
  'พฤหัสบดี': {
    work: { name: 'เหลือง, ขาว, เทา, มุก', hex: ['#FBC02D', '#FFFFFF', '#9E9E9E', '#ECEFF1'] },
    money: { name: 'แดงเลือดหมู, ชมพู', hex: ['#880E4F', '#F48FB1'] },
    love: { name: 'ฟ้า, น้ำเงิน, เขียวทุกโทน', hex: ['#42A5F5', '#1565C0', '#2E7D32'] },
    kalakini: { name: 'ม่วง, ดำ, น้ำตาลเข้ม', hex: ['#6A1B9A', '#212121', '#3E2723'] }
  },
  'ศุกร์': {
    work: { name: 'เขียวมิ้นต์, ม่วง, ส้ม', hex: ['#80CBC4', '#7B1FA2', '#FF9800'] },
    money: { name: 'ชมพูพาสเทล, ฟ้า', hex: ['#F8BBD0', '#64B5F6'] },
    love: { name: 'เหลือง, ขาว, เทา, น้ำเงิน', hex: ['#FDD835', '#FFFFFF', '#9E9E9E', '#1565C0'] },
    kalakini: { name: 'ดำ, เทาเข้ม, น้ำตาล', hex: ['#212121', '#424242', '#5D4037'] }
  },
  'เสาร์': {
    work: { name: 'แดงเข้ม, ชมพู, ทับทิม', hex: ['#B71C1C', '#F06292', '#C2185B'] },
    money: { name: 'น้ำเงิน, ฟ้าคราม', hex: ['#1565C0', '#0288D1'] },
    love: { name: 'ม่วง, ดำ, เทา', hex: ['#7B1FA2', '#212121', '#757575'] },
    kalakini: { name: 'เขียวทุกเฉด', hex: ['#2E7D32', '#4CAF50', '#81C784'] }
  }
};

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

// State การทำงานของแอปพลิเคชัน
const AppState = {
  currentUser: {
    isLoggedIn: false,
    displayName: '',
    email: '',
    birthDay: 'จันทร์',
    zodiac: 'ราศีพฤษภ',
    personalColor: 'Spring',
    plan: 'free',
    token: null
  },
  currentGoal: 'work', // 'work', 'money', 'love', 'casual'
  apiUrl: localStorage.getItem('LUCKY_API_URL') || '',
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
  authRegPdpaConsent: document.getElementById('authRegPdpaConsent'),
  btnGuestPreview: document.getElementById('btnGuestPreview'),
  btnOpenConfigFromAuth: document.getElementById('btnOpenConfigFromAuth'),

  // Main View Header
  currentDateDisplay: document.getElementById('currentDateDisplay'),
  displayUserName: document.getElementById('displayUserName'),
  badgeBirthDay: document.getElementById('badgeBirthDay'),
  badgeSeason: document.getElementById('badgeSeason'),
  badgePlan: document.getElementById('badgePlan'),
  btnSwitchToProfile: document.getElementById('btnSwitchToProfile'),
  btnOpenConfig: document.getElementById('btnOpenConfig'),
  
  // Tab Home Elements
  txtWorkColors: document.getElementById('txtWorkColors'),
  txtMoneyColors: document.getElementById('txtMoneyColors'),
  txtLoveColors: document.getElementById('txtLoveColors'),
  txtKalakiniColors: document.getElementById('txtKalakiniColors'),
  swatchWork: document.getElementById('swatchWork'),
  swatchMoney: document.getElementById('swatchMoney'),
  swatchLove: document.getElementById('swatchLove'),
  flatlayTop: document.getElementById('flatlayTop'),
  flatlayBottom: document.getElementById('flatlayBottom'),
  flatlayAcc: document.getElementById('flatlayAcc'),
  flatlayCaptionText: document.getElementById('flatlayCaptionText'),
  txtAdviceTitle: document.getElementById('txtAdviceTitle'),
  txtAdviceDescription: document.getElementById('txtAdviceDescription'),
  adviceColorBar: document.getElementById('adviceColorBar'),
  txtDeityName: document.getElementById('txtDeityName'),
  txtDeityTrait: document.getElementById('txtDeityTrait'),
  txtDeityStory: document.getElementById('txtDeityStory'),
  
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
  btnSaveProfile: document.getElementById('btnSaveProfile'),
  btnLogout: document.getElementById('btnLogout'),

  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  tabPages: document.querySelectorAll('.tab-page'),
  chipBtns: document.querySelectorAll('.chip-btn'),

  // Config Modal
  modalConfig: document.getElementById('modalConfig'),
  btnCloseConfigModal: document.getElementById('btnCloseConfigModal'),
  inputApiUrl: document.getElementById('inputApiUrl'),
  btnSaveApiConfig: document.getElementById('btnSaveApiConfig'),
  apiStatusBadge: document.getElementById('apiStatusBadge')
};

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  loadSavedUser();
  setupEventListeners();
  renderApp();
});

function loadSavedUser() {
  const saved = localStorage.getItem('LUCKY_USER');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') {
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

  // --- Guest Mode Link ---
  if (DOM.btnGuestPreview) {
    DOM.btnGuestPreview.addEventListener('click', () => {
      AppState.currentUser = {
        isLoggedIn: true,
        displayName: 'คุณผู้เยี่ยมชม',
        email: 'guest@everydaylucky.app',
        birthDay: 'จันทร์',
        zodiac: 'ราศีพฤษภ',
        personalColor: 'Spring',
        plan: 'free',
        token: 'GUEST_' + Date.now()
      };
      saveUserToStorage();
      renderApp();
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

  // --- Save Profile (From Profile Tab) ---
  if (DOM.btnSaveProfile) {
    DOM.btnSaveProfile.addEventListener('click', () => {
      AppState.currentUser.birthDay = DOM.selectBirthDay.value;
      AppState.currentUser.zodiac = DOM.selectZodiac.value;
      AppState.currentUser.personalColor = DOM.selectPersonalColor.value;
      saveUserToStorage();
      renderApp();
      alert('บันทึกข้อมูลดวงชะตาเรียบร้อยแล้ว!');
    });
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

  // --- Config Modal Events ---
  const openConfigModal = () => {
    DOM.inputApiUrl.value = AppState.apiUrl;
    updateApiStatusBadge();
    DOM.modalConfig.classList.add('active');
  };

  if (DOM.btnOpenConfig) DOM.btnOpenConfig.addEventListener('click', openConfigModal);
  if (DOM.btnOpenConfigFromAuth) DOM.btnOpenConfigFromAuth.addEventListener('click', openConfigModal);

  DOM.btnCloseConfigModal.addEventListener('click', () => {
    DOM.modalConfig.classList.remove('active');
  });
  DOM.modalConfig.addEventListener('click', (e) => {
    if (e.target === DOM.modalConfig) DOM.modalConfig.classList.remove('active');
  });
  DOM.btnSaveApiConfig.addEventListener('click', () => {
    AppState.apiUrl = DOM.inputApiUrl.value.trim();
    localStorage.setItem('LUCKY_API_URL', AppState.apiUrl);
    updateApiStatusBadge();
    DOM.modalConfig.classList.remove('active');
    alert('บันทึกการตั้งค่า API แล้ว');
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

  if (AppState.apiUrl) {
    try {
      const res = await fetch(AppState.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await res.json();
      if (data.success) {
        AppState.currentUser = {
          isLoggedIn: true,
          displayName: data.user.displayName,
          email: data.user.email,
          birthDay: data.user.birthDay,
          zodiac: data.user.zodiac || 'ราศีพฤษภ',
          personalColor: data.user.personalColor || 'Spring',
          plan: data.user.plan || 'free',
          token: data.token
        };
        saveUserToStorage();
        renderApp();
        alert(data.message);
        return;
      } else {
        alert(data.message);
        return;
      }
    } catch(err) {
      console.warn('API connection failed, falling back to local demo login', err);
    }
  }

  // Local Demo Login fallback
  AppState.currentUser = {
    isLoggedIn: true,
    displayName: email.split('@')[0],
    email: email,
    birthDay: AppState.currentUser.birthDay || 'จันทร์',
    zodiac: AppState.currentUser.zodiac || 'ราศีพฤษภ',
    personalColor: AppState.currentUser.personalColor || 'Spring',
    plan: 'free',
    token: 'DEMO_TOKEN_' + Date.now()
  };
  saveUserToStorage();
  renderApp();
  alert(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${AppState.currentUser.displayName}`);
}

async function handleMainRegister() {
  const name = DOM.authRegName.value.trim();
  const email = DOM.authRegEmail.value.trim();
  const password = DOM.authRegPassword.value;
  const birthDay = DOM.authRegBirthDay.value;
  const personalColor = DOM.authRegPersonalColor.value;
  const pdpaConsent = DOM.authRegPdpaConsent.checked;

  if (!name || !email || !password) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  if (!pdpaConsent) {
    alert('กรุณายินยอมเงื่อนไขการคุ้มครองข้อมูลส่วนบุคคล (PDPA)');
    return;
  }

  if (AppState.apiUrl) {
    try {
      const res = await fetch(AppState.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'register',
          displayName: name,
          email: email,
          password: password,
          birthDay: birthDay,
          personalColor: personalColor,
          pdpaConsent: true
        })
      });
      const data = await res.json();
      if (data.success) {
        AppState.currentUser = {
          isLoggedIn: true,
          displayName: data.user.displayName,
          email: data.user.email,
          birthDay: data.user.birthDay,
          zodiac: data.user.zodiac || 'ราศีพฤษภ',
          personalColor: data.user.personalColor || personalColor,
          plan: 'free',
          token: data.token
        };
        saveUserToStorage();
        renderApp();
        alert(data.message);
        return;
      } else {
        alert(data.message);
        return;
      }
    } catch(err) {
      console.warn('API connection failed, falling back to local demo register', err);
    }
  }

  // Local Demo Register fallback
  AppState.currentUser = {
    isLoggedIn: true,
    displayName: name,
    email: email,
    birthDay: birthDay,
    zodiac: 'ราศีพฤษภ',
    personalColor: personalColor,
    plan: 'free',
    token: 'DEMO_TOKEN_' + Date.now()
  };
  saveUserToStorage();
  renderApp();
  alert(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${name} สู่โชคดีทุกวัน`);
}

function switchTab(tabId) {
  AppState.activeTab = tabId;
  DOM.navItems.forEach(n => {
    n.classList.toggle('active', n.getAttribute('data-tab') === tabId);
  });
  DOM.tabPages.forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateHeaderBadges() {
  const u = AppState.currentUser;
  if (!u || !u.isLoggedIn) return;

  DOM.displayUserName.textContent = u.displayName || 'ผู้ใช้งาน';
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
  DOM.profPlanTag.textContent = u.plan === 'premium' ? '👑 สมาชิกพรีเมียม (VIP)' : 'สมาชิกฟรี (Free)';

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
    updateDailyColorsAndAdvice();
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

function updateDailyColorsAndAdvice() {
  const user = AppState.currentUser;
  const dayKey = (user && user.birthDay) ? user.birthDay : 'จันทร์';
  const rules = LOCAL_COLOR_RULES[dayKey] || LOCAL_COLOR_RULES['จันทร์'];
  const goal = AppState.currentGoal;
  const season = (user && user.personalColor) ? user.personalColor : 'Spring';

  // 1. Swatches Text & Pill Visuals
  DOM.txtWorkColors.textContent = rules.work.name;
  DOM.txtMoneyColors.textContent = rules.money.name;
  DOM.txtLoveColors.textContent = rules.love.name;
  DOM.txtKalakiniColors.textContent = rules.kalakini.name;

  DOM.swatchWork.style.background = `linear-gradient(135deg, ${rules.work.hex[0]}, ${rules.work.hex[1] || rules.work.hex[0]})`;
  DOM.swatchMoney.style.background = `linear-gradient(135deg, ${rules.money.hex[0]}, ${rules.money.hex[1] || rules.money.hex[0]})`;
  DOM.swatchLove.style.background = `linear-gradient(135deg, ${rules.love.hex[0]}, ${rules.love.hex[1] || rules.love.hex[0]})`;

  // 2. Dynamic Advice by Goal & Personal Color
  let activeColors = '';
  let activeHex = [];
  let headline = '';
  let outfitDesc = '';

  if (goal === 'work') {
    activeColors = rules.work.name;
    activeHex = rules.work.hex;
    headline = 'แนะนำลุคเสริมการงาน &amp; เจรจา (เดช)';
    outfitDesc = `เลือกสวมใส่ชิ้นบนด้วยสี ${activeColors} จับคู่กับกางเกงหรือกระโปรงทรงโมเดิร์นสีเบจหรือครีม ให้บุคลิกดูภูมิฐาน ทรงอำนาจ และเจรจาราบรื่น`;
  } else if (goal === 'money') {
    activeColors = rules.money.name;
    activeHex = rules.money.hex;
    headline = 'แนะนำลุคเรียกทรัพย์ &amp; โชคลาภ (ศรี)';
    outfitDesc = `ดึงดูดเงินทองด้วยเสื้อผ้ากลุ่มสี ${activeColors} เลือกเนื้อผ้าที่มีประกายหรือสัมผัสซาติน เสริมเครื่องประดับเพื่อรวมพลังความมั่งคั่ง`;
  } else if (goal === 'love') {
    activeColors = rules.love.name;
    activeHex = rules.love.hex;
    headline = 'แนะนำลุคเสริมความรัก &amp; เสน่ห์เมตตา';
    outfitDesc = `สวมใส่โทนสีละมุน ${activeColors} ดีไซน์พริ้วไหว สบายตา ช่วยให้ผู้คนรอบข้างรู้สึกเข้าถึงง่ายและเกิดความรักใคร่เอ็นดู`;
  } else {
    activeColors = 'ขาว, ครีม, เทาอ่อน, เขียวธรรมชาติ';
    activeHex = ['#FFFDD0', '#E0E0E0', '#81C784'];
    headline = 'แนะนำลุควันพักผ่อน &amp; ผ่อนคลายจิตใจ';
    outfitDesc = `เน้นเนื้อผ้าคอตตอนหรือลินินสีเอิร์ธโทนและพาสเทล เพื่อบำบัดความเหนื่อยล้า คืนพลังงานบริสุทธิ์ให้ร่างกาย`;
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

  // Flat-lay visual colors
  if (activeHex.length > 0) {
    DOM.flatlayTop.style.background = activeHex[0];
  }
  DOM.flatlayBottom.style.background = '#E8DFD8';
  DOM.flatlayAcc.style.background = '#C5A059';
  DOM.flatlayCaptionText.textContent = `ชุดแนะนำ: ชิ้นหลัก ${activeColors.split(',')[0]}`;

  // Render color dots
  DOM.adviceColorBar.innerHTML = '';
  activeHex.forEach(hex => {
    const dot = document.createElement('div');
    dot.className = 'advice-color-dot';
    dot.style.backgroundColor = hex;
    dot.title = hex;
    DOM.adviceColorBar.appendChild(dot);
  });

  // 3. Deity of the Day
  const deity = LOCAL_DEITY_TRIVIA[dayKey] || LOCAL_DEITY_TRIVIA['จันทร์'];
  DOM.txtDeityName.textContent = deity.name;
  DOM.txtDeityTrait.textContent = deity.trait;
  DOM.txtDeityStory.textContent = deity.story;

  // 4. Wallets and Gems
  const wg = LOCAL_WALLETS[dayKey] || LOCAL_WALLETS['จันทร์'];
  DOM.txtWalletLucky.textContent = wg.walletLucky;
  DOM.txtWalletAvoid.textContent = `เลี่ยง: ${wg.walletAvoid}`;
  DOM.txtGemstone.textContent = wg.gem;
  DOM.txtGemstoneProp.textContent = wg.gemProp;
}

function updateApiStatusBadge() {
  if (AppState.apiUrl) {
    DOM.apiStatusBadge.textContent = 'สถานะ: เชื่อมต่อ Google Apps Script Web App แล้ว';
    DOM.apiStatusBadge.style.background = '#ECFDF5';
    DOM.apiStatusBadge.style.color = '#065F46';
  } else {
    DOM.apiStatusBadge.textContent = 'สถานะ: โหมดสาธิตออฟไลน์ (ทดลองใช้งานได้สมบูรณ์)';
    DOM.apiStatusBadge.style.background = '#F0FDF4';
    DOM.apiStatusBadge.style.color = '#166534';
  }
}

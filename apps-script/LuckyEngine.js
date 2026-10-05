/**
 * โชคดีทุกวัน (Everyday Lucky) - Lucky Engine & Astrological Logic
 * คำนวณสีมงคลประจำวันเกิด, ราศี 2569, Personal Color 4 ฤดูกาล และกลยุทธ์แก้เคล็ดสีกาลกิณี
 */

function getDailyLuckyAdvice(birthDay, goal, zodiac, personalColorSeason, targetDay) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const colorSheet = ss.getSheetByName('ColorRules');
  const zodiacSheet = ss.getSheetByName('ZodiacColors');
  const remediesSheet = ss.getSheetByName('Remedies');
  const wgSheet = ss.getSheetByName('WalletsAndGems');

  // ค่าปริยาย
  const dayKey = (birthDay || 'จันทร์').trim();
  const currentTargetDay = (targetDay || getTodayThaiDayName()).trim();
  const currentGoal = goal || 'work'; // 'work', 'money', 'love', 'casual'
  const season = personalColorSeason || 'Spring';

  // 1. ค้นหาข้อมูลสีมงคลตามวันที่สวมใส่ (หรือใช้วันเกิดเป็นฐานสำรอง)
  let luckyData = null;
  if (colorSheet) {
    const rows = colorSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString().trim() === currentTargetDay || rows[i][0].toString().trim() === dayKey) {
        luckyData = {
          birthDay: rows[i][0],
          workColors: rows[i][1],
          workHex: rows[i][2].split(','),
          moneyColors: rows[i][3],
          moneyHex: rows[i][4].split(','),
          loveColors: rows[i][5],
          loveHex: rows[i][6].split(','),
          kalakiniColors: rows[i][7],
          kalakiniHex: rows[i][8].split(',')
        };
        break;
      }
    }
  }

  // หากยังไม่มีชีตหรือหาไม่เจอ ใช้ข้อมูลสำรอง
  if (!luckyData) {
    luckyData = getFallbackColorRules(currentTargetDay);
  }

  // 2. ข้อมูลเทพประจำวันเป้าหมาย (เกร็ดความรู้)
  const deityTrivia = getDeityTrivia(currentTargetDay);

  // 3. กลยุทธ์แก้เคล็ดสีกาลกิณีประจำวันเกิด
  const remedies = getRemediesForDay(dayKey, luckyData.kalakiniColors);

  // 4. คำแนะนำการแต่งกายเฉพาะบุคคล (Personal Color Palette Matching)
  const outfitAdvice = generatePersonalColorOutfit(currentGoal, luckyData, season, zodiac);

  // 5. ข้อมูลกระเป๋าสตางค์และอัญมณี
  const walletAndGems = getWalletAndGemsForDay(dayKey);

  return {
    success: true,
    birthDay: dayKey,
    targetDay: currentTargetDay,
    todayThaiDay: getTodayThaiDayName(),
    todayDateFormatted: formatThaiDate(new Date()),
    luckyData: luckyData,
    goal: currentGoal,
    outfitAdvice: outfitAdvice,
    deityTrivia: deityTrivia,
    remedies: remedies,
    walletAndGems: walletAndGems
  };
}

function getTodayThaiDayName() {
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  return days[new Date().getDay()];
}

function formatThaiDate(d) {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

function getDeityTrivia(dayKey) {
  const trivia = {
    'อาทิตย์': {
      deity: 'พระอาทิตย์',
      story: 'สร้างจากราชสีห์ 6 ตัว ห่อด้วยผ้าสีแดง พรมน้ำอมฤต มีผิวกายสีแดง ทรงอำนาจ เด็ดขาด กล้าหาญ',
      powerTrait: 'บารมี ความเป็นผู้นำ และเกียรติยศ'
    },
    'จันทร์': {
      deity: 'พระจันทร์',
      story: 'สร้างจากเทพธิดา 15 นาง ห่อด้วยผ้าสีขาวนวล จึงมีสีกายขาวนวล อ่อนโยน มีเสน่ห์ เมตตามหานิยม',
      powerTrait: 'เสน่ห์ ความรักใคร่เอ็นดู และการปรับตัว'
    },
    'อังคาร': {
      deity: 'พระอังคาร',
      story: 'สร้างจากกระบือ 8 ตัว ห่อด้วยผ้าสีชมพูหม่น มีผิวกายสีชมพู นักรบผู้กล้า มุ่งมั่น ไม่ยอมแพ้ต่ออุปสรรค',
      powerTrait: 'ความกล้าหาญ ความเด็ดเดี่ยว และพลังลุย'
    },
    'พุธ (กลางวัน)': {
      deity: 'พระพุธ',
      story: 'สร้างจากช้าง 17 เชือก ห่อด้วยผ้าสีเขียวใบไม้ มีผิวกายสีเขียว เชาวน์ปัญญาเป็นเลิศ วาทศิลป์ยอดเยี่ยม',
      powerTrait: 'การเจรจาค้าขาย สติปัญญา และการสื่อสาร'
    },
    'พุธ (กลางคืน)': {
      deity: 'พระราหู',
      story: 'สร้างจากหัวกะโหลก 12 หัว ห่อด้วยผ้าสีทองหรือสีนิล มีกายสีนิล พลังลึกลับ พลิกวิกฤตเป็นโอกาส',
      powerTrait: 'โชคลาภที่ไม่คาดคิด ความเฉลียวฉลาดทันคน'
    },
    'พฤหัสบดี': {
      deity: 'พระพฤหัสบดี',
      story: 'สร้างจากพระฤๅษี 19 ตน ห่อด้วยผ้าสีส้มแดง ครูแห่งทวยเทพ คุณธรรมความดีและสติปัญญาขั้นสูง',
      powerTrait: 'ผู้ใหญ่อุปถัมภ์ ความสำเร็จทางการศึกษาและการงาน'
    },
    'ศุกร์': {
      deity: 'พระศุกร์',
      story: 'สร้างจากโค 21 ตัว ห่อด้วยผ้าสีฟ้าอ่อน เทพแห่งศิลปะ ความรัก สุนทรียภาพและความสุขสมหวัง',
      powerTrait: 'ความรัก ความสุขสำราญ และการเงินมั่งคั่ง'
    },
    'เสาร์': {
      deity: 'พระเสาร์',
      story: 'สร้างจากเสือ 10 ตัว ห่อด้วยผ้าสีดำ เทพแห่งความอดทน หนักแน่น มั่นคง ดั่งหินผา',
      powerTrait: 'ความอดทน ทรัพย์สินมรดก และความมั่นคงระยะยาว'
    }
  };
  return trivia[dayKey] || trivia['จันทร์'];
}

function generatePersonalColorOutfit(goal, luckyData, season, zodiac) {
  let targetColorGroup = '';
  let goalLabel = '';
  if (goal === 'work') {
    targetColorGroup = luckyData.workColors;
    goalLabel = 'เสริมการงาน / เจรจาสำเร็จ';
  } else if (goal === 'money') {
    targetColorGroup = luckyData.moneyColors;
    goalLabel = 'เสริมโชคลาภ / เงินทองพุ่ง';
  } else if (goal === 'love') {
    targetColorGroup = luckyData.loveColors;
    goalLabel = 'เสริมความรัก / เสน่ห์เมตตา';
  } else {
    targetColorGroup = 'ขาว, ครีม, ฟ้าอ่อน, เอิร์ธโทน';
    goalLabel = 'พักผ่อน / ผ่อนคลายจิตใจ';
  }

  // คำแนะนำการจับคู่ตาม Personal Color
  let seasonAdvice = '';
  let recommendedShade = '';
  if (season === 'Spring') {
    seasonAdvice = 'คุณเป็น Warm Tone สว่าง แนะนำเลือกเฉดสีที่ "สดใสและอบอุ่น" เช่น ส้มคอรัล เหลืองนวล หรือเขียวสดใส เพื่อขับผิวให้ออร่าพุ่ง';
    recommendedShade = 'โทนพาสเทลอุ่น / คอรัล / สดใสสว่าง';
  } else if (season === 'Autumn') {
    seasonAdvice = 'คุณเป็น Warm Tone เข้ม แนะนำเลือกเฉด "เอิร์ธโทนลึก" เช่น ส้มอิฐ เทอราคอตตา น้ำตาลช็อกโกแลต หรือเขียวขี้ม้า ดูภูมิฐานและหรูหรา';
    recommendedShade = 'โทนเอิร์ธโทน / มัสตาร์ด / ช็อกโกแลต';
  } else if (season === 'Summer') {
    seasonAdvice = 'คุณเป็น Cool Tone สว่าง แนะนำเลือกเฉดสีที่ "นุ่มนวลและละมุน" เช่น ม่วงลาเวนเดอร์ ฟ้าเบบี้บลู หรือชมพูพาสเทล จะช่วยให้หน้าสว่าง ไม่หมองคล้ำ';
    recommendedShade = 'โทนเย็นพาสเทล / เบบี้บลู / ลาเวนเดอร์';
  } else { // Winter
    seasonAdvice = 'คุณเป็น Cool Tone คมชัด แนะนำเลือกสีที่มี "คอนทราสต์ชัดเจน" เช่น น้ำเงินรอยัลบลู แดงเบอร์กันดี หรือดำสนิท ขับผิวหน้าให้ดูคมและมีพลัง';
    recommendedShade = 'โทนคอนทราสต์สูง / รอยัลบลู / คมชัด';
  }

  return {
    goalLabel: goalLabel,
    targetColors: targetColorGroup,
    season: season,
    seasonAdvice: seasonAdvice,
    recommendedShade: recommendedShade,
    suggestedOutfitTitle: `ลุคแนะนำประจำวันสำหรับชาว ${season}`,
    outfitDescription: `แมตช์เสื้อผ้าชิ้นหลักในกลุ่มสี ${targetColorGroup} เลือกรุ่นที่มีเฉด ${recommendedShade} จับคู่กับกางเกง/กระโปรงสีเบจหรือครีม เพื่อให้ลุคดูมินิมอล โมเดิร์น และคงความสุภาพ`
  };
}

function getRemediesForDay(dayKey, kalakiniColors) {
  return [
    {
      type: 'Hidden Shield (ซ่อนสัญลักษณ์มงคล)',
      title: 'เกราะป้องกันพลังงานซ่อนเร้น',
      desc: `หากจำเป็นต้องใส่เสื้อผ้า ${kalakiniColors} ให้สวมเสื้อซับใน ชุดชั้นใน หรือถุงเท้าสีมงคล (เช่น ขาว ครีม หรือสีเสริมเดช) ซ่อนไว้ด้านใน เพื่อดูดซับพลังงานบวกปกป้องตัวคุณ`
    },
    {
      type: 'Accessory Diversion (เบี่ยงเบนพลังงาน)',
      title: 'สร้างจุดรวมสายตาด้วยเครื่องประดับ',
      desc: 'นำผ้าพันคอ เนกไท เข็มขัด หรือเคสมือถือที่เป็นสีมงคลโดดเด่นมาใช้คู่กัน เพื่อดึงสายตาและกระจายคลื่นความถี่บวกกลบพลังงานลบ'
    },
    {
      type: 'Wu Xing Suppression (ปัญจธาตุพิชิต)',
      title: 'หลักฮวงจุ้ยธาตุข่ม',
      desc: 'ใช้หลักความสมดุลของธรรมชาติ หากสวมสีโทนร้อนให้ดับด้วยเครื่องประดับธาตุน้ำ (คราม/ดำ) หรือหากสวมสีโทนดินให้แซมด้วยธาตุไม้ (เขียว)'
    }
  ];
}

function getWalletAndGemsForDay(dayKey) {
  const map = {
    'อาทิตย์': { walletLucky: 'ดำ, ม่วง, น้ำตาลเข้ม', walletAvoid: 'น้ำเงิน, ฟ้า', gem: 'ทับทิม (Ruby)', gemProp: 'เสริมบารมี พลังอำนาจ และภาวะผู้นำ' },
    'จันทร์': { walletLucky: 'เหลืองเข้ม, ทอง', walletAvoid: 'ส้ม, แดง', gem: 'ไข่มุก (Pearl), มุกดาหาร', gemProp: 'เสริมเสน่ห์ ความรักใคร่เอ็นดู และโชคลาภ' },
    'อังคาร': { walletLucky: 'เทาเข้ม', walletAvoid: 'เหลืองอ่อน, ขาว', gem: 'แอเมทิสต์ (Amethyst)', gemProp: 'คุ้มครองแคล้วคลาด ป้องกันอุปสรรค' },
    'พุธ (กลางวัน)': { walletLucky: 'น้ำเงิน, คราม, ฟ้า', walletAvoid: 'ชมพู', gem: 'มรกต (Emerald)', gemProp: 'เสริมสติปัญญา เจรจาค้าขายคล่องตัว' },
    'พุธ (กลางคืน)': { walletLucky: 'ชมพู', walletAvoid: 'เหลืองเข้ม, ทอง', gem: 'โกเมนเขียว, ออบซิเดียน', gemProp: 'พลิกวิกฤตเป็นโอกาส ขจัดพลังงานลบ' },
    'พฤหัสบดี': { walletLucky: 'เหลืองอ่อน, ขาว, เทา', walletAvoid: 'ดำ, ม่วง', gem: 'บุษราคัม (Yellow Sapphire)', gemProp: 'เสริมปัญญา ผู้ใหญ่อุปถัมภ์ค้ำชู' },
    'ศุกร์': { walletLucky: 'เขียว', walletAvoid: 'ม่วง, ดำ', gem: 'ไพลิน (Blue Sapphire)', gemProp: 'เสริมความรัก สุขสำราญ และเงินทองไหลมาเทมา' },
    'เสาร์': { walletLucky: 'แดง', walletAvoid: 'เขียว', gem: 'นิลดำ (Onyx)', gemProp: 'เสริมความอดทน มั่งคั่ง บารมีหนักแน่นดั่งหินผา' }
  };
  return map[dayKey] || map['จันทร์'];
}

function getFallbackColorRules(dayKey) {
  const rules = {
    'อาทิตย์': {
      birthDay: 'อาทิตย์',
      workColors: 'ม่วงเปลือกมังคุด, ดำ, แดง', workHex: ['#4A154B', '#1A1A1A', '#D32F2F'],
      moneyColors: 'เขียวสด, เขียวอ่อน, เทา', moneyHex: ['#2E7D32', '#81C784', '#9E9E9E'],
      loveColors: 'ชมพู, ขาว, ครีม, เบจ', loveHex: ['#F48FB1', '#FFFFFF', '#FFFDD0', '#F5F5DC'],
      kalakiniColors: 'น้ำเงิน, ฟ้า, คราม', kalakiniHex: ['#1565C0', '#42A5F5', '#1A237E']
    },
    'จันทร์': {
      birthDay: 'จันทร์',
      workColors: 'ส้ม, น้ำตาล, ฟ้า, เทาเข้ม', workHex: ['#FF9800', '#795548', '#42A5F5', '#424242'],
      moneyColors: 'ดำ, ม่วง, เหลืองทอง', moneyHex: ['#1A1A1A', '#7B1FA2', '#FFD700'],
      loveColors: 'เขียว, ขาว, ครีม, น้ำเงิน', loveHex: ['#388E3C', '#FFFFFF', '#FFFDD0', '#1976D2'],
      kalakiniColors: 'แดงสด, แดงเพลิง', kalakiniHex: ['#D50000', '#FF1744']
    },
    'อังคาร': {
      birthDay: 'อังคาร',
      workColors: 'ม่วง, ชมพู, น้ำเงินเข้ม, แดง', workHex: ['#7B1FA2', '#F06292', '#0D47A1', '#D32F2F'],
      moneyColors: 'ส้ม, น้ำตาล, ทอง', moneyHex: ['#FF9800', '#6D4C41', '#FFD700'],
      loveColors: 'ชมพู, แดงสด, ดำ', loveHex: ['#EC407A', '#C62828', '#212121'],
      kalakiniColors: 'เหลือง, ขาว, เทาอ่อน', kalakiniHex: ['#FBC02D', '#FAFAFA', '#E0E0E0']
    },
    'พุธ (กลางวัน)': {
      birthDay: 'พุธ (กลางวัน)',
      workColors: 'น้ำเงิน, กรมท่า, ส้มแสด', workHex: ['#1976D2', '#1A237E', '#FF6D00'],
      moneyColors: 'ม่วง, เทาควันบุหรี่, ดำ', moneyHex: ['#8E24AA', '#757575', '#212121'],
      loveColors: 'ส้ม, น้ำตาล, ขาว, เหลือง', loveHex: ['#FB8C00', '#795548', '#FFFFFF', '#FDD835'],
      kalakiniColors: 'ชมพู, โอรส', kalakiniHex: ['#F48FB1', '#FFAB91']
    },
    'พุธ (กลางคืน)': {
      birthDay: 'พุธ (กลางคืน)',
      workColors: 'ดำ, เหลือง, ส้มแสด', workHex: ['#212121', '#FBC02D', '#FF6D00'],
      moneyColors: 'แดง, ชมพู', moneyHex: ['#D32F2F', '#F06292'],
      loveColors: 'เทา, ม่วงพาสเทล', loveHex: ['#757575', '#CE93D8'],
      kalakiniColors: 'เหลืองเข้ม, ทอง', kalakiniHex: ['#F57F17', '#FFD700']
    },
    'พฤหัสบดี': {
      birthDay: 'พฤหัสบดี',
      workColors: 'เหลือง, ขาว, เทา, มุก', workHex: ['#FBC02D', '#FFFFFF', '#9E9E9E', '#ECEFF1'],
      moneyColors: 'แดงเลือดหมู, ชมพู', moneyHex: ['#880E4F', '#F48FB1'],
      loveColors: 'ฟ้า, น้ำเงิน, เขียวทุกโทน', loveHex: ['#42A5F5', '#1565C0', '#2E7D32'],
      kalakiniColors: 'ม่วง, ดำ, น้ำตาลเข้ม', kalakiniHex: ['#6A1B9A', '#212121', '#3E2723']
    },
    'ศุกร์': {
      birthDay: 'ศุกร์',
      workColors: 'เขียวมิ้นต์, ม่วง, ส้ม', workHex: ['#80CBC4', '#7B1FA2', '#FF9800'],
      moneyColors: 'ชมพูพาสเทล, ฟ้า', moneyHex: ['#F8BBD0', '#64B5F6'],
      loveColors: 'เหลือง, ขาว, เทา, น้ำเงิน', loveHex: ['#FDD835', '#FFFFFF', '#9E9E9E', '#1565C0'],
      kalakiniColors: 'ดำ, เทาเข้ม, น้ำตาล', kalakiniHex: ['#212121', '#424242', '#5D4037']
    },
    'เสาร์': {
      birthDay: 'เสาร์',
      workColors: 'แดงเข้ม, ชมพู, ทับทิม', workHex: ['#B71C1C', '#F06292', '#C2185B'],
      moneyColors: 'น้ำเงิน, ฟ้าคราม', moneyHex: ['#1565C0', '#0288D1'],
      loveColors: 'ม่วง, ดำ, เทา', loveHex: ['#7B1FA2', '#212121', '#757575'],
      kalakiniColors: 'เขียวทุกเฉด', kalakiniHex: ['#2E7D32', '#4CAF50', '#81C784']
    }
  };
  return rules[dayKey] || rules['จันทร์'];
}

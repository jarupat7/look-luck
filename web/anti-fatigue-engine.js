/**
 * โชคดีทุกวัน (Look&Luck) - Anti-Fatigue 30-Day Engine
 * อัลกอริทึมแนะนำสีและสไตล์การแต่งกาย "ไม่ซ้ำซากจำเจตลอด 30 วัน"
 *
 * สมการหลัก:
 * Daily_Outfit_Recommendation =
 *   [Base_Color_from_Thaksa]
 *   + [Shade_Modifier(Lunar_Phase)]
 *   + [Item_Type_Modifier(Weather_API + Rotation_History)]
 *   + [Styling_Modifier(Micro_Intentions + Color_Proportion_Rule)]
 */

const AntiFatigueEngine = (function () {
  'use strict';

  // ----------------------------------------------------
  // 1. ฐานข้อมูลสเปกตรัมเฉดสีมหาศาล (Shade Spectrum Database)
  // ครอบคลุม 10-20 เฉดต่อกลุ่มสีหลัก พร้อมค่าความสว่าง (lightness) และโทน (light/deep/pastel/earth)
  // ----------------------------------------------------
  const COLOR_SHADE_SPECTRUM = {
    // 1.1 ส้ม / แสด / ทอง
    'ส้ม': [
      { name: 'ส้มพีชพาสเทล', hex: '#FFCBA4', type: 'light', tone: 'pastel' },
      { name: 'ส้มแอพริคอต', hex: '#FBCEB1', type: 'light', tone: 'pastel' },
      { name: 'ส้มสว่างสดใส', hex: '#FFA726', type: 'light', tone: 'bright' },
      { name: 'ส้มแทงเจอรีน', hex: '#FF9800', type: 'light', tone: 'bright' },
      { name: 'ส้มแมนดาริน', hex: '#F57C00', type: 'deep', tone: 'earth' },
      { name: 'ส้มอิฐเผา (Terracotta)', hex: '#D84315', type: 'deep', tone: 'earth' },
      { name: 'ส้มราสท์อบอุ่น (Rust)', hex: '#B7410E', type: 'deep', tone: 'earth' },
      { name: 'ส้มคาราเมลเข้ม', hex: '#AF4E24', type: 'deep', tone: 'earth' },
      { name: 'ทองประกายสว่าง', hex: '#FFD700', type: 'light', tone: 'bright' },
      { name: 'ทองแชมเปญหรูหรา', hex: '#F7E7CE', type: 'light', tone: 'pastel' },
      { name: 'ทองเหลืองรมดำ (Antique Gold)', hex: '#C5A059', type: 'deep', tone: 'earth' },
      { name: 'ส้มโอรสละมุน', hex: '#FFA07A', type: 'light', tone: 'pastel' }
    ],

    // 1.2 เขียว
    'เขียว': [
      { name: 'เขียวมิ้นต์อ่อน', hex: '#A8E6CF', type: 'light', tone: 'pastel' },
      { name: 'เขียวเซจมินิมอล (Sage)', hex: '#B2AC88', type: 'light', tone: 'pastel' },
      { name: 'เขียวพิสตาชิโอ', hex: '#93C572', type: 'light', tone: 'pastel' },
      { name: 'เขียวแอปเปิ้ลสดใส', hex: '#81C784', type: 'light', tone: 'bright' },
      { name: 'เขียวมรกตเจิดจรัส (Emerald)', hex: '#00A86B', type: 'light', tone: 'bright' },
      { name: 'เขียวใบตองธรรมชาติ', hex: '#4CAF50', type: 'light', tone: 'bright' },
      { name: 'เขียวโอลีฟคลาสสิก (Olive)', hex: '#556B2F', type: 'deep', tone: 'earth' },
      { name: 'เขียวมอสเอิร์ธโทน (Moss)', hex: '#4A5D4E', type: 'deep', tone: 'earth' },
      { name: 'เขียวฟอเรสต์ลึก (Forest)', hex: '#2E7D32', type: 'deep', tone: 'earth' },
      { name: 'เขียวเข้มป่าสน (Pine)', hex: '#1B5E20', type: 'deep', tone: 'earth' },
      { name: 'เขียวหยกโบราณ (Jade)', hex: '#00563B', type: 'deep', tone: 'earth' },
      { name: 'เขียวขี้ม้าเข้ม (Hunter)', hex: '#254117', type: 'deep', tone: 'earth' }
    ],

    // 1.3 ฟ้า / น้ำเงิน / คราม
    'ฟ้า': [
      { name: 'ฟ้าเบบี้บลู (Baby Blue)', hex: '#89CFF0', type: 'light', tone: 'pastel' },
      { name: 'ฟ้าพาสเทลเมฆหมอก', hex: '#B0E0E6', type: 'light', tone: 'pastel' },
      { name: 'ฟ้าเทอร์ควอยซ์สว่าง (Turquoise)', hex: '#40E0D0', type: 'light', tone: 'bright' },
      { name: 'ฟ้าสกายบลูสดใส', hex: '#42A5F5', type: 'light', tone: 'bright' },
      { name: 'ฟ้าโคบอลต์ทรงพลัง', hex: '#0047AB', type: 'deep', tone: 'earth' },
      { name: 'น้ำเงินรอยัลบลู (Royal Blue)', hex: '#1565C0', type: 'deep', tone: 'earth' },
      { name: 'น้ำเงินครามมิดไนท์', hex: '#1A237E', type: 'deep', tone: 'earth' },
      { name: 'น้ำเงินเนวีกรมท่า (Navy)', hex: '#0D1B2A', type: 'deep', tone: 'earth' },
      { name: 'น้ำเงินเดนิมลึก (Denim)', hex: '#2B4C7E', type: 'deep', tone: 'earth' },
      { name: 'ฟ้าหมอกซีรูเลียน (Cerulean)', hex: '#2A52BE', type: 'deep', tone: 'earth' },
      { name: 'ฟ้าไอซ์บลูหรูหรา', hex: '#E0F7FA', type: 'light', tone: 'pastel' }
    ],

    // 1.4 ชมพู / บานเย็น / โอรส
    'ชมพู': [
      { name: 'ชมพูบลัชอ่อนละมุน (Blush)', hex: '#FFD1DC', type: 'light', tone: 'pastel' },
      { name: 'ชมพูมิลค์กี้พาสเทล', hex: '#FFB6C1', type: 'light', tone: 'pastel' },
      { name: 'ชมพูเบบี้พิงก์', hex: '#F48FB1', type: 'light', tone: 'bright' },
      { name: 'ชมพูกุหลาบสดใส (Rose)', hex: '#E91E63', type: 'light', tone: 'bright' },
      { name: 'ชมพูคอรัลเปล่งปลั่ง (Coral)', hex: '#F08080', type: 'light', tone: 'bright' },
      { name: 'ชมพูดัสตี้โรส (Dusty Rose)', hex: '#DCAE96', type: 'deep', tone: 'earth' },
      { name: 'ชมพูโอล์ดโรสคลาสสิก', hex: '#C08081', type: 'deep', tone: 'earth' },
      { name: 'ชมพูราสเบอร์รีเข้ม', hex: '#C2185B', type: 'deep', tone: 'earth' },
      { name: 'ชมพูมาเจนตาหรูหรา', hex: '#9C27B0', type: 'deep', tone: 'earth' },
      { name: 'ชมพูมัสต์แอนทีก', hex: '#8E4A49', type: 'deep', tone: 'earth' }
    ],

    // 1.5 ม่วง
    'ม่วง': [
      { name: 'ม่วงลาเวนเดอร์นุ่มนวล', hex: '#E6E6FA', type: 'light', tone: 'pastel' },
      { name: 'ม่วงไลแลคพาสเทล (Lilac)', hex: '#C8A2C8', type: 'light', tone: 'pastel' },
      { name: 'ม่วงออร์คิดสดใส (Orchid)', hex: '#BA68C8', type: 'light', tone: 'bright' },
      { name: 'ม่วงแอเมทิสต์ (Amethyst)', hex: '#9966CC', type: 'light', tone: 'bright' },
      { name: 'ม่วงเปลือกมังคุดโมเดิร์น', hex: '#4A154B', type: 'deep', tone: 'earth' },
      { name: 'ม่วงไวโอเล็ตเข้ม (Violet)', hex: '#7B1FA2', type: 'deep', tone: 'earth' },
      { name: 'ม่วงพลัมลึกหรู (Plum)', hex: '#4B0082', type: 'deep', tone: 'earth' },
      { name: 'ม่วงแบล็กเบอร์รี', hex: '#311432', type: 'deep', tone: 'earth' }
    ],

    // 1.6 เหลือง / ขาว / ครีม
    'เหลือง': [
      { name: 'เหลืองวนิลาอ่อนนวล', hex: '#FDFD96', type: 'light', tone: 'pastel' },
      { name: 'เหลืองพาสเทลบัตเตอร์', hex: '#FFF59D', type: 'light', tone: 'pastel' },
      { name: 'เหลืองเลมอนสดชื่น', hex: '#FFF44F', type: 'light', tone: 'bright' },
      { name: 'เหลืองทองดอกคูณ', hex: '#FDD835', type: 'light', tone: 'bright' },
      { name: 'เหลืองมัสตาร์ดโมเดิร์น (Mustard)', hex: '#E1AD01', type: 'deep', tone: 'earth' },
      { name: 'เหลืองอำพันอบอุ่น (Amber)', hex: '#FFBF00', type: 'deep', tone: 'earth' },
      { name: 'เหลืองโอเคอร์โบราณ (Ochre)', hex: '#CC7722', type: 'deep', tone: 'earth' },
      { name: 'ขาวไข่มุกบริสุทธิ์ (Pearl)', hex: '#FAFAFA', type: 'light', tone: 'pastel' },
      { name: 'ครีมไอวอรีธรรมชาติ (Ivory)', hex: '#FFFFF0', type: 'light', tone: 'pastel' },
      { name: 'ครีมเบจนุ่มนวล (Beige)', hex: '#F5F5DC', type: 'light', tone: 'earth' }
    ],

    // 1.7 เทา / ดำ
    'เทา': [
      { name: 'เทาเงินควันบุหรี่ (Silver Grey)', hex: '#E0E0E0', type: 'light', tone: 'pastel' },
      { name: 'เทาแพลตทินัมอ่อน', hex: '#CFD8DC', type: 'light', tone: 'pastel' },
      { name: 'เทาโดฟคลาสสิก (Dove)', hex: '#9E9E9E', type: 'light', tone: 'bright' },
      { name: 'เทาสเลทโมเดิร์น (Slate Grey)', hex: '#708090', type: 'deep', tone: 'earth' },
      { name: 'เทาชาร์โคลลึก (Charcoal)', hex: '#424242', type: 'deep', tone: 'earth' },
      { name: 'เทาดำกราไฟต์ (Graphite)', hex: '#2E3440', type: 'deep', tone: 'earth' },
      { name: 'ดำสนิทออบซิเดียน (Jet Black)', hex: '#1A1A1A', type: 'deep', tone: 'earth' },
      { name: 'ดำนิลกาฬหรูหรา', hex: '#111111', type: 'deep', tone: 'earth' }
    ],

    // 1.8 แดง (ใช้เฉพาะวันที่มงคล)
    'แดง': [
      { name: 'แดงแตงโมสดใส', hex: '#FC6C85', type: 'light', tone: 'bright' },
      { name: 'แดงทับทิมสว่าง (Ruby)', hex: '#E0115F', type: 'light', tone: 'bright' },
      { name: 'แดงสการ์เล็ตเจิดจ้า', hex: '#FF2400', type: 'light', tone: 'bright' },
      { name: 'แดงคริมสันภูมิฐาน (Crimson)', hex: '#DC143C', type: 'deep', tone: 'earth' },
      { name: 'แดงเบอร์กันดีลึก (Burgundy)', hex: '#800020', type: 'deep', tone: 'earth' },
      { name: 'แดงไวน์การ์เนต (Wine)', hex: '#722F37', type: 'deep', tone: 'earth' },
      { name: 'แดงมารูนสุขุม (Maroon)', hex: '#58111A', type: 'deep', tone: 'earth' }
    ]
  };

  // ----------------------------------------------------
  // 2. ปฏิทินจันทรคติ & การคำนวณข้างขึ้น-ข้างแรม (Lunar Phase)
  // ----------------------------------------------------
  // รอบจันทรคติเฉลี่ย = 29.53058867 วัน
  // หมุดอ้างอิง: New Moon ที่แม่นยำ วันที่ 11 มกราคม 2024 เวลา 11:57 UTC
  const KNOWN_NEW_MOON = new Date('2024-01-11T11:57:00Z').getTime();
  const SYNODIC_MONTH = 29.53058867 * 86400000;

  function calculateLunarInfo(dateObj) {
    const targetTime = dateObj ? new Date(dateObj).getTime() : Date.now();
    const diff = targetTime - KNOWN_NEW_MOON;
    const phaseRatio = ((diff % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH;
    const lunarDay = Math.floor(phaseRatio * 30); // 0 ถึง 29

    // ข้างขึ้น (0 - 14): Waxing (สว่าง สดใส พาสเทล)
    // ข้างแรม (15 - 29): Waning (เข้ม หม่น เอิร์ธโทน)
    const isWaxing = phaseRatio < 0.5;
    const dayInPhase = isWaxing ? (lunarDay + 1) : (lunarDay - 14);

    return {
      phaseRatio,
      lunarDay,
      isWaxing,
      phaseName: isWaxing ? `ขึ้น ${dayInPhase} ค่ำ` : `แรม ${dayInPhase} ค่ำ`,
      toneRecommendation: isWaxing ? 'light' : 'deep',
      toneText: isWaxing ? 'ข้างขึ้น: โทนสว่าง สดใส นวลตา (Light & Pastel)' : 'ข้างแรม: โทนเข้ม สุขุม เอิร์ธโทน (Dark & Deep)',
      icon: isWaxing ? '🌓' : '🌘'
    };
  }

  // ----------------------------------------------------
  // 3. กาลโยคประจำวัน 2569 (Kaal-Yoke Astrological Status)
  // วันธงชัย, วันอธิบดี, วันอุบาทว์, วันโลกาวินาศ, วันปรกติ
  // ----------------------------------------------------
  function calculateKaalYoke(dateObj) {
    const target = dateObj ? new Date(dateObj) : new Date();
    const dayOfWeek = target.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์

    // สำหรับปีจุลศักราชปัจจุบัน/พ.ศ. 2569:
    // ธงชัย = วันพุธ (3)
    // อธิบดี = วันอังคาร (2)
    // อุบาทว์ = วันพฤหัสบดี (4)
    // โลกาวินาศ = วันอาทิตย์ (0)
    if (dayOfWeek === 3) {
      return {
        type: 'thongchai',
        title: 'วันธงชัย (ดิถีมงคลสูงสุด)',
        badge: '🏆 วันธงชัย',
        stylingMode: 'monochrome_solid',
        desc: 'แต่งกายโทนสีมงคลเดี่ยวสดใสทั้งชุด (Monochrome / Solid Color) แสดงความมั่นใจและชัยชนะ',
        shieldNote: null
      };
    } else if (dayOfWeek === 2) {
      return {
        type: 'athibodi',
        title: 'วันอธิบดี (เกียรติยศ ผู้นำ)',
        badge: '👑 วันอธิบดี',
        stylingMode: 'smart_solid',
        desc: 'แต่งกายสีมงคลคมชัด โครงสร้างเสื้อผ้าภูมิฐาน เสริมบารมีอำนาจและการเป็นผู้นำ',
        shieldNote: null
      };
    } else if (dayOfWeek === 4) {
      return {
        type: 'ubaat',
        title: 'วันอุบาทว์ (วันมีอุปสรรค)',
        badge: '⚡ วันอุบาทว์ (แก้เคล็ด)',
        stylingMode: 'hidden_shield',
        desc: 'แนะนำใส่สีมงคลเป็นสีซับใน (Hidden Shield) หรือชิ้นเล็กๆ เพื่อแก้เคล็ดอย่างแนบเนียน ปัดเป่าความติดขัด',
        shieldNote: 'ซับใน / เครื่องประดับซ่อน'
      };
    } else if (dayOfWeek === 0) {
      return {
        type: 'lokawinat',
        title: 'วันโลกาวินาศ (วันระวังความขัดแย้ง)',
        badge: '🛡️ วันโลกาวินาศ (เกราะป้องกัน)',
        stylingMode: 'hidden_shield',
        desc: 'เน้นสีเสื้อหลักโทนกลางสุภาพ (เบจ/ครีม/เทา) แล้วแทรกสีมงคลแก้เคล็ดที่นาฬิกา ผ้าพันคอ หรือถุงเท้า',
        shieldNote: 'เกราะเสริมชิ้นรอง'
      };
    }

    return {
      type: 'normal',
      title: 'วันมงคลปรกติ',
      badge: '✨ วันดีทั่วไป',
      stylingMode: 'proportional',
      desc: 'แต่งกายตามสัดส่วนความสมดุล 60-30-10 เสริมเสน่ห์และโชคลาภอย่างลงตัว',
      shieldNote: null
    };
  }

  // ----------------------------------------------------
  // 4. เลขศาสตร์ประจำวัน (Daily Numerology Secondary Color)
  // ตัวอย่าง: วันที่ 12 -> 1+2 = 3 (ดาวอังคาร สีชมพู/โอรส)
  // ----------------------------------------------------
  const NUMEROLOGY_PLANET_COLORS = {
    1: { planet: 'อาทิตย์', color: 'ส้มอมแดง / ทอง', hex: '#FF6D00', tip: 'เสริมความโดดเด่นและพลังความเป็นผู้นำ' },
    2: { planet: 'จันทร์', color: 'ขาวมุก / ครีม / เงิน', hex: '#FFFDD0', tip: 'เสริมเมตตาและความประนีประนอม' },
    3: { planet: 'อังคาร', color: 'ชมพู / โรสโกลด์', hex: '#F06292', tip: 'เสริมความกระตือรือร้นและพลังขับเคลื่อน' },
    4: { planet: 'พุธ', color: 'เขียวมรกต / มิ้นต์', hex: '#4CAF50', tip: 'เสริมไหวพริบการเจรจาและการสื่อสาร' },
    5: { planet: 'พฤหัสบดี', color: 'ส้มแสด / เหลืองมัสตาร์ด', hex: '#FFA000', tip: 'เสริมปัญญาและความน่าเชื่อถือทางวิชาการ' },
    6: { planet: 'ศุกร์', color: 'ฟ้าสว่าง / เทอร์ควอยซ์', hex: '#42A5F5', tip: 'เสริมเสน่ห์ ศิลปะ และความรื่นรมย์' },
    7: { planet: 'เสาร์', color: 'เทาสเลท / ดำกราไฟต์', hex: '#616161', tip: 'เสริมความสุขุม รอบคอบ และหนักแน่น' },
    8: { planet: 'ราหู', color: 'ทองแดง / น้ำตาลคาราเมล', hex: '#8D6E63', tip: 'เสริมไหวพริบทันคน พลิกโอกาส' },
    9: { planet: 'เกตุ', color: 'ม่วงออร์คิด / เมทัลลิก', hex: '#9C27B0', tip: 'เสริมจิตสัมผัส สิ่งศักดิ์สิทธิ์คุ้มครอง' }
  };

  function calculateDailyNumerology(dateObj) {
    const target = dateObj ? new Date(dateObj) : new Date();
    const dayNum = target.getDate(); // 1 - 31

    let sum = dayNum;
    while (sum > 9) {
      sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    const matched = NUMEROLOGY_PLANET_COLORS[sum] || NUMEROLOGY_PLANET_COLORS[1];

    return {
      dayNum,
      singleDigit: sum,
      secondaryColor: matched.color,
      secondaryHex: matched.hex,
      planet: matched.planet,
      stylingTip: matched.tip
    };
  }

  // ----------------------------------------------------
  // 5. สภาพอากาศจำลองและเชื่อมโยง API (Weather Context)
  // ----------------------------------------------------
  const WEATHER_MODIFIERS = {
    sunny: {
      type: 'sunny',
      label: 'แดดจัด / อากาศร้อน (32-36°C)',
      icon: '☀️',
      clothingType: 'ผ้าลินินเนื้อโปร่ง / ผ้าคอตตอนบางระบายอากาศได้ดี',
      toneSuggestion: 'แนะนำโทนสีอ่อนเพื่อลดการดูดซับความร้อน ให้ความรู้สึกเย็นสบาย',
      itemBonus: 'แว่นกันแดดทรงชิค หรือหมวกปีกกว้าง'
    },
    rainy: {
      type: 'rainy',
      label: 'ฝนตก / ความชื้นสูง (27°C)',
      icon: '🌧️',
      clothingType: 'เนื้อผ้าแห้งไว (Quick-Dry) หรือเสื้อคลุมกันละอองน้ำ',
      toneSuggestion: 'แนะนำเฉดสีเข้มขึ้นเล็กน้อยเพื่อพรางรอยละอองน้ำ และรองเท้ากันลื่น',
      itemBonus: 'ร่มพับสีมงคล หรือกระเป๋าหนังกันน้ำ'
    },
    cool: {
      type: 'cool',
      label: 'ห้องแอร์เย็น / ลมพัดสบาย (22-25°C)',
      icon: '❄️',
      clothingType: 'เสื้อคลุมเบลเซอร์ / คาร์ดิแกนผ้านุ่ม หรือแจ็กเก็ตสวมทับ',
      toneSuggestion: 'เล่นเลเยอร์ 2 ชั้น สวมเสื้อคลุมสีมงคลทับเสื้อตัวใน',
      itemBonus: 'ผ้าพันคอซิลค์เนื้อเนียน หรือแจ็กเก็ตตัวเก่ง'
    }
  };

  function detectWeatherContext(dateObj) {
    const target = dateObj ? new Date(dateObj) : new Date();
    const day = target.getDate();
    // จำลองสภาพอากาศสลับกันตามฤดูกาลไทย: กลางวันแดดจัด / บ่ายฝน / ทำงานออฟฟิศห้องแอร์
    if (day % 3 === 0) return WEATHER_MODIFIERS.rainy;
    if (day % 3 === 1) return WEATHER_MODIFIERS.sunny;
    return WEATHER_MODIFIERS.cool;
  }

  // ----------------------------------------------------
  // 6. เป้าหมายย่อยรายวัน (Micro-Intentions)
  // ----------------------------------------------------
  const MICRO_INTENTIONS = {
    present_boss: {
      id: 'present_boss',
      label: 'พรีเซนต์งานเจ้านาย / ลูกค้าใหญ่',
      icon: '📊',
      vibe: 'Formal & Power (เน้นสีเดช + เสื้อผ้าทรงคมชัด)',
      topAdvice: 'เสื้อเชิ้ตคัตติ้งเนี้ยบ หรือเบลเซอร์สูทกระดุมคู่',
      accAdvice: 'นาฬิกาโลหะสีทอง/เงินเรียบหรู ปากกาหรือแฟ้มเอกสารหนัง'
    },
    collect_debt: {
      id: 'collect_debt',
      label: 'ทวงหนี้ / เจรจาปิดดีลการเงิน',
      icon: '🤝',
      vibe: 'Smart & Assertive (สีเดชผสมสีมูละ)',
      topAdvice: 'เสื้อเชิ้ตโทนสุภาพ เสริมความน่าเชื่อถือไม่ก้าวร้าว',
      accAdvice: 'กระเป๋าหนังทรงแข็ง กระเป๋าสตางค์โทนเหนี่ยวทรัพย์'
    },
    romantic_date: {
      id: 'romantic_date',
      label: 'ออกเดตหวาน / ดินเนอร์กระชับรัก',
      icon: '🌹',
      vibe: 'Charming & Soft (เน้นสีมนตรี + ผ้าทิ้งตัว)',
      topAdvice: 'เสื้อคอวีผ้าซาติน หรือเดรส/เสื้อเชิ้ตคอจีนเนื้อละมุน',
      accAdvice: 'สร้อยคอประกายวิบวับ น้ำหอมกลิ่นดอกไม้หวานละมุน'
    },
    team_meeting: {
      id: 'team_meeting',
      label: 'ประชุมระดมสมอง / ประสานงานทีม',
      icon: '💡',
      vibe: 'Collaborative & Approachable (สีมนตรีผสมสีศรี)',
      topAdvice: 'เสื้อโปโลพรีเมียม หรือคาร์ดิแกนโทนเป็นมิตร',
      accAdvice: 'สร้อยข้อมือหินมงคล หรือสมุดโน้ตดีไซน์มินิมอล'
    },
    chill_cafe: {
      id: 'chill_cafe',
      label: 'แวะคาเฟ่ / ถ่ายรูปทำคอนเทนต์',
      icon: '☕',
      vibe: 'Relaxed & Aesthetic (เน้นสีตัดกันอย่างมีศิลปะ)',
      topAdvice: 'เสื้อโอเวอร์ไซส์ผ้าคอตตอน หรือเสื้อลินินโปร่งสบาย',
      accAdvice: 'แว่นตากันแดดวินเทจ หมวกบักเก็ต หรือกระเป๋าผ้าแคนวาส'
    }
  };

  // ----------------------------------------------------
  // 7. กฎสัดส่วนสี 60-30-10 & ระบบหมุนเวียน 4 สัปดาห์ (Rotation & Proportion)
  // สัปดาห์ที่ 1: สีมงคล 60% (เสื้อหลัก) + สีกลาง 30% + สีเน้น 10%
  // สัปดาห์ที่ 2: สีกลาง 60% (ชุดหลัก) + สีมงคล 30% (กางเกง/กระโปรง/เสื้อคลุม) + สีเน้น 10%
  // สัปดาห์ที่ 3: สีกลาง 80% + สีมงคล 20% (กระเป๋า, ผ้าพันคอ, รองเท้า)
  // สัปดาห์ที่ 4: ลายพิมพ์/เลเยอร์ทูโทน (สีมงคลผสมคู่สีเกื้อหนุน)
  // ----------------------------------------------------
  function calculateColorProportion(dayOfMonth) {
    const d = dayOfMonth || 1;
    const weekIndex = Math.floor((d - 1) / 7) % 4; // 0, 1, 2, 3

    if (weekIndex === 0) {
      return {
        week: 1,
        focusItem: 'top',
        focusName: 'ชิ้นบน (เสื้อหลัก 60%)',
        proportionText: 'สีมงคล 60% (เสื้อ) + โทนกลาง 30% (กางเกง) + สีเน้น 10% (เครื่องประดับ)',
        ruleTitle: 'Dominant Color (มงคลเด่นชัดชิ้นบน)'
      };
    } else if (weekIndex === 1) {
      return {
        week: 2,
        focusItem: 'bottom_layer',
        focusName: 'ชิ้นล่างหรือเสื้อคลุม (30%)',
        proportionText: 'โทนกลาง 60% (เสื้อตัวใน) + สีมงคล 30% (กางเกง/กระโปรง/เบลเซอร์) + สีเน้น 10%',
        ruleTitle: 'Subtle Power (มงคลเสริมชิ้นล่าง/เสื้อคลุม)'
      };
    } else if (weekIndex === 2) {
      return {
        week: 3,
        focusItem: 'accessory',
        focusName: 'กระเป๋า / ผ้าพันคอ / รองเท้า (10-20%)',
        proportionText: 'โทนกลางสุภาพ 85% (ชุดหลัก) + สีมงคล 15% (กระเป๋า, เครื่องประดับ, รองเท้า)',
        ruleTitle: 'Accent Charm (มงคลเฉพาะจุดเสริมพลัง)'
      };
    } else {
      return {
        week: 4,
        focusItem: 'layer_mix',
        focusName: 'มิกซ์แอนด์แมตช์ 2 โทน (Two-Tone Harmony)',
        proportionText: 'สีมงคลหลัก 50% + สีเลขศาสตร์รอง 30% + สีกลาง 20%',
        ruleTitle: 'Harmonic Mix (สลับคู่สีมงคล 2 โทน)'
      };
    }
  }

  // ----------------------------------------------------
  // 8. แกนสุ่มเฉดสีอัจฉริยะ (Smart Shade Resolver)
  // จับคู่ชื่อสีหลักจากมหาทักษา -> สเปกตรัมเฉดสีตามข้างขึ้น/ข้างแรม และ Personal Color
  // ----------------------------------------------------
  function resolveShadeVariations(baseColorNames, lunarInfo, personalSeason, daySeed) {
    const seed = (daySeed || 1);
    const results = [];

    // แตกคำสีหลัก เช่น "ส้ม, ครีม"
    const parsedColors = baseColorNames.split(',').map(s => s.trim());

    parsedColors.forEach((colorWord, cIdx) => {
      let matchedGroup = null;
      for (const [groupKey, list] of Object.entries(COLOR_SHADE_SPECTRUM)) {
        if (colorWord.includes(groupKey) || groupKey.includes(colorWord)) {
          matchedGroup = list;
          break;
        }
      }

      if (!matchedGroup) {
        // Fallback หาเฉดใกล้เคียง
        matchedGroup = COLOR_SHADE_SPECTRUM['เหลือง'];
      }

      // กรองตามข้างขึ้นข้างแรม (Waxing = light/pastel, Waning = deep/earth)
      let filtered = matchedGroup.filter(item => {
        if (lunarInfo.isWaxing) {
          return item.type === 'light' || item.tone === 'pastel' || item.tone === 'bright';
        } else {
          return item.type === 'deep' || item.tone === 'earth';
        }
      });

      if (filtered.length === 0) {
        filtered = matchedGroup;
      }

      // เลือกเฉดโดยใช้ Index สัมพันธ์กับวันที่ในเดือน ป้องกันไม่ให้ซ้ำกัน
      const pickIndex = (seed + cIdx * 3) % filtered.length;
      results.push(filtered[pickIndex]);
    });

    return results;
  }

  // ----------------------------------------------------
  // 9. ฟังก์ชันหลัก: คำนวณชุดที่ไม่ซ้ำกันตลอด 30 วัน
  // (Full 30-Day Anti-Fatigue Outfit Generator)
  // ----------------------------------------------------
  function generateAntiFatigueOutfit(dateObj, baseEvaluation, userProfile, options = {}) {
    const targetDate = dateObj ? new Date(dateObj) : new Date();
    const dayOfMonth = targetDate.getDate(); // 1 - 31
    const gender = (userProfile && userProfile.gender) || 'female';
    const season = (userProfile && userProfile.personalColor) || 'Spring';

    // 1. ตัวแปรโหราศาสตร์
    const lunar = calculateLunarInfo(targetDate);
    const kaalYoke = calculateKaalYoke(targetDate);
    const numerology = calculateDailyNumerology(targetDate);

    // 2. ตัวแปรบริบท
    const weather = detectWeatherContext(targetDate);
    const microId = options.microIntention || 'present_boss';
    const micro = MICRO_INTENTIONS[microId] || MICRO_INTENTIONS['present_boss'];

    // 3. กฎสัดส่วนสีและการสลับชิ้น
    const proportion = calculateColorProportion(dayOfMonth);

    // 4. สกัดเฉดสีมงคลเฉพาะวันที่ (Dynamic Shades)
    const activeColorStr = baseEvaluation.activeCat.safeName;
    const resolvedShades = resolveShadeVariations(activeColorStr, lunar, season, dayOfMonth);

    const primaryShade = resolvedShades[0] || { name: 'ส้มสว่าง', hex: '#FF9800' };
    const secondaryShade = resolvedShades[1] || { name: numerology.secondaryColor, hex: numerology.secondaryHex };

    // 5. ปรุงแต่งคำแนะนำการแต่งกายตามสัดส่วน (Item Styling)
    let topPiece = '';
    let bottomPiece = '';
    let accessoryPiece = '';
    let stylingTechnique = '';

    const bottomType = options.bottomStyle || 'pants';
    const bottomLabel = (gender === 'male') ? 'กางเกงสแล็คชิโน่' : (bottomType === 'skirt' ? 'กระโปรงทรงเอ' : 'กางเกงสแล็คขาเต่อ');

    if (kaalYoke.stylingMode === 'hidden_shield') {
      // วันอุบาทว์ / โลกาวินาศ -> ใส่สีมงคลเป็นซับในหรือชิ้นรอง
      topPiece = `เสื้อเชิ้ต/เบลเซอร์โทนกลางสุภาพ (ครีม/เทาอ่อน)`;
      bottomPiece = `${bottomLabel}โทนกลางเรียบหรู`;
      accessoryPiece = `ซ่อนพลังด้วยเสื้อซับในสี${primaryShade.name} หรือผ้าเช็ดหน้า/ถุงเท้าสี${primaryShade.name}`;
      stylingTechnique = `🛡️ สไตล์ Hidden Shield (แก้เคล็ดวัน${kaalYoke.title}): ใส่สีมงคลซ่อนด้านในหรือชิ้นเล็ก เพื่อเสริมดวงแบบแนบเนียน ไร้อุปสรรค`;
    } else if (kaalYoke.stylingMode === 'monochrome_solid') {
      // วันธงชัย -> โมโนโครมสดใสทั้งชุด
      topPiece = `เสื้อเชิ้ต/สูทสี${primaryShade.name} (${primaryShade.hex})`;
      bottomPiece = `${bottomLabel}สี${primaryShade.name} คุมโทนทั้งชุด (Monochrome)`;
      accessoryPiece = `เข็มกลัดหรือนาฬิกาโลหะสีทองเปล่งประกาย + รองเท้าหนัง`;
      stylingTechnique = `🏆 สไตล์ Total Monochrome (พลังวันธงชัย): คุมโทนสีมงคลเดียวทั้งชุด เพิ่มความมั่นใจสูงสุดและดึงดูดชัยชนะ`;
    } else {
      // สลับตามสัดส่วนสัปดาห์
      if (proportion.focusItem === 'top') {
        topPiece = `เสื้อสี${primaryShade.name} (${primaryShade.hex}) โดดเด่น 60%`;
        bottomPiece = `${bottomLabel}สีเบจ/ครีมธรรมชาติ (30%)`;
        accessoryPiece = `เครื่องประดับโทนสีรอง ${numerology.secondaryColor} (10%)`;
        stylingTechnique = `✨ สัดส่วน 60-30-10: ชิ้นบนเป็นสีมงคลหลัก ขับออร่าผิว${season} จับคู่ท่อนล่างสีเอิร์ธโทนสบายตา`;
      } else if (proportion.focusItem === 'bottom_layer') {
        topPiece = `เสื้อตัวในโทนขาวมุก/ไอวอรีสบายตา (60%)`;
        bottomPiece = `${bottomLabel}สี${primaryShade.name} (${primaryShade.hex}) หรือเบลเซอร์สี${primaryShade.name} สวมทับ (30%)`;
        accessoryPiece = `เข็มขัดหรือกระเป๋าคุมโทนสี${secondaryShade.name} (10%)`;
        stylingTechnique = `👖 สไตล์ Subtle Elegance: พักเสื้อสีสด ย้ายพลังสีมงคลไปอยู่ที่ชิ้นล่างหรือเสื้อคลุมทับ ไม่จำเจ`;
      } else if (proportion.focusItem === 'accessory') {
        topPiece = `เสื้อเชิ้ตหรือเดรสสีโมเดิร์นคลาสสิก (เทาอ่อน/ขาว)`;
        bottomPiece = `${bottomLabel}โทนคลาสสิกรับกับเสื้อ`;
        accessoryPiece = `กระเป๋าถือสี${primaryShade.name} หรือผ้าพันคอซิลค์สี${primaryShade.name} (15%)`;
        stylingTechnique = `👜 สไตล์ Accent Pop: เสื้อผ้าเน้นความเรียบหรู แล้วขับจุดเด่นด้วยกระเป๋า/รองเท้าสีมงคล`;
      } else {
        topPiece = `เสื้อสี${primaryShade.name} สวมทับด้วยคาร์ดิแกนสี${numerology.secondaryColor}`;
        bottomPiece = `${bottomLabel}สีเบจมินิมอล`;
        accessoryPiece = `เครื่องประดับสองกษัตริย์ (ทองผสมเงิน) และนาฬิกาเรือนโปรด`;
        stylingTechnique = `🎨 สไตล์ Two-Tone Harmonic: ผสานสีมงคลหลักกับสีดาวเลขศาสตร์ประจำวัน (${numerology.secondaryColor}) สร้างมิติแฟชั่นน่าหลงใหล`;
      }
    }

    return {
      date: targetDate,
      dayOfMonth,
      lunar,
      kaalYoke,
      numerology,
      weather,
      micro,
      proportion,
      primaryShade,
      secondaryShade,
      topPiece,
      bottomPiece,
      accessoryPiece,
      stylingTechnique,
      uniqueHash: `DAY_${dayOfMonth}_${lunar.isWaxing ? 'WAX' : 'WAN'}_${kaalYoke.type}`
    };
  }

  return {
    COLOR_SHADE_SPECTRUM,
    MICRO_INTENTIONS,
    calculateLunarInfo,
    calculateKaalYoke,
    calculateDailyNumerology,
    detectWeatherContext,
    calculateColorProportion,
    resolveShadeVariations,
    generateAntiFatigueOutfit
  };
})();

// Export globally for browser & module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AntiFatigueEngine;
}

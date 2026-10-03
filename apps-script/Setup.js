/**
 * โชคดีทุกวัน (Everyday Lucky) - Database Setup & Seeding Script
 * รันฟังก์ชัน setupDatabase() เพื่อสร้างชีตและข้อมูลตั้งต้นทั้งหมดอัตโนมัติ
 */

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. ตาราง Users
  createSheetIfNotExists(ss, 'Users', [
    'user_id', 'email', 'password_hash', 'salt', 'display_name',
    'birth_day', 'birth_date', 'zodiac', 'personal_color_season',
    'plan', 'plan_expire_at', 'pdpa_consent', 'created_at', 'last_login'
  ]);

  // 2. ตาราง Sessions
  createSheetIfNotExists(ss, 'Sessions', [
    'token', 'user_id', 'created_at', 'expire_at'
  ]);

  // 3. ตาราง ColorRules (ตารางสีมงคลประจำวันเกิด 8 วัน)
  const colorSheet = createSheetIfNotExists(ss, 'ColorRules', [
    'birth_day', 'work_colors', 'work_hex', 'money_colors', 'money_hex',
    'love_colors', 'love_hex', 'kalakini_colors', 'kalakini_hex'
  ]);
  seedColorRules(colorSheet);

  // 4. ตาราง ZodiacColors (สีมงคลตามลัคนาราศี ปี 2569)
  const zodiacSheet = createSheetIfNotExists(ss, 'ZodiacColors', [
    'element', 'zodiacs', 'lucky_colors', 'colors_hex', 'energy_description'
  ]);
  seedZodiacColors(zodiacSheet);

  // 5. ตาราง Remedies (ข้อมูลกลยุทธ์แก้เคล็ดสีกาลกิณี)
  const remediesSheet = createSheetIfNotExists(ss, 'Remedies', [
    'rule_id', 'kalakini_color', 'element', 'suppressing_element',
    'counter_colors', 'counter_hex', 'strategy_type', 'advice_text'
  ]);
  seedRemedies(remediesSheet);

  // 6. ตาราง WalletsAndGems (กระเป๋าสตางค์และอัญมณีเรียกทรัพย์)
  const wgSheet = createSheetIfNotExists(ss, 'WalletsAndGems', [
    'birth_day', 'wallet_lucky_colors', 'wallet_avoid_colors', 'lucky_gemstones', 'gemstone_properties'
  ]);
  seedWalletsAndGems(wgSheet);

  // 7. ตาราง Payments (เตรียมรองรับระบบสมาชิกชำระเงินในอนาคต)
  createSheetIfNotExists(ss, 'Payments', [
    'payment_id', 'user_id', 'plan', 'amount', 'currency',
    'provider', 'provider_ref', 'status', 'created_at', 'paid_at'
  ]);

  // 8. ตาราง Logs
  createSheetIfNotExists(ss, 'Logs', [
    'log_id', 'user_id', 'action', 'details', 'timestamp'
  ]);

  Logger.log('✅ ตั้งค่าฐานข้อมูลและใส่ข้อมูลเริ่มต้นเรียบร้อยแล้ว!');
}

function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#F5EBE1');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function seedColorRules(sheet) {
  if (sheet.getLastRow() > 1) return; // มีข้อมูลแล้ว ไม่ใส่ซ้ำ
  
  const rules = [
    [
      'อาทิตย์',
      'ม่วงเปลือกมังคุด, ดำ, แดง', '#4A154B,#1A1A1A,#D32F2F',
      'เขียวสด, เขียวอ่อน, เทา', '#2E7D32,#81C784,#9E9E9E',
      'ชมพู, ขาว, ครีม, เบจ', '#F48FB1,#FFFFFF,#FFFDD0,#F5F5DC',
      'น้ำเงิน, ฟ้า, คราม', '#1565C0,#42A5F5,#1A237E'
    ],
    [
      'จันทร์',
      'ส้ม, น้ำตาล, ฟ้า, เทาเข้ม', '#FF9800,#795548,#42A5F5,#424242',
      'ดำ, ม่วง, เหลืองทอง', '#1A1A1A,#7B1FA2,#FFD700',
      'เขียว, ขาว, ครีม, น้ำเงิน', '#388E3C,#FFFFFF,#FFFDD0,#1976D2',
      'แดงสด, แดงเพลิง', '#D50000,#FF1744'
    ],
    [
      'อังคาร',
      'ม่วง, ชมพู, น้ำเงินเข้ม, แดง', '#7B1FA2,#F06292,#0D47A1,#D32F2F',
      'ส้ม, น้ำตาล, ทอง', '#FF9800,#6D4C41,#FFD700',
      'ชมพู, แดงสด, ดำ', '#EC407A,#C62828,#212121',
      'เหลือง, ขาว, เทาอ่อน', '#FBC02D,#FAFAFA,#E0E0E0'
    ],
    [
      'พุธ (กลางวัน)',
      'น้ำเงิน, กรมท่า, ส้มแสด', '#1976D2,#1A237E,#FF6D00',
      'ม่วง, เทาควันบุหรี่, ดำ', '#8E24AA,#757575,#212121',
      'ส้ม, น้ำตาล, ขาว, เหลือง', '#FB8C00,#795548,#FFFFFF,#FDD835',
      'ชมพู, โอรส', '#F48FB1,#FFAB91'
    ],
    [
      'พุธ (กลางคืน)',
      'ดำ, เหลือง, ส้มแสด', '#212121,#FBC02D,#FF6D00',
      'แดง, ชมพู', '#D32F2F,#F06292',
      'เทา, ม่วงพาสเทล', '#757575,#CE93D8',
      'เหลืองเข้ม, ทอง', '#F57F17,#FFD700'
    ],
    [
      'พฤหัสบดี',
      'เหลือง, ขาว, เทา, มุก', '#FBC02D,#FFFFFF,#9E9E9E,#ECEFF1',
      'แดงเลือดหมู, ชมพู', '#880E4F,#F48FB1',
      'ฟ้า, น้ำเงิน, เขียวทุกโทน', '#42A5F5,#1565C0,#2E7D32',
      'ม่วง, ดำ, น้ำตาลเข้ม', '#6A1B9A,#212121,#3E2723'
    ],
    [
      'ศุกร์',
      'เขียวมิ้นต์, ม่วง, ส้ม', '#80CBC4,#7B1FA2,#FF9800',
      'ชมพูพาสเทล, ฟ้า', '#F8BBD0,#64B5F6',
      'เหลือง, ขาว, เทา, น้ำเงิน', '#FDD835,#FFFFFF,#9E9E9E,#1565C0',
      'ดำ, เทาเข้ม, น้ำตาล', '#212121,#424242,#5D4037'
    ],
    [
      'เสาร์',
      'แดงเข้ม, ชมพู, ทับทิม', '#B71C1C,#F06292,#C2185B',
      'น้ำเงิน, ฟ้าคราม', '#1565C0,#0288D1',
      'ม่วง, ดำ, เทา', '#7B1FA2,#212121,#757575',
      'เขียวทุกเฉด', '#2E7D32,#4CAF50,#81C784'
    ]
  ];

  rules.forEach(row => sheet.appendRow(row));
}

function seedZodiacColors(sheet) {
  if (sheet.getLastRow() > 1) return;
  const zodiacs = [
    ['ธาตุไฟ', 'เมษ, สิงห์, ธนู', 'เทา, เทาอ่อน, เหลือง, ฟ้า', '#9E9E9E,#E0E0E0,#FBC02D,#42A5F5', 'เสริมโชคลาภ การเงิน การรองรับการเปลี่ยนแปลงที่มั่นคง'],
    ['ธาตุดิน', 'พฤษภ, กันย์, มังกร', 'ฟ้า, ม่วง, เขียว, เทา, น้ำตาล, ครีม', '#42A5F5,#7B1FA2,#388E3C,#757575,#6D4C41,#FFFDD0', 'เสริมความมั่นใจ โชคลาภ ความสำเร็จ และความเมตตา'],
    ['ธาตุลม', 'เมถุน, ตุลย์, กุมภ์', 'แดง, ชมพู, ส้ม, ฟ้า, น้ำเงิน', '#D32F2F,#F06292,#FF9800,#42A5F5,#1565C0', 'เสริมความก้าวหน้า โชคลาภ ชื่อเสียง และการเจรจา'],
    ['ธาตุน้ำ', 'กรกฎ, พิจิก, มีน', 'เหลือง, ครีม, ส้ม, เทา', '#FBC02D,#FFFDD0,#FB8C00,#9E9E9E', 'เสริมแสงสว่าง การเริ่มต้นใหม่ การงาน และแรงบันดาลใจ']
  ];
  zodiacs.forEach(row => sheet.appendRow(row));
}

function seedRemedies(sheet) {
  if (sheet.getLastRow() > 1) return;
  const remedies = [
    ['REM01', 'แดง / แดงสด / แดงเพลิง', 'ไฟ', 'น้ำ', 'น้ำเงิน, ดำ', '#1565C0,#212121', 'Elemental Suppression & Shield', 'ใช้หลักน้ำดับไฟ สวมใส่เครื่องประดับสีน้ำเงินหรือดำ หรือใส่ซับในสีน้ำเงินเพื่อดับอิทธิพลของธาตุไฟ'],
    ['REM02', 'เหลือง / ขาว / ครีม', 'ทอง / ดิน', 'ไฟ / ไม้', 'แดง, ส้ม, เขียว', '#D32F2F,#FF9800,#2E7D32', 'Accessory Diversion', 'สวมใส่เนกไท หรือเครื่องประดับสีส้ม/แดง เพื่อดึงดูดสายตาและเบี่ยงเบนพลังงานอ่อน'],
    ['REM03', 'ชมพู / โอรส', 'ไฟอ่อน', 'น้ำ', 'ฟ้า, น้ำเงิน, ดำ', '#42A5F5,#1565C0,#212121', 'Hidden Shield', 'สวมใส่เสื้อซับในหรือถุงเท้าสีน้ำเงิน/ดำ ซ่อนไว้ภายในชุดเพื่อเป็นเกราะกำบัง'],
    ['REM04', 'เขียวทุกเฉด', 'ไม้', 'ทอง', 'ขาว, ครีม, เงิน, ทอง', '#FAFAFA,#FFFDD0,#ECEFF1,#FFD700', 'Elemental Suppression', 'ใช้หลักโลหะตัดไม้ เสริมแอคเซสเซอรีโลหะสีเงิน ทอง หรือเข็มขัดหัวทอง'],
    ['REM05', 'ม่วง / ดำ / น้ำตาลเข้ม', 'น้ำ / ดินหนา', 'ดิน / ไม้', 'เขียว, ครีม, เหลือง', '#388E3C,#FFFDD0,#FBC02D', 'Accessory & Layering', 'สวมเสื้อคลุมสีครีม หรือพกผ้าเช็ดหน้าสีเขียวเหนี่ยวทรัพย์ไว้ในกระเป๋า'],
    ['REM06', 'น้ำเงิน / ฟ้า / คราม', 'น้ำ', 'ดิน', 'เหลือง, ส้ม, น้ำตาล', '#FBC02D,#FF9800,#795548', 'Elemental Suppression', 'ใช้หลักดินกั้นน้ำ สวมเข็มขัดหรือนาฬิกาสายหนังสีน้ำตาลทอง']
  ];
  remedies.forEach(row => sheet.appendRow(row));
}

function seedWalletsAndGems(sheet) {
  if (sheet.getLastRow() > 1) return;
  const items = [
    ['อาทิตย์', 'ดำ, ม่วง, น้ำตาลเข้ม', 'น้ำเงิน, ฟ้า', 'ทับทิม (Ruby), โกเมน (Garnet)', 'เสริมบารมี พลังอำนาจ และความเป็นผู้นำ'],
    ['จันทร์', 'เหลืองเข้ม, ทอง', 'ส้ม, แดง', 'ไข่มุก (Pearl), มุกดาหาร (Moonstone)', 'เสริมเสน่ห์เมตตา ความอ่อนโยน และเรียกทรัพย์'],
    ['อังคาร', 'เทาเข้ม', 'เหลืองอ่อน, ขาว', 'แอเมทิสต์ (Amethyst), โรโดโครไซต์', 'เสริมความกล้าหาญ ป้องกันอุปสรรค'],
    ['พุธ (กลางวัน)', 'น้ำเงิน, คราม, ฟ้า', 'ชมพู', 'มรกต (Emerald), กรีนอเวนเจอรีน', 'เสริมสติปัญญา เจรจาค้าขายคล่อง'],
    ['พุธ (กลางคืน)', 'ชมพู', 'เหลืองเข้ม, ส้ม, ทอง', 'โกเมนสีเขียว, หินออบซิเดียน', 'คุ้มครองแคล้วคลาด แก้เคล็ด'],
    ['พฤหัสบดี', 'เหลืองอ่อน, ขาว, เทา', 'ดำ, ม่วง', 'บุษราคัม (Yellow Sapphire), ซิทริน', 'เสริมความเจริญรุ่งเรือง ผู้ใหญ่อุปถัมภ์'],
    ['ศุกร์', 'เขียว', 'ม่วง, ดำ, โทนมืด', 'ไพลิน (Blue Sapphire), ลาพิส ลาซูลี', 'เสริมความรัก ความสุข และโชคลาภการเงิน'],
    ['เสาร์', 'แดง', 'เขียว', 'นิล (Onyx), หินตาเสือ (Tiger Eye)', 'เสริมความอดทน มั่งคั่ง บารมีหนักแน่น']
  ];
  items.forEach(row => sheet.appendRow(row));
}

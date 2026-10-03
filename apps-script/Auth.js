/**
 * โชคดีทุกวัน (Everyday Lucky) - Authentication & User Management
 * ระบบจัดการผู้ใช้งาน: สมัครสมาชิก, เข้าสู่ระบบ, ความปลอดภัย (SHA-256 + Salt), PDPA
 */

function handleRegister(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) return { success: false, message: 'ฐานข้อมูลยังไม่พร้อม กรุณารัน setupDatabase ก่อน' };

  const email = (data.email || '').trim().toLowerCase();
  const password = data.password || '';
  const displayName = (data.displayName || '').trim();
  const birthDay = (data.birthDay || 'จันทร์').trim();
  const birthDate = data.birthDate || '';
  const zodiac = data.zodiac || '';
  const personalColor = data.personalColor || 'Spring';
  const pdpaConsent = data.pdpaConsent === true || data.pdpaConsent === 'true';

  if (!email || !password) {
    return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }
  if (!pdpaConsent) {
    return { success: false, message: 'กรุณายินยอมเงื่อนไขการคุ้มครองข้อมูลส่วนบุคคล (PDPA)' };
  }

  // ตรวจสอบว่ามีอีเมลนี้อยู่แล้วหรือไม่
  const usersData = usersSheet.getDataRange().getValues();
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][1].toString().toLowerCase() === email) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้วในระบบ' };
    }
  }

  // สร้าง Salt และ Hash รหัสผ่านด้วย SHA-256
  const salt = Utilities.getUuid().substring(0, 16);
  const passwordHash = hashPassword(password, salt);
  const userId = 'USR_' + Utilities.getUuid().substring(0, 8);
  const now = new Date();

  // บันทึกสมาชิกลงชีต
  usersSheet.appendRow([
    userId,
    email,
    passwordHash,
    salt,
    displayName || email.split('@')[0],
    birthDay,
    birthDate,
    zodiac,
    personalColor,
    'free', // แผนเริ่มต้น: free (พร้อมรองรับ premium ในอนาคต)
    '',     // plan_expire_at
    pdpaConsent ? 'YES' : 'NO',
    now.toISOString(),
    now.toISOString()
  ]);

  // สร้าง Session token ให้ล็อกอินได้ทันที
  const token = createSession(userId);

  return {
    success: true,
    message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่โชคดีทุกวัน',
    token: token,
    user: {
      userId: userId,
      email: email,
      displayName: displayName || email.split('@')[0],
      birthDay: birthDay,
      birthDate: birthDate,
      zodiac: zodiac,
      personalColor: personalColor,
      plan: 'free'
    }
  };
}

function handleLogin(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) return { success: false, message: 'ฐานข้อมูลยังไม่พร้อม' };

  const email = (data.email || '').trim().toLowerCase();
  const password = data.password || '';

  if (!email || !password) {
    return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }

  const usersData = usersSheet.getDataRange().getValues();
  let userRowIndex = -1;
  let userData = null;

  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][1].toString().toLowerCase() === email) {
      userRowIndex = i + 1;
      userData = usersData[i];
      break;
    }
  }

  if (!userData) {
    return { success: false, message: 'ไม่พบอีเมลนี้ในระบบ' };
  }

  const storedHash = userData[2];
  const salt = userData[3];
  const computedHash = hashPassword(password, salt);

  if (storedHash !== computedHash) {
    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
  }

  // อัปเดตเวลาล็อกอินล่าสุด
  const now = new Date();
  usersSheet.getRange(userRowIndex, 14).setValue(now.toISOString());

  const userId = userData[0];
  const token = createSession(userId);

  // ตรวจสอบสถานะ Premium ว่าหมดอายุหรือยัง
  let plan = userData[9] || 'free';
  const planExpire = userData[10] ? new Date(userData[10]) : null;
  if (plan === 'premium' && planExpire && planExpire < now) {
    plan = 'free'; // ปรับกลับเป็น free เมื่อหมดอายุ
    usersSheet.getRange(userRowIndex, 10).setValue('free');
  }

  return {
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ',
    token: token,
    user: {
      userId: userId,
      email: userData[1],
      displayName: userData[4],
      birthDay: userData[5],
      birthDate: userData[6],
      zodiac: userData[7],
      personalColor: userData[8],
      plan: plan
    }
  };
}

function handleGetProfile(token) {
  const user = getUserByToken(token);
  if (!user) return { success: false, message: 'เซสชันหมดอายุหรือไม่ถูกต้อง' };
  return { success: true, user: user };
}

function handleUpdateProfile(token, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) return { success: false, message: 'ไม่พบฐานข้อมูล' };

  const sessionUser = getUserByToken(token);
  if (!sessionUser) return { success: false, message: 'เซสชันหมดอายุ' };

  const usersData = usersSheet.getDataRange().getValues();
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === sessionUser.userId) {
      const row = i + 1;
      if (updates.displayName !== undefined) usersSheet.getRange(row, 5).setValue(updates.displayName);
      if (updates.birthDay !== undefined) usersSheet.getRange(row, 6).setValue(updates.birthDay);
      if (updates.birthDate !== undefined) usersSheet.getRange(row, 7).setValue(updates.birthDate);
      if (updates.zodiac !== undefined) usersSheet.getRange(row, 8).setValue(updates.zodiac);
      if (updates.personalColor !== undefined) usersSheet.getRange(row, 9).setValue(updates.personalColor);

      return {
        success: true,
        message: 'อัปเดตข้อมูลสำเร็จ',
        user: getUserByToken(token)
      };
    }
  }
  return { success: false, message: 'ไม่พบผู้ใช้' };
}

function createSession(userId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sessionsSheet = ss.getSheetByName('Sessions');
  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  const now = new Date();
  const expire = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // อายุ 30 วัน

  sessionsSheet.appendRow([token, userId, now.toISOString(), expire.toISOString()]);
  return token;
}

function getUserByToken(token) {
  if (!token) return null;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sessionsSheet = ss.getSheetByName('Sessions');
  const usersSheet = ss.getSheetByName('Users');
  if (!sessionsSheet || !usersSheet) return null;

  const sessions = sessionsSheet.getDataRange().getValues();
  let userId = null;
  const now = new Date();

  for (let i = sessions.length - 1; i >= 1; i--) {
    if (sessions[i][0] === token) {
      const expire = new Date(sessions[i][3]);
      if (expire > now) {
        userId = sessions[i][1];
      }
      break;
    }
  }

  if (!userId) return null;

  const users = usersSheet.getDataRange().getValues();
  for (let i = 1; i < users.length; i++) {
    if (users[i][0] === userId) {
      return {
        userId: users[i][0],
        email: users[i][1],
        displayName: users[i][4],
        birthDay: users[i][5],
        birthDate: users[i][6],
        zodiac: users[i][7],
        personalColor: users[i][8],
        plan: users[i][9] || 'free',
        planExpireAt: users[i][10] || ''
      };
    }
  }
  return null;
}

function hashPassword(password, salt) {
  const rawBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + salt,
    Utilities.Charset.UTF_8
  );
  let hash = '';
  for (let i = 0; i < rawBytes.length; i++) {
    const byteVal = (rawBytes[i] < 0 ? rawBytes[i] + 256 : rawBytes[i]).toString(16);
    hash += (byteVal.length === 1 ? '0' : '') + byteVal;
  }
  return hash;
}

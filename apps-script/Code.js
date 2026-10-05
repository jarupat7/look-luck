/**
 * โชคดีทุกวัน (Everyday Lucky) - Main Router & Web API Entry Point
 * ให้บริการทั้งในรูปแบบ JSON API (สำหรับเว็บแอพภายนอก/มือถือ)
 * และ Web Page (HTML Service เมื่อเปิดผ่าน Apps Script URL โดยตรง)
 */

function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = params.action || '';

  // หากเรียก action ผ่าน GET (เช่น ขอข้อมูลสีมงคล หรือ ตรวจสอบสถานะ)
  if (action === 'getDailyLucky') {
    const birthDay = params.birthDay || 'จันทร์';
    const goal = params.goal || 'work';
    const zodiac = params.zodiac || '';
    const personalColor = params.personalColor || 'Spring';
    const targetDay = params.targetDay || '';
    const result = getDailyLuckyAdvice(birthDay, goal, zodiac, personalColor, targetDay);
    return createJsonResponse(result);
  }

  if (action === 'checkStatus') {
    return createJsonResponse({
      status: 'active',
      appName: 'โชคดีทุกวัน (Everyday Lucky)',
      version: '1.2.0-phase2-transiting',
      timestamp: new Date().toISOString()
    });
  }

  // หากเปิดลิงก์ Apps Script ผ่านเบราว์เซอร์โดยตรง ให้แสดงหน้า HTML หรือข้อความแจ้ง
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>โชคดีทุกวัน API</title>' +
    '<style>body{font-family:sans-serif;padding:2rem;text-align:center;background:#FAF8F5;color:#333;}' +
    '.card{background:#fff;padding:2rem;border-radius:16px;max-width:500px;margin:auto;box-shadow:0 4px 20px rgba(0,0,0,0.06);}' +
    'h1{color:#8C6239;margin-bottom:0.5rem;}p{color:#666;line-height:1.6;}' +
    '</style></head><body><div class="card">' +
    '<h1>✨ โชคดีทุกวัน API</h1>' +
    '<p>ระบบ Google Apps Script Backend พร้อมให้บริการแล้ว (รองรับการคำนวณสีประจำวัน 7 วัน)</p>' +
    '<p>คุณสามารถใช้ URL นี้เป็น Webhook / API Endpoint เชื่อมต่อกับเว็บแอปพลิเคชันได้ทันที</p>' +
    '</div></body></html>'
  ).setTitle('โชคดีทุกวัน API');
}

function doPost(e) {
  let responseData = { success: false, message: 'Invalid request' };

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;

    if (action === 'setup') {
      setupDatabase();
      responseData = { success: true, message: 'สร้างฐานข้อมูลและตารางสีมงคลเรียบร้อยแล้ว' };
    } else if (action === 'register') {
      responseData = handleRegister(payload);
    } else if (action === 'login') {
      responseData = handleLogin(payload);
    } else if (action === 'getProfile') {
      responseData = handleGetProfile(payload.token);
    } else if (action === 'updateProfile') {
      responseData = handleUpdateProfile(payload.token, payload.updates || {});
    } else if (action === 'getDailyLucky') {
      responseData = getDailyLuckyAdvice(
        payload.birthDay,
        payload.goal,
        payload.zodiac,
        payload.personalColor,
        payload.targetDay
      );
    } else {
      responseData = { success: false, message: 'ไม่พบคำสั่ง action: ' + action };
    }
  } catch (err) {
    responseData = {
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ: ' + err.toString()
    };
  }

  return createJsonResponse(responseData);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

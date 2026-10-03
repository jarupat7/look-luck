# โชคดีทุกวัน (Everyday Lucky) — ระยะที่ 1 (MVP)

เว็บแอปพลิเคชันแนะนำการแต่งกายและสีมงคลประจำวัน ผสานศาสตร์โหราศาสตร์ (เทวดานพเคราะห์, มหาทักษา) และ Personal Color สไตล์มินิมอลโมเดิร์นแฟชั่น (ดีไซน์ Option B) พร้อมฐานข้อมูล Google Sheets และระบบสมาชิกที่เตรียมพร้อมรองรับแพ็กเกจชำระเงินในอนาคต

---

## โครงสร้างโปรเจกต์
```
โปรแกรม โชคดีทุกวัน/
├── code_artifact.md          # เอกสารวิจัยและสถาปัตยกรรมข้อมูลฉบับเต็ม
├── README.md                 # คู่มือการติดตั้งและใช้งาน
├── apps-script/              # ระบบหลังบ้าน Google Apps Script + Google Sheets
│   ├── Code.js               # Web API Router (doGet, doPost, JSON Output)
│   ├── Auth.js               # ระบบสมาชิก (SHA-256 + Salt, Session, PDPA)
│   ├── LuckyEngine.js        # เครื่องยนต์คำนวณสีมงคล, Personal Color, แก้เคล็ด
│   ├── Setup.js              # สคริปต์สร้างชีตและข้อมูลเริ่มต้นอัตโนมัติ
│   └── appsscript.json       # Apps Script Manifest
└── web/                      # หน้าบ้านเว็บแอปพลิเคชัน (Mobile-first UX/UI Option B)
    ├── index.html            # โครงสร้างหน้าเว็บ Single Page App
    ├── styles.css            # ธีมมินิมอลแฟชั่นนิตยสาร (Cream/Pastel/Modern)
    └── app.js                # ตรรกะฝั่งผู้ใช้ + โหมดทดลองออฟไลน์ + ตัวเชื่อม API
```

---

## วิธีเปิดทดสอบเว็บแอปทันที (ไม่ต้องตั้งค่าเซิร์ฟเวอร์)

1. เข้าไปที่โฟลเดอร์ `web/`
2. ดับเบิลคลิกเปิดไฟล์ `index.html` ด้วย Google Chrome, Microsoft Edge หรือ Safari
3. ระบบจะทำงานใน **โหมดสาธิตออฟไลน์ (Local Demo Mode)** ทันที:
   - ทดสอบสลับแท็บ: **หน้าแรก, ตู้เสื้อผ้า, แก้เคล็ด, โปรไฟล์**
   - ทดสอบกดปุ่มเลือกเป้าหมาย: **เจรจางาน, โชคลาภเงิน, ออกเดต, พักผ่อน**
   - ทดสอบเลือก Personal Color (Spring, Autumn, Summer, Winter)
   - ทดสอบกด "เข้าสู่ระบบ" หรือ "สมัครสมาชิก" (พร้อมระบบติ๊กยินยอม PDPA)

---

## วิธีเชื่อมต่อกับ Google Sheets & Google Apps Script (Live Database)

เมื่อต้องการให้ข้อมูลบันทึกลง Google Sheets จริงๆ ให้ทำตามขั้นตอนดังนี้:

### 1. สร้าง Google Sheet ใหม่
1. ไปที่ [Google Sheets](https://sheets.new) แล้วตั้งชื่อไฟล์ เช่น `ฐานข้อมูล โชคดีทุกวัน`
2. ไปที่เมนู **ส่วนขยาย (Extensions)** &rsaquo; **Apps Script**

### 2. นำโค้ดในโฟลเดอร์ `apps-script/` ไปวาง
1. ในหน้าต่าง Apps Script ให้สร้างไฟล์ `.gs` ตามนี้:
   - `Code.gs` &larr; คัดลอกเนื้อหาจาก [apps-script/Code.js](file:///g:/My%20Drive/PROGRAM%20ที่เขียน/โปรแกรม%20โชคดีทุกวัน/apps-script/Code.js)
   - `Auth.gs` &larr; คัดลอกเนื้อหาจาก [apps-script/Auth.js](file:///g:/My%20Drive/PROGRAM%20ที่เขียน/โปรแกรม%20โชคดีทุกวัน/apps-script/Auth.js)
   - `LuckyEngine.gs` &larr; คัดลอกเนื้อหาจาก [apps-script/LuckyEngine.js](file:///g:/My%20Drive/PROGRAM%20ที่เขียน/โปรแกรม%20โชคดีทุกวัน/apps-script/LuckyEngine.js)
   - `Setup.gs` &larr; คัดลอกเนื้อหาจาก [apps-script/Setup.js](file:///g:/My%20Drive/PROGRAM%20ที่เขียน/โปรแกรม%20โชคดีทุกวัน/apps-script/Setup.js)

### 3. รันฟังก์ชันสร้างตารางเริ่มต้น
1. ที่แถบเมนูด้านบน เลือกฟังก์ชัน `setupDatabase` แล้วกดปุ่ม **เรียกใช้ (Run)**
2. กดยอมรับสิทธิ์การเข้าถึง (Authorize) ในครั้งแรก
3. กลับไปดูที่ Google Sheet จะพบว่ามีชีตทั้งหมด 8 ชีตถูกสร้างพร้อมข้อมูลสีมงคลเรียบร้อย:
   - `Users`, `Sessions`, `ColorRules`, `ZodiacColors`, `Remedies`, `WalletsAndGems`, `Payments`, `Logs`

### 4. นำไปใช้งาน (Deploy Web App)
1. กดปุ่มสีน้ำเงินมุมขวาบน **การทำให้ใช้งานได้ (Deploy)** &rsaquo; **การทำให้ใช้งานได้ใหม่ (New deployment)**
2. เลือกประเภทเป็น **เว็บแอป (Web app)**
   - คำอธิบาย: `v1.0-mvp`
   - เรียกใช้ในฐานะ: **ฉัน (บัญชีของคุณ)**
   - ผู้ที่มีสิทธิ์เข้าถึง: **ทุกคน (Anyone)** *(สำคัญ เพื่อให้เว็บแอปเรียก API ได้)*
3. กด **ทำให้ใช้งานได้ (Deploy)** แล้วคัดลอก **URL เว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec`

### 5. นำ URL มาใส่ในเว็บแอป
1. เปิดหน้าเว็บ `index.html`
2. กดไอคอนเฟือง ⚙️ ที่มุมขวาบน
3. วาง Web App URL ที่ได้ลงไป แล้วกด **บันทึกการตั้งค่า**
4. ตอนนี้การสมัครสมาชิก ล็อกอิน และบันทึกโปรไฟล์จะส่งตรงเข้าไปที่ Google Sheets ทันที!

---

## ฟีเจอร์ที่พร้อมรองรับระบบชำระเงินในอนาคต (Future Paid Plan)
- คอลัมน์ `plan` (`free` / `premium`) และ `plan_expire_at` มีพร้อมอยู่ในชีต `Users`
- ชีต `Payments` ถูกเตรียมไว้สำหรับเก็บบันทึกประวัติสลิป/การชำระเงิน
- หน้าต่างโปรไฟล์มีป้ายแสดงสถานะและกล่อง Teaser อัปเกรดสิทธิ์พรีเมียม

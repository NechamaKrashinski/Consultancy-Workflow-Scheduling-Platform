require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('BusinessConsulting', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost', 
    dialect: 'mssql',
    port: process.env.DB_PORT || 1433, 
    dialectOptions: {
        encrypt: false, 
        trustServerCertificate: true 
    },
    logging: false
});

async function addBusinessHours() {
  try {
    console.log('📅 מוסיף שעות עבודה לדוגמה למסד הנתונים...\n');
    
    await sequelize.authenticate();
    console.log('✅ חיבור למסד נתונים הצליח!\n');

    // הוספת שעות עבודה לכל היועצים לשבוע הקרוב
    const consultants = [1, 2, 3, 4, 5, 6]; // IDs של היועצים

    console.log('🕘 מוסיף שעות עבודה ליועצים...\n');

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) { // שבועיים קדימה
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayOfWeek = date.getDay(); // 0=ראשון, 1=שני, ..., 5=שישי, 6=שבת

      console.log(`📅 מעבד יום: ${dateStr} (יום ${dayOfWeek === 0 ? 'ראשון' : dayOfWeek === 1 ? 'שני' : dayOfWeek === 2 ? 'שלישי' : dayOfWeek === 3 ? 'רביעי' : dayOfWeek === 4 ? 'חמישי' : dayOfWeek === 5 ? 'שישי' : 'שבת'})`);

      // דילוג על שבת (6) - אין עבודה בשבת!
      if (dayOfWeek === 6) {
        console.log(`   ⏭️ דולג על שבת - ${dateStr}`);
        continue;
      }

      for (const consultantId of consultants) {
        try {
          if (dayOfWeek === 5) { 
            // יום שישי - רק בוקר (09:00-13:00)
            await sequelize.query(`
              INSERT INTO BusinessHours (business_consultant_id, date, start_time, end_time, is_active)
              VALUES (?, ?, '09:00:00', '13:00:00', 1)
            `, {
              replacements: [consultantId, dateStr]
            });
            console.log(`   ✅ שישי - יועץ ${consultantId}: ${dateStr} 09:00-13:00`);
          } else if (dayOfWeek >= 0 && dayOfWeek <= 4) { 
            // ראשון עד חמישי - יום עבודה מלא
            
            // בוקר (09:00-13:00)
            await sequelize.query(`
              INSERT INTO BusinessHours (business_consultant_id, date, start_time, end_time, is_active)
              VALUES (?, ?, '09:00:00', '13:00:00', 1)
            `, {
              replacements: [consultantId, dateStr]
            });
            console.log(`   ✅ בוקר - יועץ ${consultantId}: ${dateStr} 09:00-13:00`);

            // אחר הצהריים (14:00-18:00)
            await sequelize.query(`
              INSERT INTO BusinessHours (business_consultant_id, date, start_time, end_time, is_active)
              VALUES (?, ?, '14:00:00', '18:00:00', 1)
            `, {
              replacements: [consultantId, dateStr]
            });
            console.log(`   ✅ אחה"צ - יועץ ${consultantId}: ${dateStr} 14:00-18:00`);
          }
        } catch (err) {
          console.log(`   ❌ שגיאה בהוספת שעות ליועץ ${consultantId} בתאריך ${dateStr}: ${err.message}`);
        }
      }
    }

    console.log('\n🔍 בודק כמה שעות עבודה נוספו...');
    const [result] = await sequelize.query(`
      SELECT COUNT(*) as total_hours,
             COUNT(DISTINCT business_consultant_id) as consultants_with_hours,
             COUNT(DISTINCT date) as days_with_hours
      FROM BusinessHours 
      WHERE date >= CAST(GETDATE() AS DATE)
    `);

    console.log(`\n📊 סיכום:
    - סך הכל שעות עבודה: ${result[0].total_hours}
    - יועצים עם שעות עבודה: ${result[0].consultants_with_hours} מתוך 6
    - ימים עם שעות עבודה: ${result[0].days_with_hours}
    
🗓️ הוספו שעות עבודה לכל היועצים:
   • ראשון-חמישי: 09:00-13:00 + 14:00-18:00
   • שישי: 09:00-13:00 בלבד
   • שבת: ללא שעות עבודה\n`);

    console.log('✅ הושלם! עכשיו אמור להיות זמנים פנויים במערכת הזמנת הפגישות!');

  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  } finally {
    await sequelize.close();
  }
}

addBusinessHours();

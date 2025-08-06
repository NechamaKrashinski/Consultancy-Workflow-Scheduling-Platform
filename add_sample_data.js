const { Sequelize } = require('sequelize');

// הגדרת החיבור למסד הנתונים (עדכן לפי ההגדרות שלך)
const sequelize = new Sequelize({
  dialect: 'sqlite', // או mysql/postgres לפי מה שאתה משתמש
  storage: './database.sqlite', // לsqlite - עדכן לנתיב הנכון
  // עבור MySQL/PostgreSQL:
  // database: 'your_database_name',
  // username: 'your_username', 
  // password: 'your_password',
  // host: 'localhost',
  logging: false
});

async function addSampleData() {
  try {
    console.log('🔍 מתחבר למסד נתונים...');
    await sequelize.authenticate();
    console.log('✅ חיבור הצליח!\n');

    // הוספת שירותים דוגמה
    console.log('1️⃣ מוסיף שירותים דוגמה...');
    await sequelize.query(`
      INSERT OR IGNORE INTO services (id, name, description, duration, price, created_at, updated_at) VALUES
      (1, 'Business Consultation', 'Strategic business planning and advice', 60, 150, datetime('now'), datetime('now')),
      (2, 'Marketing Strategy', 'Digital marketing and growth strategies', 45, 120, datetime('now'), datetime('now')),
      (3, 'Financial Planning', 'Financial analysis and planning', 30, 100, datetime('now'), datetime('now'))
    `);
    console.log('✅ שירותים נוספו');

    // הוספת יועץ עסקי דוגמה
    console.log('2️⃣ מוסיף יועץ עסקי דוגמה...');
    await sequelize.query(`
      INSERT OR IGNORE INTO business_consultants (id, name, email, phone, password, role, created_at, updated_at) VALUES
      (1, 'John Smith', 'john@example.com', '+1234567890', 'hashedpassword', 'consultant', datetime('now'), datetime('now'))
    `);
    console.log('✅ יועץ עסקי נוסף');

    // הוספת קשרים בין יועץ לשירותים
    console.log('3️⃣ מוסיף קשרים יועץ-שירותים...');
    await sequelize.query(`
      INSERT OR IGNORE INTO consultant_services (id, business_consultant_id, service_id, created_at, updated_at) VALUES
      (1, 1, 1, datetime('now'), datetime('now')),
      (2, 1, 2, datetime('now'), datetime('now')),
      (3, 1, 3, datetime('now'), datetime('now'))
    `);
    console.log('✅ קשרים נוספו');

    // הוספת שעות עבודה לשבוע הקרוב
    console.log('4️⃣ מוסיף שעות עבודה לשבוע הקרוב...');
    
    // יצירת שעות עבודה ל-7 ימים הקרובים (09:00-17:00)
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      
      // יום ראשון עד חמישי (לדלג על שבת ראשון)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        await sequelize.query(`
          INSERT OR IGNORE INTO business_hours (
            business_consultant_id, 
            date, 
            start_time, 
            end_time, 
            is_active, 
            created_at, 
            updated_at
          ) VALUES (
            1, 
            '${formattedDate}', 
            '09:00:00', 
            '17:00:00', 
            1, 
            datetime('now'), 
            datetime('now')
          )
        `);
        console.log(`   ✅ נוסף יום עבודה: ${formattedDate} (09:00-17:00)`);
      }
    }

    console.log('\n🎉 נתוני דוגמה נוספו בהצלחה!');
    console.log('\n💡 עכשיו תוכל לנסות שוב את המערכת - אמור להיות זמנים פנויים');
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
    console.log('\n💡 ייתכן שהטבלאות לא קיימות או שיש בעיה בחיבור למסד הנתונים');
  } finally {
    await sequelize.close();
  }
}

// הפעלת הוספת הנתונים
addSampleData();

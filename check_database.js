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
  logging: false // כדי לא להציג SQL queries
});

async function checkDatabase() {
  try {
    console.log('🔍 בודק חיבור למסד נתונים...');
    await sequelize.authenticate();
    console.log('✅ חיבור למסד נתונים הצליח!\n');

    // בדיקת טבלאות
    console.log('📊 בודק נתונים בטבלאות:\n');

    // בדיקת שירותים
    console.log('1️⃣ שירותים (Services):');
    const [services] = await sequelize.query('SELECT id, name, duration, price FROM services');
    if (services.length > 0) {
      console.log(`   נמצאו ${services.length} שירותים:`);
      services.forEach(service => {
        console.log(`   - ID: ${service.id}, Name: ${service.name}, Duration: ${service.duration} min, Price: $${service.price}`);
      });
    } else {
      console.log('   ❌ לא נמצאו שירותים!');
    }
    console.log('');

    // בדיקת יועצים עסקיים
    console.log('2️⃣ יועצים עסקיים (BusinessConsultants):');
    const [consultants] = await sequelize.query('SELECT id, name, email FROM business_consultants');
    if (consultants.length > 0) {
      console.log(`   נמצאו ${consultants.length} יועצים:`);
      consultants.forEach(consultant => {
        console.log(`   - ID: ${consultant.id}, Name: ${consultant.name}, Email: ${consultant.email}`);
      });
    } else {
      console.log('   ❌ לא נמצאו יועצים עסקיים!');
    }
    console.log('');

    // בדיקת שעות עבודה
    console.log('3️⃣ שעות עבודה (BusinessHours):');
    const [businessHours] = await sequelize.query(`
      SELECT id, business_consultant_id, date, start_time, end_time, is_active 
      FROM business_hours 
      WHERE date >= date('now') 
      ORDER BY date, start_time
    `);
    if (businessHours.length > 0) {
      console.log(`   נמצאו ${businessHours.length} שעות עבודה (מהיום ואילך):`);
      businessHours.forEach(hour => {
        console.log(`   - ID: ${hour.id}, Consultant: ${hour.business_consultant_id}, Date: ${hour.date}, Time: ${hour.start_time}-${hour.end_time}, Active: ${hour.is_active}`);
      });
    } else {
      console.log('   ❌ לא נמצאו שעות עבודה (מהיום ואילך)!');
    }
    console.log('');

    // בדיקת פגישות קיימות
    console.log('4️⃣ פגישות (Meetings):');
    const [meetings] = await sequelize.query(`
      SELECT id, business_hour_id, client_id, service_id, date, start_time, end_time, status 
      FROM meetings 
      WHERE date >= date('now')
      ORDER BY date, start_time
    `);
    if (meetings.length > 0) {
      console.log(`   נמצאו ${meetings.length} פגישות (מהיום ואילך):`);
      meetings.forEach(meeting => {
        console.log(`   - ID: ${meeting.id}, BusinessHour: ${meeting.business_hour_id}, Client: ${meeting.client_id}, Service: ${meeting.service_id}`);
        console.log(`     Date: ${meeting.date}, Time: ${meeting.start_time}-${meeting.end_time}, Status: ${meeting.status}`);
      });
    } else {
      console.log('   ✅ לא נמצאו פגישות (מהיום ואילך) - זה טוב לבדיקה!');
    }
    console.log('');

    // בדיקת קשרים בין יועצים לשירותים
    console.log('5️⃣ קשרים יועצים-שירותים (ConsultantServices):');
    const [consultantServices] = await sequelize.query(`
      SELECT cs.id, cs.business_consultant_id, cs.service_id, bc.name as consultant_name, s.name as service_name
      FROM consultant_services cs
      LEFT JOIN business_consultants bc ON cs.business_consultant_id = bc.id
      LEFT JOIN services s ON cs.service_id = s.id
    `);
    if (consultantServices.length > 0) {
      console.log(`   נמצאו ${consultantServices.length} קשרים:`);
      consultantServices.forEach(cs => {
        console.log(`   - Consultant: ${cs.consultant_name} (ID: ${cs.business_consultant_id}) ↔ Service: ${cs.service_name} (ID: ${cs.service_id})`);
      });
    } else {
      console.log('   ❌ לא נמצאו קשרים בין יועצים לשירותים!');
    }
    console.log('');

    // סיכום ובדיקות
    console.log('📋 סיכום:');
    
    if (services.length === 0) {
      console.log('❌ חסרים שירותים - צריך להוסיף שירותים לטבלה services');
    }
    
    if (consultants.length === 0) {
      console.log('❌ חסרים יועצים - צריך להוסיף יועצים לטבלה business_consultants');
    }
    
    if (businessHours.length === 0) {
      console.log('❌ חסרות שעות עבודה - צריך להוסיף שעות עבודה לטבלה business_hours');
      console.log('💡 זו כנראה הסיבה שלא רואים זמנים פנויים!');
    }
    
    if (consultantServices.length === 0) {
      console.log('❌ חסרים קשרים - צריך להוסיף קשרים בין יועצים לשירותים בטבלה consultant_services');
    }

    if (services.length > 0 && consultants.length > 0 && businessHours.length > 0 && consultantServices.length > 0) {
      console.log('✅ כל הנתונים הבסיסיים קיימים!');
      console.log('💡 אם עדיין לא רואים זמנים פנויים, בדוק את הלוגים בשרת');
    }

  } catch (error) {
    console.error('❌ שגיאה:', error.message);
    console.log('\n💡 עדכן את הגדרות מסד הנתונים בתחילת הקובץ');
  } finally {
    await sequelize.close();
  }
}

// הפעלת הבדיקה
checkDatabase();

require('dotenv').config();
const { Sequelize } = require('sequelize');

// שימוש באותה הגדרה כמו בפרויקט שלך
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

async function checkDatabase() {
  try {
    console.log('🔍 בודק חיבור למסד נתונים SQL Server...');
    console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`📍 Database: BusinessConsulting`);
    console.log(`📍 User: ${process.env.DB_USER}`);
    
    await sequelize.authenticate();
    console.log('✅ חיבור למסד נתונים הצליח!\n');

    // בדיקת טבלאות
    console.log('📊 בודק נתונים בטבלאות:\n');

    // בדיקת שירותים
    console.log('1️⃣ שירותים (Service):');
    try {
      const [services] = await sequelize.query('SELECT id, name, duration, price FROM Service');
      if (services.length > 0) {
        console.log(`   נמצאו ${services.length} שירותים:`);
        services.forEach(service => {
          console.log(`   - ID: ${service.id}, Name: ${service.name}, Duration: ${service.duration} min, Price: $${service.price}`);
        });
      } else {
        console.log('   ❌ לא נמצאו שירותים!');
      }
    } catch (err) {
      console.log('   ❌ שגיאה בקריאת טבלת Service:', err.message);
    }
    console.log('');

    // בדיקת יועצים עסקיים
    console.log('2️⃣ יועצים עסקיים (BusinessConsultant):');
    try {
      const [consultants] = await sequelize.query('SELECT id, name, email FROM BusinessConsultant');
      if (consultants.length > 0) {
        console.log(`   נמצאו ${consultants.length} יועצים:`);
        consultants.forEach(consultant => {
          console.log(`   - ID: ${consultant.id}, Name: ${consultant.name}, Email: ${consultant.email}`);
        });
      } else {
        console.log('   ❌ לא נמצאו יועצים עסקיים!');
      }
    } catch (err) {
      console.log('   ❌ שגיאה בקריאת טבלת BusinessConsultant:', err.message);
    }
    console.log('');

    // בדיקת שעות עבודה
    console.log('3️⃣ שעות עבודה (BusinessHours):');
    try {
      const [businessHours] = await sequelize.query(`
        SELECT id, business_consultant_id, date, start_time, end_time, is_active 
        FROM BusinessHours 
        WHERE date >= CAST(GETDATE() AS DATE)
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
    } catch (err) {
      console.log('   ❌ שגיאה בקריאת טבלת BusinessHours:', err.message);
    }
    console.log('');

    // בדיקת פגישות קיימות
    console.log('4️⃣ פגישות (Meeting):');
    try {
      const [meetings] = await sequelize.query(`
        SELECT id, business_hour_id, client_id, service_id, date, start_time, end_time, status 
        FROM Meeting 
        WHERE date >= CAST(GETDATE() AS DATE)
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
    } catch (err) {
      console.log('   ❌ שגיאה בקריאת טבלת Meeting:', err.message);
    }
    console.log('');

    // בדיקת קשרים בין יועצים לשירותים
    console.log('5️⃣ קשרים יועצים-שירותים (ConsultantService):');
    try {
      const [consultantServices] = await sequelize.query(`
        SELECT cs.id, cs.consultant_id, cs.service_id, bc.name as consultant_name, s.name as service_name
        FROM ConsultantService cs
        LEFT JOIN BusinessConsultant bc ON cs.consultant_id = bc.id
        LEFT JOIN Service s ON cs.service_id = s.id
      `);
      if (consultantServices.length > 0) {
        console.log(`   נמצאו ${consultantServices.length} קשרים:`);
        consultantServices.forEach(cs => {
          console.log(`   - Consultant: ${cs.consultant_name} (ID: ${cs.consultant_id}) ↔ Service: ${cs.service_name} (ID: ${cs.service_id})`);
        });
      } else {
        console.log('   ❌ לא נמצאו קשרים בין יועצים לשירותים!');
      }
    } catch (err) {
      console.log('   ❌ שגיאה בקריאת טבלת ConsultantService:', err.message);
    }
    console.log('');

    // בדיקת קליינטים
    console.log('6️⃣ קליינטים (Client):');
    try {
      const [clients] = await sequelize.query('SELECT id, name, email FROM Client');
      if (clients.length > 0) {
        console.log(`   נמצאו ${clients.length} קליינטים:`);
        clients.forEach(client => {
          console.log(`   - ID: ${client.id}, Name: ${client.name}, Email: ${client.email}`);
        });
      } else {
        console.log('   ❌ לא נמצאו קליינטים!');
      }
    } catch (err) {
      console.log('   ❌ שגיאה בקריאת טבלת Client:', err.message);
    }
    console.log('');

    // סיכום ובדיקות
    console.log('📋 סיכום:');
    console.log('💡 אם רואים שגיאות בטבלאות, ייתכן ששמות הטבלאות שונים או שהטבלאות לא קיימות');
    console.log('💡 זו כנראה הסיבה שלא רואים זמנים פנויים במערכת!');

  } catch (error) {
    console.error('❌ שגיאה בחיבור למסד הנתונים:', error.message);
    console.log('\n💡 בדוק שהגדרות מסד הנתונים נכונות בקובץ .env:');
    console.log('   - DB_HOST');
    console.log('   - DB_USER'); 
    console.log('   - DB_PASSWORD');
    console.log('   - DB_PORT');
  } finally {
    await sequelize.close();
  }
}

// הפעלת הבדיקה
checkDatabase();

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

async function checkTableNames() {
  try {
    console.log('🔍 בודק שמות טבלאות במסד הנתונים...\n');
    
    await sequelize.authenticate();
    console.log('✅ חיבור למסד נתונים הצליח!\n');

    // קבלת כל שמות הטבלאות
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

    console.log('📋 טבלאות קיימות במסד הנתונים:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.TABLE_NAME}`);
    });

    console.log('\n🔍 בואי נבדוק מבנה של כמה טבלאות חשובות:\n');

    // בדיקת עמודות בטבלאות
    for (const table of tables) {
      if (table.TABLE_NAME.toLowerCase().includes('service') || 
          table.TABLE_NAME.toLowerCase().includes('consultant') ||
          table.TABLE_NAME.toLowerCase().includes('business') ||
          table.TABLE_NAME.toLowerCase().includes('meeting') ||
          table.TABLE_NAME.toLowerCase().includes('client')) {
        
        console.log(`📊 טבלה: ${table.TABLE_NAME}`);
        try {
          const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = '${table.TABLE_NAME}'
            ORDER BY ORDINAL_POSITION
          `);
          
          columns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
          console.log('');
        } catch (err) {
          console.log(`   ❌ שגיאה בקריאת עמודות: ${err.message}\n`);
        }
      }
    }

  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableNames();

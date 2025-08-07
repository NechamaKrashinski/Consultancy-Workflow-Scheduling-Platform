require('dotenv').config();
const sequelize = require('./connection/dbConnection.js');
const { Client } = require('./models/associations.js');
const bcrypt = require('bcrypt');

async function checkClients() {
    try {
        await sequelize.authenticate();
        console.log('✅ מחובר לבסיס הנתונים');
        
        console.log('\n=== בדיקת כל הלקוחות ===');
        const clients = await Client.findAll();
        console.log('מספר לקוחות כולל:', clients.length);
        
        if (clients.length === 0) {
            console.log('❌ אין לקוחות בבסיס הנתונים!');
        } else {
            console.log('\n📋 רשימת לקוחות:');
            clients.forEach((client, index) => {
                console.log(`${index + 1}. ID: ${client.id} | Name: ${client.name} | Email: ${client.email}`);
            });
            
            console.log('\n=== בדיקה ספציפית למייל n@n ===');
            const nClient = await Client.findOne({ where: { email: 'n@n' } });
            if (nClient) {
                console.log('✅ נמצא לקוח עם המייל n@n:');
                console.log('- שם:', nClient.name);
                console.log('- מייל:', nClient.email);
                console.log('- סיסמה מוצפנת:', nClient.password.substring(0, 20) + '...');
                
                console.log('\n🔍 בדיקת סיסמאות נפוצות עבור n@n:');
                const testPasswords = ['n', 'N', 'nn', 'nN', '123456', 'password', 'n123', 'N123', 'nN123', 'Nn123456'];
                
                for (const pwd of testPasswords) {
                    try {
                        const match = await bcrypt.compare(pwd, nClient.password);
                        if (match) {
                            console.log(`✅ הסיסמה הנכונה היא: '${pwd}'`);
                            break;
                        }
                    } catch (error) {
                        console.log(`❌ שגיאה בבדיקת סיסמה '${pwd}': ${error.message}`);
                    }
                }
            } else {
                console.log('❌ לא נמצא לקוח עם המייל n@n');
            }
            
            console.log('\n=== בדיקה ספציפית למייל A@A.com ===');
            const aClient = await Client.findOne({ where: { email: 'A@A.com' } });
            if (aClient) {
                console.log('✅ נמצא לקוח עם המייל A@A.com');
                console.log('- שם:', aClient.name);
            } else {
                console.log('❌ לא נמצא לקוח עם המייל A@A.com');
            }
        }
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('💥 שגיאה:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

checkClients();

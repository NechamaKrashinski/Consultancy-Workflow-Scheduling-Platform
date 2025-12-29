const { schemas } = require('./middleware/validationMiddleware');

// הנתונים שמגיעים מהפרונט-אנד (עדכון לפי השגיאה החדשה)
const testData = {
    email: 'A@A.com',
    name: 'יעל',
    password: 'Aa789###',
    phone: '0541414141'
};

console.log('🔍 בדיקת validation עבור הרשמת לקוח:');
console.log('נתונים:', testData);

const { error, value } = schemas.clientRegistration.validate(testData);

if (error) {
    console.log('❌ שגיאות validation:');
    error.details.forEach(detail => {
        console.log('- שגיאה:', detail.message);
        console.log('- שדה:', detail.path);
        console.log('- ערך:', detail.context.value);
    });
} else {
    console.log('✅ validation עבר בהצלחה!');
    console.log('נתונים מוכשרים:', value);
    console.log('');
    console.log('🎉 עכשיו הרשמת לקוח אמורה לעבוד!');
}

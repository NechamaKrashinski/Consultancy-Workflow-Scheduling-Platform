# 🧪 Testing Guide - Business Consulting Node.js

## 🎯 מטרת המדריך
מדריך מקיף לטסטים ב-Node.js עבור פרויקט Business Consulting.

---

## 🛠️ **כלי הטסטים שהותקנו**

### 🥇 **Jest** 
- **Framework מלא** לטסטים
- **Mocking** מובנה
- **Coverage reports**
- **Snapshot testing**

### 🔧 **Supertest**
- **HTTP testing** לAPI
- **Integration tests**
- **Request/Response testing**

---

## 📂 **מבנה תיקיות הטסטים**

```
tests/
├── controllers/           # טסטי Controllers
│   └── authController.test.js
├── middleware/           # טסטי Middleware  
│   └── authMiddleware.test.js
├── integration/          # טסטי אינטגרציה
│   └── auth.integration.test.js
├── utils/               # טסטים בסיסיים
│   └── basic.test.js
└── setup.js            # הגדרות גלובליות
```

---

## 🚀 **פקודות הרצת טסטים**

### ⚡ **הרצה בסיסית**
```bash
npm test
```

### 🔍 **טסטים עם Coverage**
```bash
npm run test:coverage
```

### 👀 **Watch Mode (הרצה רציפה)**
```bash
npm run test:watch
```

### 🎯 **הרצת טסט ספציפי**
```bash
npm test -- tests/controllers/authController.test.js
```

---

## 📊 **תוצאות Coverage נוכחיות**

| קובץ | כיסוי קוד | סטטוס |
|------|----------|--------|
| **authController.js** | 100% | ✅ מושלם |
| **authMiddleware.js** | 100% | ✅ מושלם |
| **validationMiddleware.js** | 63% | 🟡 טוב |
| **authService.js** | 25% | 🟠 צריך שיפור |

---

## 🧪 **סוגי הטסטים**

### 1️⃣ **Unit Tests (טסטי יחידה)**
- בדיקת functions בודדות
- Mocking של dependencies
- ✅ `authController.test.js`
- ✅ `authMiddleware.test.js`

### 2️⃣ **Integration Tests (טסטי אינטגרציה)**
- בדיקת API endpoints
- בדיקת תקשורת בין רכיבים
- ✅ `auth.integration.test.js`

### 3️⃣ **Basic Tests (טסטים בסיסיים)**
- בדיקת תשתית הטסטים
- ✅ `basic.test.js`

---

## 📝 **דוגמאות לטסטים**

### 🔐 **טסט Controller**
```javascript
it('should register a client successfully', async () => {
    const mockToken = 'fake-jwt-token';
    AuthService.registerClient.mockResolvedValue(mockToken);

    const clientData = {
        name: 'יוסי כהן',
        email: 'yossi@test.com',
        password: 'Password123!',
        phone: '0501234567'
    };

    const response = await request(app)
        .post('/register-client')
        .send(clientData)
        .expect(201);

    expect(response.body.success).toBe(true);
});
```

### 🛡️ **טסט Middleware**
```javascript
it('should authenticate valid token successfully', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
    });

    authenticateToken(req, res, next);
    expect(req.user).toEqual(mockUser);
});
```

---

## 🎯 **המלצות לכתיבת טסטים**

### ✅ **עקרונות טובים**
1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive names**: שמות מתארים
3. **Single responsibility**: טסט אחד = בדיקה אחת
4. **Mock dependencies**: izolation של הקוד
5. **Test edge cases**: מקרי קצה

### 🚫 **מה להימנע**
1. אל תבדוק implementation details
2. אל תעשה טסטים תלויי סדר
3. אל תשכח לנקות mocks
4. אל תכתוב טסטים ארוכים מדי

---

## 🔧 **הגדרות מתקדמות**

### 📄 **package.json scripts**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### ⚙️ **Jest Configuration**
```json
{
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "services/**/*.js",
      "middleware/**/*.js"
    ]
  }
}
```

---

## 🚀 **הוספת טסטים חדשים**

### 📋 **שלבים**
1. צור קובץ בתיקיית הטסטים המתאימה
2. הוסף `.test.js` לסוף השם
3. import את הקוד שברצונך לבדוק
4. כתוב describe blocks לארגון
5. כתוב it blocks לטסטים ספציפיים

### 🎯 **דוגמה לטסט חדש**
```javascript
describe('New Feature Tests', () => {
    beforeEach(() => {
        // הכנות לכל טסט
    });

    it('should do something specific', () => {
        // הטסט שלך כאן
        expect(result).toBe(expected);
    });
});
```

---

## 📈 **מעקב אחר איכות**

### 🎯 **יעדי Coverage**
- **Controllers**: 90%+ 
- **Services**: 80%+
- **Middleware**: 90%+
- **Utils**: 70%+

### 📊 **מטריקות חשובות**
- **Statements**: כמה שורות קוד נבדקו
- **Branches**: כמה תנאים נבדקו  
- **Functions**: כמה פונקציות נבדקו
- **Lines**: כמה שורות נבדקו

---

## 🐛 **Debugging טסטים**

### 🔍 **פקודות שימושיות**
```bash
# הרצה עם פרטים נוספים
npm test -- --verbose

# הרצה עם watch mode
npm test -- --watch

# הרצת טסט ספציפי
npm test -- --testNamePattern="should login"
```

### 🛠️ **כלי עזר**
- `console.log()` בטסטים
- `jest.only()` להרצת טסט יחיד
- `jest.skip()` לדילוג על טסט
- `.only` ו `.skip` למודולים

---

## 🎉 **מעבר לשלב הבא**

עכשיו שיש לך תשתית טסטים מוכנה, אתה יכול:

1. **להוסיף טסטים נוספים** לcontrollers אחרים
2. **לשפר coverage** בservices
3. **להוסיף E2E tests** עם Cypress
4. **להוסיף performance tests**
5. **לשלב CI/CD** עם הטסטים

---

*נבנה על ידי 🧑‍💻 GitHub Copilot*

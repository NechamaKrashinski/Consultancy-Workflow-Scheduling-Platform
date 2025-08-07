// טסט בסיסי לוידוא שהמבנה עובד
describe('Basic Test Suite', () => {
    it('should run a simple test', () => {
        expect(1 + 1).toBe(2);
    });

    it('should test string operations', () => {
        const testString = 'שלום עולם';
        expect(testString).toContain('שלום');
        expect(testString.length).toBeGreaterThan(0);
    });

    it('should test async operations', async () => {
        const promise = new Promise(resolve => {
            setTimeout(() => resolve('success'), 100);
        });

        const result = await promise;
        expect(result).toBe('success');
    });

    it('should test object properties', () => {
        const user = {
            name: 'טסט משתמש',
            email: 'test@example.com',
            role: 'client'
        };

        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user.role).toBe('client');
    });

    it('should test arrays', () => {
        const roles = ['client', 'manager', 'consultant'];
        
        expect(roles).toHaveLength(3);
        expect(roles).toContain('client');
        expect(roles).toContain('manager');
        expect(roles[0]).toBe('client');
    });
});

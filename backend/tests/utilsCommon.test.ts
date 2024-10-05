it('should generate code', () => {
    const code = generateReferralCode('user123456');
    console.log(code);
    expect(code).toBeDefined();
});

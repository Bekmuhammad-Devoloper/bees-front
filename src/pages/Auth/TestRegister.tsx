import React from 'react';

const TestRegister: React.FC = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', color: 'green' }}>✅ REGISTER PAGE ISHLAYAPTI!</h1>
      <p>Agar bu yozuvni ko'rsangiz, route to'g'ri ishlayapti.</p>
      <a href="/auth/login" style={{ color: 'blue' }}>Login'ga qaytish</a>
    </div>
  );
};

export default TestRegister;

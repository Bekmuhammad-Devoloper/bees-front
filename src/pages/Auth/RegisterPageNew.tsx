import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const RegisterPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [phone, setPhone] = useState('+998');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhone = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+998')) cleaned = '+998' + cleaned.replace('+', '').replace('998', '');
    return cleaned.slice(0, 13);
  };

  const handleSendOtp = async () => {
    if (phone.length !== 13) { 
      toast.error("Telefon raqamni to'liq kiriting"); 
      return; 
    }
    if (name.trim().length < 2) { 
      toast.error('Ismingizni kiriting'); 
      return; 
    }
    try {
      setLoading(true);
      await authService.register({ 
        phone, 
        name: name.trim(), 
        address: address.trim() || undefined 
      });
      toast.success('SMS kod yuborildi!');
      setStep('otp');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error("6 xonali kodni kiriting");
      return;
    }
    try {
      setLoading(true);
      const data = await authService.verifyRegister({ phone, code });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Kod noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-4 p-2">
          <img src="/logo.jpg" alt="Bees Medical" className="w-full h-full object-cover rounded-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Ro'yxatdan o'tish</h1>
        <p className="text-amber-100 text-sm">Yangi akkaunt yarating</p>
      </div>
      
      <div className="bg-white rounded-t-[2.5rem] px-6 py-8 shadow-2xl">
        {step === 'info' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon raqam</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ism familiya</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="To'liq ismingiz"
                className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manzil (ixtiyoriy)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tuman, mahalla..."
                className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg"
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || phone.length < 13 || name.trim().length < 2}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all text-lg"
            >
              {loading ? 'Yuborilmoqda...' : 'Davom etish'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-4">{phone} raqamiga kod yuborildi</p>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length < 6}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all text-lg"
            >
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('info'); setOtp(['', '', '', '', '', '']); }}
              className="w-full py-3 text-amber-600 font-medium"
            >
              Orqaga
            </button>
            {countdown > 0 ? (
              <p className="text-center text-gray-500 text-sm">Qayta yuborish: {countdown} soniya</p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full text-center text-amber-600 font-medium"
              >
                Qayta yuborish
              </button>
            )}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Akkauntingiz bormi?{' '}
            <a href="/auth/login" className="text-amber-600 font-semibold">Kirish</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPageNew;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneIcon, UserIcon, MapPinIcon, ArrowRightIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui';
import { authService } from '../../services';
import { useAuthStore, useAppStore } from '../../store';
import toast from 'react-hot-toast';

const translations = {
  uz: {
    pageTitle: "Ro'yxatdan o'tish",
    newAccount: 'Yangi akkaunt',
    enterInfo: "Ma'lumotlaringizni kiriting",
    phoneLabel: 'Telefon raqam',
    nameLabel: 'Ism familiya',
    namePlaceholder: "To'liq ismingiz",
    addressLabel: 'Manzil (ixtiyoriy)',
    addressPlaceholder: 'Tuman, mahalla...',
    continue: 'Davom etish',
    sendCode: 'Kod yuborish',
    enterCode: 'SMS kodni kiriting',
    codeSentTo: 'Kod yuborildi:',
    verifyAndRegister: 'Tasdiqlash',
    resendCode: 'Qayta yuborish',
    resendIn: 'Qayta yuborish',
    seconds: 'soniya',
    changePhone: 'Raqamni o\'zgartirish',
    hasAccount: 'Akkauntingiz bormi?',
    login: 'Kirish',
    enterFullPhone: "Telefon raqamni to'liq kiriting",
    enterName: 'Ismingizni kiriting',
    enterValidCode: "6 xonali kodni kiriting",
    codeSent: 'SMS kod yuborildi!',
    registerSuccess: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
    errorOccurred: 'Xatolik yuz berdi',
    wrongCode: "Kod noto'g'ri",
  },
  ru: {
    pageTitle: 'Регистрация',
    newAccount: 'Новый аккаунт',
    enterInfo: 'Введите ваши данные',
    phoneLabel: 'Номер телефона',
    nameLabel: 'Имя и фамилия',
    namePlaceholder: 'Ваше полное имя',
    addressLabel: 'Адрес (необязательно)',
    addressPlaceholder: 'Район, махалля...',
    continue: 'Продолжить',
    sendCode: 'Отправить код',
    enterCode: 'Введите SMS код',
    codeSentTo: 'Код отправлен на:',
    verifyAndRegister: 'Подтвердить',
    resendCode: 'Отправить снова',
    resendIn: 'Повторно через',
    seconds: 'сек',
    changePhone: 'Изменить номер',
    hasAccount: 'Уже есть аккаунт?',
    login: 'Войти',
    enterFullPhone: 'Введите полный номер телефона',
    enterName: 'Введите ваше имя',
    enterValidCode: 'Введите 6-значный код',
    codeSent: 'SMS код отправлен!',
    registerSuccess: 'Регистрация успешна!',
    errorOccurred: 'Произошла ошибка',
    wrongCode: 'Неверный код',
  },
};

const getRoleRedirectPath = (role: string): string => {
  const routes: Record<string, string> = { admin: '/admin', doctor: '/doctor', reception: '/reception', driver: '/driver', user: '/' };
  return routes[role] || '/';
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;
  
  const [phone, setPhone] = useState((location.state as any)?.phone || '+998');
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
      toast.error(t.enterFullPhone); 
      return; 
    }
    if (name.trim().length < 2) { 
      toast.error(t.enterName); 
      return; 
    }
    try {
      setLoading(true);
      // Register user first (this will send OTP)
      await authService.register({ 
        phone, 
        name: name.trim(), 
        address: address.trim() || undefined 
      });
      toast.success(t.codeSent);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t.errorOccurred;
      
      // Agar allaqachon ro'yxatdan o'tgan bo'lsa, login sahifasiga yo'naltirish
      if (errorMessage.includes('allaqachon') || errorMessage.includes('already')) {
        toast.error('Bu raqam allaqachon ro\'yxatdan o\'tgan. Tizimga kiring.');
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1500);
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
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
      toast.error(t.enterValidCode);
      return;
    }
    try {
      setLoading(true);
      console.log('🔵 Verifying OTP:', { phone, code });
      // Verify OTP and complete registration (user is created here)
      const data = await authService.verifyRegister({ phone, code });
      console.log('🟢 Register verify response:', data);
      
      // Backend accessToken qaytaradi - user bor bo'lsa login qilish
      if (data.accessToken) {
        if (data.user) {
          login(data.user, data.accessToken, data.refreshToken);
          toast.success(data.message || t.registerSuccess);
          const redirectPath = getRoleRedirectPath(data.user.role);
          console.log('🟢 Redirecting to:', redirectPath);
          navigate(redirectPath);
        } else {
          // Faqat token bo'lsa ham saytga o'tkazish
          toast.success(data.message || t.registerSuccess);
          window.location.href = '/';
        }
      } else {
        // Agar hech narsa qaytmasa ham, muvaffaqiyatli deb hisoblaymiz
        // chunki backend user yaratgan
        toast.success('Muvaffaqiyatli! Tizimga kiring.');
        window.location.href = '/auth/login';
      }
    } catch (error: any) {
      console.error('❌ Verify OTP error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || t.wrongCode;
      console.error('❌ Error message to show:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      await authService.sendOtp(phone);
      toast.success(t.codeSent);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setStep('info');
    setOtp(['', '', '', '', '', '']);
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      {/* Simple Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          title="Orqaga"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{t.pageTitle}</h1>
      </div>
      
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center mb-6 pt-4">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
            <img src="/male-doctor.png" alt="Doctor" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.newAccount}</h1>
          <p className="text-gray-600 mt-1">{t.enterInfo}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
          {step === 'info' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.nameLabel}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={t.namePlaceholder} 
                    className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-400 focus:bg-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.phoneLabel}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <PhoneIcon className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(formatPhone(e.target.value))} 
                    placeholder="+998 XX XXX XX XX" 
                    className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-400 focus:bg-white focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.addressLabel}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder={t.addressPlaceholder} 
                    className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-400 focus:bg-white focus:outline-none" 
                  />
                </div>
              </div>

              <Button 
                fullWidth 
                size="lg" 
                loading={loading} 
                onClick={handleSendOtp} 
                disabled={name.trim().length < 2 || phone.length !== 13} 
                className="!bg-gradient-to-r !from-green-500 !to-emerald-500 !rounded-2xl !py-4 !text-lg !font-semibold !mt-6"
              >
                <span className="flex items-center justify-center gap-2">
                  {t.sendCode}
                  <ArrowRightIcon className="w-5 h-5" />
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-gray-600">{t.codeSentTo}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{phone}</p>
                <button 
                  onClick={handleChangePhone}
                  className="text-amber-600 text-sm font-medium mt-2 hover:underline"
                >
                  {t.changePhone}
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">{t.enterCode}</label>
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
                      aria-label={`OTP digit ${index + 1}`}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:bg-white focus:outline-none transition-colors"
                    />
                  ))}
                </div>
              </div>

              <Button 
                fullWidth 
                size="lg" 
                loading={loading} 
                onClick={handleVerifyOtp} 
                disabled={otp.join('').length !== 6} 
                className="!bg-gradient-to-r !from-green-500 !to-emerald-500 !rounded-2xl !py-4 !text-lg !font-semibold"
              >
                {t.verifyAndRegister}
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-600">
                    {t.resendIn} <span className="font-semibold text-amber-600">{countdown}</span> {t.seconds}
                  </p>
                ) : (
                  <button 
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 mx-auto text-amber-600 font-medium hover:text-amber-700"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    {t.resendCode}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 pb-4">
          <p className="text-gray-600">{t.hasAccount}</p>
          <button 
            onClick={() => navigate('/auth/login')} 
            className="mt-2 inline-flex items-center gap-2 text-amber-600 font-semibold"
          >
            {t.login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneIcon, KeyIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui';
import { Header } from '../../components/layout';
import { authService } from '../../services';
import { useAuthStore, useAppStore } from '../../store';
import toast from 'react-hot-toast';

type Step = 'phone' | 'otp' | 'newPassword';

const translations = {
  uz: {
    pageTitle: 'Parolni tiklash',
    title: 'Parolni tiklash',
    enterPhone: 'Telefon raqamingizni kiriting',
    enterCode: 'Tasdiqlash kodini kiriting',
    enterNewPassword: 'Yangi parol kiriting',
    phoneLabel: 'Telefon raqam',
    codeLabel: 'SMS kod',
    newPasswordLabel: 'Yangi parol',
    confirmPasswordLabel: 'Parolni tasdiqlang',
    sendCode: 'Kod yuborish',
    verify: 'Tasdiqlash',
    resetPassword: 'Parolni yangilash',
    resendIn: 'Qayta yuborish:',
    resendCode: 'Kodni qayta yuborish',
    changeNumber: "Raqamni o'zgartirish",
    backToLogin: 'Kirishga qaytish',
    enterFullPhone: "Telefon raqamni to'liq kiriting",
    enter6Digit: '6 xonali kodni kiriting',
    enterPassword: 'Parolni kiriting (kamida 6 ta belgi)',
    passwordsNotMatch: 'Parollar mos kelmadi',
    codeSent: 'SMS kod yuborildi',
    passwordResetSuccess: 'Parol muvaffaqiyatli yangilandi!',
    errorOccurred: 'Xatolik yuz berdi',
    codeResent: 'Kod qayta yuborildi',
  },
  ru: {
    pageTitle: 'Восстановление пароля',
    title: 'Восстановление пароля',
    enterPhone: 'Введите номер телефона',
    enterCode: 'Введите код подтверждения',
    enterNewPassword: 'Введите новый пароль',
    phoneLabel: 'Номер телефона',
    codeLabel: 'SMS код',
    newPasswordLabel: 'Новый пароль',
    confirmPasswordLabel: 'Подтвердите пароль',
    sendCode: 'Отправить код',
    verify: 'Подтвердить',
    resetPassword: 'Обновить пароль',
    resendIn: 'Отправить снова:',
    resendCode: 'Отправить код снова',
    changeNumber: 'Изменить номер',
    backToLogin: 'Вернуться к входу',
    enterFullPhone: 'Введите полный номер телефона',
    enter6Digit: 'Введите 6-значный код',
    enterPassword: 'Введите пароль (минимум 6 символов)',
    passwordsNotMatch: 'Пароли не совпадают',
    codeSent: 'SMS код отправлен',
    passwordResetSuccess: 'Пароль успешно обновлен!',
    errorOccurred: 'Произошла ошибка',
    codeResent: 'Код отправлен повторно',
  },
};

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
    try {
      setLoading(true);
      await authService.sendOtp(phone);
      setStep('otp');
      setCountdown(60);
      toast.success(t.codeSent);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (code.length !== 6) {
      toast.error(t.enter6Digit);
      return;
    }
    setStep('newPassword');
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error(t.enterPassword);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t.passwordsNotMatch);
      return;
    }
    try {
      setLoading(true);
      const data = await authService.resetPassword(phone, code, newPassword);
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(t.passwordResetSuccess);
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await authService.sendOtp(phone);
      setCountdown(60);
      toast.success(t.codeResent);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.errorOccurred);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <Header title={t.pageTitle} showBack />

      <div className="p-4 max-w-md mx-auto">
        <div className="text-center mb-8 pt-4">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LockClosedIcon className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">
            {step === 'phone' && t.enterPhone}
            {step === 'otp' && t.enterCode}
            {step === 'newPassword' && t.enterNewPassword}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-6">
          {['phone', 'otp', 'newPassword'].map((s, index) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-amber-500 text-white' : index < ['phone', 'otp', 'newPassword'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {index < ['phone', 'otp', 'newPassword'].indexOf(step) ? '✓' : index + 1}
              </div>
              {index < 2 && <div className={`w-10 h-1 mx-1 rounded ${index < ['phone', 'otp', 'newPassword'].indexOf(step) ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
          {step === 'phone' && (
            <div className="space-y-4">
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
              <Button fullWidth size="lg" loading={loading} onClick={handleSendOtp} disabled={phone.length !== 13} className="!bg-gradient-to-r !from-amber-500 !to-yellow-500 !rounded-2xl !py-4 !font-semibold">
                {t.sendCode}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center p-3 bg-green-50 rounded-xl mb-2">
                <span className="text-green-700 font-medium">{phone}</span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.codeLabel}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <KeyIcon className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-bold tracking-widest text-center focus:border-amber-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
              <Button fullWidth size="lg" onClick={handleVerifyOtp} disabled={code.length !== 6} className="!bg-gradient-to-r !from-amber-500 !to-yellow-500 !rounded-2xl !py-4 !font-semibold">
                {t.verify}
              </Button>
              <div className="text-center">
                {countdown > 0 ? (
                  <span className="text-gray-600">{t.resendIn} <span className="font-bold text-amber-600">{countdown}s</span></span>
                ) : (
                  <button onClick={handleResendOtp} className="text-amber-600 font-semibold">{t.resendCode}</button>
                )}
              </div>
              <button onClick={() => { setStep('phone'); setCode(''); }} className="w-full text-center text-gray-600 hover:text-gray-700">
                {t.changeNumber}
              </button>
            </div>
          )}

          {step === 'newPassword' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.newPasswordLabel}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <LockClosedIcon className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full pl-14 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-400 focus:bg-white focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.confirmPasswordLabel}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <LockClosedIcon className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Parolni qaytadan kiriting"
                    className="w-full pl-14 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-400 focus:bg-white focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button fullWidth size="lg" loading={loading} onClick={handleResetPassword} disabled={newPassword.length < 6 || newPassword !== confirmPassword} className="!bg-gradient-to-r !from-green-500 !to-emerald-500 !rounded-2xl !py-4 !font-semibold">
                {t.resetPassword}
              </Button>
            </div>
          )}
        </div>


        <div className="text-center mt-6">
          <button onClick={() => navigate('/auth/login')} className="text-amber-600 font-semibold">
            {t.backToLogin}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

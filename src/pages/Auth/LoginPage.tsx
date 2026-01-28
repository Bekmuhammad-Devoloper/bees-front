import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const sendOtpMutation = useMutation({
    mutationFn: authService.sendLoginOtp,
    onSuccess: () => {
      toast.success('Kod yuborildi!');
      setStep('otp');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: any) => {
      console.log('Login success data:', data);
      const authData = data.data || data;
      if (authData.user && authData.accessToken) {
        login(authData.user, authData.accessToken, authData.refreshToken || '');
        toast.success('Muvaffaqiyatli kirdingiz!');
        navigate('/');
      } else {
        console.error('Invalid auth data:', authData);
        toast.error('Login ma\'lumotlari noto\'g\'ri');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Xatolik yuz berdi';
      toast.error(message);
    },
  });

  const isLoading = sendOtpMutation.isPending || loginMutation.isPending;

  const handleSendOtp = () => {
    if (phone.length < 13) {
      toast.error('Telefon raqamni toliq kiriting');
      return;
    }
    sendOtpMutation.mutate(phone);
  };

  const handleLogin = () => {
    if (code.length < 4) {
      toast.error('Kodni toliq kiriting');
      return;
    }
    loginMutation.mutate({ phone, code });
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 flex flex-col'>
      <div className='flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8'>
        <div className='w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-4 p-2'>
          <img src='/logo.jpg' alt='Bees Medical' className='w-full h-full object-cover rounded-2xl' />
        </div>
        <h1 className='text-3xl font-bold text-white mb-1'>Bees Medical</h1>
        <p className='text-amber-100 text-sm'>Sogliqqa birinchi qadam</p>
      </div>
      <div className='bg-white rounded-t-[2.5rem] px-6 py-8 shadow-2xl'>
        <h2 className='text-xl font-semibold text-black-neon text-center mb-6'>
          {step === 'phone' ? 'Kirish' : 'Tasdiqlash'}
        </h2>
        {step === 'phone' ? (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Telefon raqam</label>
              <input type='tel' value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='+998 90 123 45 67' className='w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg' />
            </div>
            <button type='button' onClick={handleSendOtp} disabled={isLoading || phone.length < 13} className='w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all text-lg'>
              {sendOtpMutation.isPending ? 'Yuborilmoqda...' : 'Davom etish'}
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            <p className='text-sm text-gray-600 text-center mb-4'>{phone} raqamiga kod yuborildi</p>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>SMS kod</label>
              <input type='text' value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder='123456' className='w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg text-center tracking-[0.5em] font-mono' autoFocus />
            </div>
            <button type='button' onClick={handleLogin} disabled={isLoading || code.length < 4} className='w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all text-lg'>
              {loginMutation.isPending ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
            <button type='button' onClick={() => { setStep('phone'); setCode(''); }} className='w-full py-3 text-amber-600 font-medium'>Orqaga</button>
          </div>
        )}
        <div className='mt-6 text-center'>
          <p className='text-gray-600 text-sm'>Hisobingiz yoqmi? {' '}
            <a href='/auth/register' className='text-amber-600 font-semibold hover:underline'>
              Royxatdan otish
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

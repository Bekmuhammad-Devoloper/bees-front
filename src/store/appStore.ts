import { create } from 'zustand';

type Language = 'uz' | 'ru';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface AppState {
  language: Language;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  isLoading: boolean;
  telegramUser: TelegramUser | null;

  // Actions
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setTelegramUser: (user: TelegramUser | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'uz',
  sidebarOpen: false,
  theme: 'light',
  isLoading: false,
  telegramUser: null,

  setLanguage: (language) => set({ language }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setLoading: (isLoading) => set({ isLoading }),
  setTelegramUser: (telegramUser) => set({ telegramUser }),
}));

// Translations
export const translations = {
  uz: {
    // Common
    home: 'Bosh sahifa',
    doctors: 'Shifokorlar',
    appointments: 'Qabullar',
    services: 'Xizmatlar',
    profile: 'Profil',
    notifications: 'Bildirishnomalar',
    settings: 'Sozlamalar',
    logout: 'Chiqish',
    search: 'Qidirish',
    loading: 'Yuklanmoqda...',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',
    delete: 'O\'chirish',
    edit: 'Tahrirlash',
    view: 'Ko\'rish',
    back: 'Orqaga',
    next: 'Keyingi',
    submit: 'Yuborish',
    close: 'Yopish',

    // Auth
    login: 'Kirish',
    register: 'Ro\'yxatdan o\'tish',
    phone: 'Telefon raqam',
    name: 'Ism',
    enterPhone: 'Telefon raqamingizni kiriting',
    enterCode: 'SMS kodni kiriting',
    sendCode: 'Kod yuborish',
    verifyCode: 'Kodni tekshirish',
    resendCode: 'Kodni qayta yuborish',

    // Doctors
    allDoctors: 'Barcha shifokorlar',
    specialty: 'Mutaxassislik',
    experience: 'Tajriba',
    rating: 'Reyting',
    years: 'yil',
    bookAppointment: 'Qabulga yozilish',
    availableSlots: 'Bo\'sh vaqtlar',
    selectDate: 'Sanani tanlang',
    selectTime: 'Vaqtni tanlang',

    // Appointments
    myAppointments: 'Mening qabullarim',
    upcomingAppointments: 'Kelgusi qabullar',
    pastAppointments: 'O\'tgan qabullar',
    appointmentDetails: 'Qabul tafsilotlari',
    appointmentDate: 'Sana',
    appointmentTime: 'Vaqt',
    reason: 'Sabab',
    notes: 'Izohlar',
    cancelAppointment: 'Qabulni bekor qilish',

    // Status
    pending: 'Kutilmoqda',
    confirmed: 'Tasdiqlangan',
    completed: 'Tugallangan',
    cancelled: 'Bekor qilingan',
    inProgress: 'Jarayonda',

    // Categories
    categories: 'Kategoriyalar',
    allCategories: 'Barcha kategoriyalar',

    // Services
    laboratory: 'Laboratoriya',
    diagnostic: 'Diagnostika',
    homeVisit: 'Uyga chaqiruv',
    consultation: 'Konsultatsiya',

    // Profile
    personalInfo: 'Shaxsiy ma\'lumotlar',
    editProfile: 'Profilni tahrirlash',
    changePassword: 'Parolni o\'zgartirish',

    // Notifications
    noNotifications: 'Bildirishnomalar yo\'q',
    markAsRead: 'O\'qilgan deb belgilash',
    markAllAsRead: 'Barchasini o\'qilgan deb belgilash',

    // Errors
    error: 'Xatolik',
    networkError: 'Tarmoq xatosi',
    serverError: 'Server xatosi',
    notFound: 'Topilmadi',
    unauthorized: 'Ruxsat yo\'q',

    // Success
    success: 'Muvaffaqiyatli',
    saved: 'Saqlandi',
    deleted: 'O\'chirildi',
    appointmentCreated: 'Qabul yaratildi',
    appointmentCancelled: 'Qabul bekor qilindi',
  },
  ru: {
    // Common
    home: 'Главная',
    doctors: 'Врачи',
    appointments: 'Приёмы',
    services: 'Услуги',
    profile: 'Профиль',
    notifications: 'Уведомления',
    settings: 'Настройки',
    logout: 'Выход',
    search: 'Поиск',
    loading: 'Загрузка...',
    save: 'Сохранить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    delete: 'Удалить',
    edit: 'Редактировать',
    view: 'Просмотр',
    back: 'Назад',
    next: 'Далее',
    submit: 'Отправить',
    close: 'Закрыть',

    // Auth
    login: 'Вход',
    register: 'Регистрация',
    phone: 'Номер телефона',
    name: 'Имя',
    enterPhone: 'Введите номер телефона',
    enterCode: 'Введите SMS код',
    sendCode: 'Отправить код',
    verifyCode: 'Проверить код',
    resendCode: 'Отправить повторно',

    // Doctors
    allDoctors: 'Все врачи',
    specialty: 'Специализация',
    experience: 'Опыт',
    rating: 'Рейтинг',
    years: 'лет',
    bookAppointment: 'Записаться на приём',
    availableSlots: 'Свободное время',
    selectDate: 'Выберите дату',
    selectTime: 'Выберите время',

    // Appointments
    myAppointments: 'Мои приёмы',
    upcomingAppointments: 'Предстоящие приёмы',
    pastAppointments: 'Прошедшие приёмы',
    appointmentDetails: 'Детали приёма',
    appointmentDate: 'Дата',
    appointmentTime: 'Время',
    reason: 'Причина',
    notes: 'Примечания',
    cancelAppointment: 'Отменить приём',

    // Status
    pending: 'Ожидание',
    confirmed: 'Подтверждено',
    completed: 'Завершено',
    cancelled: 'Отменено',
    inProgress: 'В процессе',

    // Categories
    categories: 'Категории',
    allCategories: 'Все категории',

    // Services
    laboratory: 'Лаборатория',
    diagnostic: 'Диагностика',
    homeVisit: 'Вызов на дом',
    consultation: 'Консультация',

    // Profile
    personalInfo: 'Личная информация',
    editProfile: 'Редактировать профиль',
    changePassword: 'Изменить пароль',

    // Notifications
    noNotifications: 'Нет уведомлений',
    markAsRead: 'Отметить как прочитанное',
    markAllAsRead: 'Отметить всё как прочитанное',

    // Errors
    error: 'Ошибка',
    networkError: 'Ошибка сети',
    serverError: 'Ошибка сервера',
    notFound: 'Не найдено',
    unauthorized: 'Нет доступа',

    // Success
    success: 'Успешно',
    saved: 'Сохранено',
    deleted: 'Удалено',
    appointmentCreated: 'Приём создан',
    appointmentCancelled: 'Приём отменён',
  },
};

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  return translations[language];
};

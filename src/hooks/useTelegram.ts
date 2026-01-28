import { useEffect, useCallback } from 'react';

/**
 * Hook to use Telegram WebApp MainButton
 */
export function useTelegramMainButton(
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isVisible?: boolean;
  }
) {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) return;

    const button = tg.MainButton;
    
    button.setParams({
      text,
      color: options?.color,
      text_color: options?.textColor,
      is_active: options?.isActive ?? true,
      is_visible: options?.isVisible ?? true,
    });

    button.onClick(onClick);
    button.show();

    return () => {
      button.offClick(onClick);
      button.hide();
    };
  }, [tg, text, onClick, options?.color, options?.textColor, options?.isActive, options?.isVisible]);

  const showProgress = useCallback(() => {
    tg?.MainButton.showProgress();
  }, [tg]);

  const hideProgress = useCallback(() => {
    tg?.MainButton.hideProgress();
  }, [tg]);

  const setActive = useCallback((active: boolean) => {
    if (active) {
      tg?.MainButton.enable();
    } else {
      tg?.MainButton.disable();
    }
  }, [tg]);

  return { showProgress, hideProgress, setActive };
}

/**
 * Hook to use Telegram WebApp BackButton
 */
export function useTelegramBackButton(onClick: () => void) {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) return;

    const button = tg.BackButton;
    button.onClick(onClick);
    button.show();

    return () => {
      button.offClick(onClick);
      button.hide();
    };
  }, [tg, onClick]);
}

/**
 * Hook to use Telegram HapticFeedback
 */
export function useTelegramHaptic() {
  const tg = window.Telegram?.WebApp;

  const impact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    tg?.HapticFeedback.impactOccurred(style);
  }, [tg]);

  const notification = useCallback((type: 'error' | 'success' | 'warning') => {
    tg?.HapticFeedback.notificationOccurred(type);
  }, [tg]);

  const selection = useCallback(() => {
    tg?.HapticFeedback.selectionChanged();
  }, [tg]);

  return { impact, notification, selection };
}

/**
 * Hook to use Telegram WebApp theme
 */
export function useTelegramTheme() {
  const tg = window.Telegram?.WebApp;

  return {
    colorScheme: tg?.colorScheme ?? 'light',
    themeParams: tg?.themeParams ?? {},
    isDark: tg?.colorScheme === 'dark',
  };
}

/**
 * Hook to show Telegram popup
 */
export function useTelegramPopup() {
  const tg = window.Telegram?.WebApp;

  const showAlert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      if (tg) {
        tg.showAlert(message, resolve);
      } else {
        alert(message);
        resolve();
      }
    });
  }, [tg]);

  const showConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      if (tg) {
        tg.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  }, [tg]);

  return { showAlert, showConfirm };
}

/**
 * Hook to open links in Telegram
 */
export function useTelegramLinks() {
  const tg = window.Telegram?.WebApp;

  const openLink = useCallback((url: string, tryInstantView = false) => {
    if (tg) {
      tg.openLink(url, { try_instant_view: tryInstantView });
    } else {
      window.open(url, '_blank');
    }
  }, [tg]);

  const openTelegramLink = useCallback((url: string) => {
    if (tg) {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [tg]);

  return { openLink, openTelegramLink };
}

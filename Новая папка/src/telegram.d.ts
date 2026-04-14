interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
    }
  }
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  expand(): void
  ready(): void
  close(): void
  MainButton: {
    text: string
    show(): void
    hide(): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    isVisible: boolean
    isActive: boolean
    setText(text: string): void
    setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void
  }
  BackButton: {
    show(): void
    hide(): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
  }
  showAlert(message: string, cb?: () => void): void
  showConfirm(message: string, cb?: (ok: boolean) => void): void
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp
  }
}

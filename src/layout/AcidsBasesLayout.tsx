import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

interface AcidsBasesLayoutProps {
  children: ReactNode;
}

const DEFAULT_CONTENT_SIZE = { width: 1420, height: 700 } as const;
const PHONE_CONTENT_WIDTH_MULTIPLIER = 1;
const IOS_PHONE_CONTENT_EXTRA_HEIGHT_PX = 20;
const IOS_SCROLL_TOP_OFFSET_PX = 60;
const FULLSCREEN_DISMISS_KEY = 'acids.fullscreenPromptDismissed';
const IOS_SCROLL_HINT_SHOWN_KEY = 'acids.iosScrollHintShown';
const IOS_SCROLL_OFFSET_KEY = 'acids.iosScrollOffset';

const isPhoneDevice = () => {
  const ua = navigator.userAgent || '';
  const phoneUa = /iPhone|Android.*Mobile|Mobile|iPod/i.test(ua);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return phoneUa && coarse;
};

const isIOSPhoneDevice = () => {
  const ua = navigator.userAgent || '';
  const iPhoneUa = /iPhone|iPod/i.test(ua);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return iPhoneUa && coarse;
};

const isAndroidPhoneDevice = () => {
  const ua = navigator.userAgent || '';
  const androidUa = /Android/i.test(ua);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return androidUa && coarse;
};

const getViewportSize = () => {
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
  };
};

const getLayoutMetrics = () => {
  const viewport = getViewportSize();
  const phoneOnly = isPhoneDevice();
  const iOSPhone = isIOSPhoneDevice();
  const isLandscape = viewport.width > viewport.height;
  const useIOSScrollShim = iOSPhone && isLandscape;
  const phoneWidth = Math.round(DEFAULT_CONTENT_SIZE.width * PHONE_CONTENT_WIDTH_MULTIPLIER);
  const contentSize = iOSPhone
    ? { width: phoneWidth, height: DEFAULT_CONTENT_SIZE.height + IOS_PHONE_CONTENT_EXTRA_HEIGHT_PX }
    : phoneOnly
      ? { width: phoneWidth, height: DEFAULT_CONTENT_SIZE.height }
      : DEFAULT_CONTENT_SIZE;

  let scale: number | undefined;
  if (viewport.width < contentSize.width || viewport.height < contentSize.height) {
    scale = Math.min(viewport.width / contentSize.width, viewport.height / contentSize.height);
  }

  return { scale, phoneOnly, contentSize, viewport, useIOSScrollShim };
};

const isInFullscreen = () =>
  Boolean(document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement);

const AcidsBasesLayout = ({ children }: AcidsBasesLayoutProps) => {
  const location = useLocation();
  const initialMetrics = getLayoutMetrics();
  const [scale, setScale] = useState<number | undefined>(initialMetrics.scale);
  const [contentSize, setContentSize] = useState(initialMetrics.contentSize);
  const [useIOSScrollShim, setUseIOSScrollShim] = useState(initialMetrics.useIOSScrollShim);
  const [mobilePromptMode, setMobilePromptMode] = useState<'none' | 'fullscreen' | 'iosScroll'>('none');
  const [phoneOnly, setPhoneOnly] = useState(() => initialMetrics.phoneOnly);

  useEffect(() => {
    const handleResize = () => {
      const metrics = getLayoutMetrics();

      setScale(metrics.scale);
      setPhoneOnly(metrics.phoneOnly);
      setContentSize(metrics.contentSize);
      setUseIOSScrollShim(metrics.useIOSScrollShim);

      if (metrics.viewport.width < metrics.viewport.height && metrics.viewport.width < 1024) {
        Swal.fire({
          title: 'Please use Landscape Mode!',
          text: 'For the best experience, please rotate your device to landscape mode.',
          icon: 'warning',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          customClass: {
            confirmButton: 'swal-btn-ok',
          },
        });
      } else {
        Swal.close();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!useIOSScrollShim) {
      return;
    }

    const prevBodyOverflowY = document.body.style.overflowY;
    const prevHtmlOverflowY = document.documentElement.style.overflowY;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlHeight = document.documentElement.style.height;

    // iOS Safari hides browser chrome only when the page itself scrolls.
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';

    return () => {
      document.body.style.overflowY = prevBodyOverflowY;
      document.documentElement.style.overflowY = prevHtmlOverflowY;
      document.body.style.height = prevBodyHeight;
      document.documentElement.style.height = prevHtmlHeight;
    };
  }, [useIOSScrollShim]);

  useEffect(() => {
    if (!useIOSScrollShim) return;

    let frameId = 0;
    const persistOffset = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        try {
          window.sessionStorage.setItem(IOS_SCROLL_OFFSET_KEY, String(window.scrollY));
        } catch {
          // no-op
        }
      });
    };

    window.addEventListener('scroll', persistOffset, { passive: true });

    return () => {
      window.removeEventListener('scroll', persistOffset);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [useIOSScrollShim]);

  useEffect(() => {
    if (!useIOSScrollShim) return;

    const raw = window.sessionStorage.getItem(IOS_SCROLL_OFFSET_KEY);
    const savedOffset = raw ? Number(raw) : 0;
    if (!Number.isFinite(savedOffset) || savedOffset <= 0) return;

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        window.scrollTo({ top: savedOffset, behavior: 'auto' });
      });
    });

    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [location.pathname, useIOSScrollShim]);

  useEffect(() => {
    if (!phoneOnly) {
      setMobilePromptMode('none');
      return;
    }

    const isIOS = isIOSPhoneDevice();
    const isAndroid = isAndroidPhoneDevice();

    if (isIOS) {
      const hintAlreadyShown = window.sessionStorage.getItem(IOS_SCROLL_HINT_SHOWN_KEY) === '1';
      if (!hintAlreadyShown) {
        // Mark as shown immediately so it never reappears on route changes or refresh.
        window.sessionStorage.setItem(IOS_SCROLL_HINT_SHOWN_KEY, '1');
        setMobilePromptMode('iosScroll');
      } else {
        setMobilePromptMode('none');
      }
      return;
    }

    if (isAndroid) {
      const dismissed = window.sessionStorage.getItem(FULLSCREEN_DISMISS_KEY) === '1';
      const shouldShow = !dismissed && !isInFullscreen();
      setMobilePromptMode(shouldShow ? 'fullscreen' : 'none');

      const syncPrompt = () => {
        if (isInFullscreen()) {
          setMobilePromptMode('none');
        }
      };

      document.addEventListener('fullscreenchange', syncPrompt);
      document.addEventListener('webkitfullscreenchange', syncPrompt as EventListener);
      return () => {
        document.removeEventListener('fullscreenchange', syncPrompt);
        document.removeEventListener('webkitfullscreenchange', syncPrompt as EventListener);
      };
    }

    setMobilePromptMode('none');
  }, [phoneOnly]);

  const enableFullscreen = async () => {
    try {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
      setMobilePromptMode('none');
    } catch {
      setMobilePromptMode('none');
    }
  };

  const dismissFullscreenPrompt = () => {
    window.sessionStorage.setItem(FULLSCREEN_DISMISS_KEY, '1');
    setMobilePromptMode('none');
  };

  const dismissIOSScrollPrompt = () => {
    setMobilePromptMode('none');
  };

  return (
    <div
      className="acids-bases-layout"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100vw',
        height: useIOSScrollShim ? `calc(100vh + ${IOS_SCROLL_TOP_OFFSET_PX}px)` : '100dvh',
        justifyContent: 'flex-start',
        overflowX: 'hidden',
        overflowY: useIOSScrollShim ? 'visible' : 'hidden',
        background: 'white',
      }}
    >
      {useIOSScrollShim && <div style={{ height: `${IOS_SCROLL_TOP_OFFSET_PX}px`, flexShrink: 0 }} />}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: phoneOnly ? 'flex-start' : 'center',
          width: '100%',
          height: useIOSScrollShim ? '100vh' : '100%',
        }}
      >
        <div
          style={{
            transformOrigin: 'top center',
            ...(scale
              ? {
                  transform: `scale(${scale})`,
                  WebkitTransform: `scale(${scale})`,
                  MozTransform: `scale(${scale})`,
                  msTransform: `scale(${scale})`,
                }
              : {}),
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              width: `${contentSize.width}px`,
              height: `${contentSize.height}px`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
      {mobilePromptMode !== 'none' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20000,
            background: 'rgba(0,0,0,0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '44px', fontWeight: 700, lineHeight: 1.05 }}>
              {mobilePromptMode === 'iosScroll' ? 'Scroll Down Once' : 'Enter Fullscreen Mode'}
            </h2>
            <p style={{ margin: 0, fontSize: '18px', color: '#d4d4d8', lineHeight: 1.4 }}>
              {mobilePromptMode === 'iosScroll'
                ? 'For the best iPhone experience, scroll down once to hide the browser bar.'
                : 'For the best experience on mobile, please enable fullscreen mode.'}
            </p>
            {mobilePromptMode === 'fullscreen' ? (
              <button
                onClick={enableFullscreen}
                style={{
                  border: 'none',
                  borderRadius: '16px',
                  background: '#ffffff',
                  color: '#111827',
                  fontSize: '20px',
                  fontWeight: 600,
                  padding: '16px 18px',
                  cursor: 'pointer',
                }}
              >
                Enable Fullscreen
              </button>
            ) : null}
            {mobilePromptMode === 'fullscreen' ? (
              <button
                type="button"
                onClick={dismissFullscreenPrompt}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#d4d4d8',
                  fontSize: '18px',
                  textAlign: 'left',
                  padding: 0,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  pointerEvents: 'auto',
                }}
              >
                Continue without fullscreen
              </button>
            ) : (
              <button
                type="button"
                onClick={dismissIOSScrollPrompt}
                style={{
                  border: 'none',
                  borderRadius: '16px',
                  background: '#ffffff',
                  color: '#111827',
                  fontSize: '20px',
                  fontWeight: 600,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  pointerEvents: 'auto',
                  width: '100%',
                }}
              >
                Got it
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcidsBasesLayout;

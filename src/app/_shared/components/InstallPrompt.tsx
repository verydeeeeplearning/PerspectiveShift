"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function emitInstallEvent(type: "pwa_install_prompt_show" | "pwa_install_accept"): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent("perspectiveshift:analytics", {
      detail: { type, payload: { timestamp: Date.now() } },
    }),
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIosHint, setIsIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isIos && !isStandalone) {
      setIsIosHint(true);
      setIsVisible(true);
      emitInstallEvent("pwa_install_prompt_show");
    }

    const handler = (event: Event) => {
      event.preventDefault();
      const typedEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(typedEvent);
      setIsVisible(true);
      emitInstallEvent("pwa_install_prompt_show");
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      emitInstallEvent("pwa_install_accept");
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">앱으로 더 편하게 이용해보세요</p>
      {isIosHint ? (
        <p className="mt-1 text-xs text-gray-600">
          iOS에서는 Safari 공유 버튼에서 <span className="font-medium">홈 화면에 추가</span>를 선택하면 설치할 수 있어요.
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-600">
          Android에서는 설치 버튼으로 홈 화면에 PerspectiveShift를 추가할 수 있어요.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        {!isIosHint && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            설치하기
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

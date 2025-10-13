import React from "react";
import ToggleTheme from "@/components/ToggleTheme";
import { useTranslation } from "react-i18next";
import LangToggle from "@/components/LangToggle";
import Footer from "@/components/template/Footer";
import { AudioCaptureWithTranscription } from "@/components/transcription";
import { createFileRoute } from "@tanstack/react-router";

function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <span>
          <h1 className="font-mono text-4xl font-bold">{t("appName")}</h1>
          <p
            className="text-muted-foreground text-end text-sm uppercase"
            data-testid="pageTitle"
          >
            {t("titleHomePage")}
          </p>
        </span>
        <div className="w-full max-w-2xl">
          <AudioCaptureWithTranscription />
        </div>
        <div className="flex gap-2">
          <LangToggle />
          <ToggleTheme />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});

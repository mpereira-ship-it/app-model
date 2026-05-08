import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predicción de deserción temprana",
  description: "Aplicación académica demostrativa basada en regresión logística ridge para estimar riesgo de deserción temprana universitaria."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

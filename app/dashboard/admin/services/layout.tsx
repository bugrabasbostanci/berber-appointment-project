import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hizmet Yönetimi - Admin Paneli",
  description: "Berber randevu sistemi hizmet yönetimi",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

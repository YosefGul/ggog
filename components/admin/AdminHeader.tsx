"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-800">Admin Paneli</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-neutral-600">
            <span className="font-medium">{user.name || user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </header>
  );
}


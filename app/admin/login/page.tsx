"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login-admin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Yönlendiriliyor...</p>
    </div>
  );
}

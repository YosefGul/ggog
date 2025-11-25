"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Başarıyla abone oldunuz!");
        setEmail("");
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Bir hata oluştu");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Bir hata oluştu");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className="bg-background"
        />
        <Button
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "..." : "Abone Ol"}
        </Button>
      </div>
      {message && (
        <p
          className={`text-sm ${
            status === "success" ? "text-green-400" : "text-destructive"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}


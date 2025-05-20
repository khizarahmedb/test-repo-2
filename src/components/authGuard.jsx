"use client";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null && router.pathname !== "/404") {
      router.push("/404");
    }
  }, [user, router]);

  return <>{user !== null ? children : null}</>;
}

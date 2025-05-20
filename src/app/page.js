"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import images from "@/utils/images";
import { login } from "@/lib/api";
import { useUserStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, setUser } = useUserStore();

  useEffect(() => {
    if (user && user.role) {
      navigateBasedOnRole(user.role_name);
    }
  }, [user]);

  const navigateBasedOnRole = (role) => {
    switch (role) {
      // case "superadmin":
      //   router.push("/superadmin-dashboard");
      //   break;
      case "Admin":
        router.push("/admin-dashboard");
        break;
      // case "agent":
      //   router.push("/agent-dashboard");
      //   break;
      default:
        console.error("Unknown or missing role:", role);
        router.push("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await login({ email, password });
      console.log("Login API Response:", response);

      if (response) {
        setUser(response.body);
        navigateBasedOnRole(response.body.role_name);
      } else {
        setFormError(
          response.message ||
            "Login successful but role information missing or invalid."
        );
        console.warn("Login response did not contain expected role:", response);
        router.push("/");
      }
    } catch (error) {
      console.error("Login API Error:", error);
      setFormError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="items-center w-full">
      <div className="h-screen flex items-center justify-center">
        <div className="h-[810px] flex flex-col justify-start items-center overflow-hidden">
          <div className="flex flex-col justify-center items-center grow w-full px-8 ">
            <div
              className="flex flex-col justify-start items-center w-full gap-8 rounded-[28px] border border-[#5D43E1]
bg-gradient-to-r from-white/20 via-transparent to-white/20
bg-[linear-gradient(119deg,#5D43E1_12.9%,#AB51DE_86.02%)]
shadow-[0px_64px_64px_-32px_rgba(41,15,0,0.56)] backdrop-blur-[5px] p-10"
            >
              <div className="flex flex-col justify-start items-center w-full gap-6 ">
                <div className="text-center flex flex-col justify-start items-center gap-6">
                  <p className="text-white text-3xl">Login</p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full gap-6 rounded-xl"
              >
                <div className="flex flex-col">
                  <input
                    type="email"
                    className="w-[500px] px-3.5 py-2.5 mt-1 placeholder:text-white border-white rounded-lg border-[1px] text-white shadow-sm text-base bg-transparent autofill:bg-transparent focus:bg-transparent"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    className="w-[500px] px-3.5 py-2.5 mt-1 border-white placeholder:text-white rounded-lg border-[1px] text-white shadow-sm text-base"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full text-black text-xl bg-white px-4 py-2.5 rounded-lg shadow-md border-2 border-white font-medium ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>

                {formError && <div className="text-red-500">{formError}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

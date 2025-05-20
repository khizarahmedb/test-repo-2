"use client";
import { adminLogin, userLogin } from "@/utils/axiosInstance";
import images from "@/utils/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // const { user, setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(username, password);
      console.log(response);

      if (response.message === "Login successful") {
        console.log("Login successful:", response);
        setUser(response.body);
        router.push("/dashboard");
        setFormError("");
      }
      // router.push("/hkujjkome");
    } catch (error) {
      console.log(error);

      setFormError(error.response?.data?.message || "Login failed");
    }
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <div className=" items-center w-full">
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
                    type="text"
                    className="w-[500px] px-3.5 py-2.5 mt-1 placeholder:text-white border-white rounded-lg border-[1px] text-white shadow-sm text-base bg-transparent autofill:bg-transparent focus:bg-transparent"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    className="w-[500px] px-3.5 py-2.5 mt-1 border-white placeholder:text-white  rounded-lg  border-[1px] text-white shadow-sm  text-base"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full text-black text-xl bg-white px-4 py-2.5  rounded-lg shadow-md border-2 border-white font-medium ${
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

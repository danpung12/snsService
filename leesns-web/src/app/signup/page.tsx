"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSendEmailCode,
  useSignUp,
  useVerifyEmailCode,
} from "@/hooks/use-auth";
import { getAuthErrorDetails } from "@/lib/auth-error";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type EmailStatus = "success" | "error" | "";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("");
  const [emailStatusMessage, setEmailStatusMessage] = useState("");
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const { mutate: SignUp, isPending: isSigningUp } = useSignUp();
  const { mutate: sendEmailCode, isPending: isSendingEmailCode } =
    useSendEmailCode();
  const { mutate: verifyEmailCode, isPending: isVerifyingEmailCode } =
    useVerifyEmailCode();

  const trimmedEmail = email.trim();
  const trimmedEmailCode = emailCode.trim();

  const getErrorMessage = (error: unknown, fallback: string) => {
    const message = getAuthErrorDetails(error).message;
    return message === "N/A" ? fallback : message;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailCode("");
    setEmailStatus("");
    setEmailStatusMessage("");
    setIsEmailCodeSent(false);
    setIsEmailVerified(false);
    setVerifiedEmail("");
  };

  const handleSendEmailCodeClick = () => {
    if (trimmedEmail === "") {
      toast.error("이메일을 입력해주세요.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("올바른 이메일 형식으로 입력해주세요.");
      return;
    }

    sendEmailCode(
      { email: trimmedEmail },
      {
        onSuccess: (data) => {
          setEmailCode("");
          setEmailStatus("success");
          setEmailStatusMessage(
            "이메일이 발송되었습니다. 메일함을 확인해주세요.",
          );
          setIsEmailCodeSent(true);
          setIsEmailVerified(false);
          setVerifiedEmail("");
          toast.success(data?.message ?? "인증번호가 발송되었습니다.");
        },
        onError: (error) => {
          const message = getErrorMessage(
            error,
            "인증번호 발송에 실패했습니다.",
          );

          setEmailCode("");
          setEmailStatus("error");
          setEmailStatusMessage(message);
          setIsEmailCodeSent(false);
          setIsEmailVerified(false);
          setVerifiedEmail("");
          toast.error(message);
        },
      },
    );
  };

  const handleVerifyEmailCodeClick = () => {
    if (trimmedEmail === "") {
      toast.error("이메일을 입력해주세요.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("올바른 이메일 형식으로 입력해주세요.");
      return;
    }
    if (trimmedEmailCode === "") {
      toast.error("인증번호를 입력해주세요.");
      return;
    }

    verifyEmailCode(
      { email: trimmedEmail, code: trimmedEmailCode },
      {
        onSuccess: (data) => {
          setEmailStatus("success");
          setEmailStatusMessage("이메일 인증이 완료되었습니다.");
          setIsEmailVerified(true);
          setVerifiedEmail(trimmedEmail);
          toast.success(data?.message ?? "이메일 인증이 완료되었습니다.");
        },
        onError: (error) => {
          setIsEmailVerified(false);
          setVerifiedEmail("");
          toast.error(getErrorMessage(error, "인증번호 확인에 실패했습니다."));
        },
      },
    );
  };

  const handleSignUpClick = () => {
    if (trimmedEmail === "") {
      toast.error("이메일을 입력해주세요.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("올바른 이메일 형식으로 입력해주세요.");
      return;
    }
    if (!isEmailVerified || verifiedEmail !== trimmedEmail) {
      toast.error("이메일 인증이 필요합니다.");
      return;
    }
    if (password.trim() === "") {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }
    if (nickname.trim() === "") {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    SignUp(
      { email: trimmedEmail, password, nickname },
      {
        onError: (error) => {
          toast.error(getErrorMessage(error, "회원가입에 실패했습니다."));
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-sm mx-auto">
      <div className="text-xl flex flex-col gap-8 font-bold">회원가입</div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="py-6 pl-10"
              type="email"
              placeholder="example@abc.com"
            />
          </div>
          <Button
            onClick={handleSendEmailCodeClick}
            className="h-12 shrink-0 px-3 text-xs"
            disabled={isSendingEmailCode || isEmailVerified}
            type="button"
            variant="outline"
          >
            {isSendingEmailCode ? "발송 중" : "인증번호 발송"}
          </Button>
        </div>
        {emailStatusMessage && (
          <p
            className={
              emailStatus === "success"
                ? "text-xs text-green-600"
                : "text-xs text-destructive"
            }
          >
            {emailStatusMessage}
          </p>
        )}
        {isEmailCodeSent && !isEmailVerified && (
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center gap-2">
              <Input
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                className="h-9 w-36 px-2 text-sm"
                type="text"
                inputMode="numeric"
                placeholder="인증번호"
              />
              <Button
                onClick={handleVerifyEmailCodeClick}
                className="h-9 shrink-0 px-3 text-xs"
                disabled={isVerifyingEmailCode}
                type="button"
                variant="outline"
              >
                {isVerifyingEmailCode ? "확인 중" : "확인"}
              </Button>
            </div>
          </div>
        )}
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            onChange={(e) => setPassword(e.target.value)}
            className="py-6 pl-10"
            type="password"
            placeholder="비밀번호"
          />
        </div>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            onChange={(e) => setNickname(e.target.value)}
            className="py-6 pl-10"
            type="text"
            placeholder="닉네임"
          />
        </div>
      </div>

      <div>
        <Button
          onClick={handleSignUpClick}
          className="w-full"
          disabled={isSigningUp}
          type="button"
        >
          {isSigningUp ? "회원가입 중" : "회원가입"}
        </Button>
      </div>
      <div>
        <Link className="text-muted-foreground hover:underline" href={"/login"}>
          이미 계정이 있다면? 로그인
        </Link>
      </div>
    </div>
  );
}

"use client";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSendEmailCode,
  useSignUp,
  useVerifyEmailCode,
} from "@/hooks/use-auth";
import { getAuthErrorDetails } from "@/lib/auth-error";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type EmailStatus = "success" | "error" | "";

export default function SignUpPage() {
  const router = useRouter();
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

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
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
            "인증번호를 보냈습니다. 메일함을 확인해주세요.",
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
    <div className="flex min-h-[calc(100dvh-220px)] items-center justify-center py-8">
      <div className="w-full max-w-md">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-4 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={handleBackClick}
        >
          <ArrowLeft className="size-4" />
          뒤로가기
        </Button>

        <section className="w-full rounded-lg border bg-background p-6 shadow-sm md:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40">
              <Image src={logo} alt="서비스 로고" className="h-5 w-auto" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-normal">회원가입</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                새 계정으로 피드와 대화에 참여하세요.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              이메일
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="h-12 pl-10"
                    type="email"
                    placeholder="example@abc.com"
                    autoComplete="email"
                  />
                </div>
                <Button
                  onClick={handleSendEmailCodeClick}
                  className="h-12 shrink-0 px-3 text-xs"
                  disabled={isSendingEmailCode || isEmailVerified}
                  type="button"
                  variant="outline"
                >
                  {isEmailVerified
                    ? "인증완료"
                    : isSendingEmailCode
                      ? "발송 중"
                      : "인증번호"}
                </Button>
              </div>
            </label>

            {emailStatusMessage && (
              <p
                className={
                  emailStatus === "success"
                    ? "flex items-center gap-1 text-xs text-emerald-600"
                    : "text-xs text-destructive"
                }
              >
                {emailStatus === "success" && (
                  <CheckCircle2 className="size-3" />
                )}
                {emailStatusMessage}
              </p>
            )}

            {isEmailCodeSent && !isEmailVerified && (
              <div className="flex items-center gap-2">
                <Input
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className="h-10 flex-1"
                  type="text"
                  inputMode="numeric"
                  placeholder="인증번호"
                />
                <Button
                  onClick={handleVerifyEmailCodeClick}
                  className="h-10 shrink-0"
                  disabled={isVerifyingEmailCode}
                  type="button"
                  variant="secondary"
                >
                  {isVerifyingEmailCode ? "확인 중" : "확인"}
                </Button>
              </div>
            )}

            <label className="flex flex-col gap-2 text-sm font-medium">
              비밀번호
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10"
                  type="password"
                  placeholder="password"
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              닉네임
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-12 pl-10"
                  type="text"
                  placeholder="닉네임"
                  autoComplete="nickname"
                />
              </div>
            </label>

            <Button
              onClick={handleSignUpClick}
              className="mt-1 h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isSigningUp}
              type="button"
            >
              {isSigningUp ? "회원가입 중..." : "회원가입"}
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 계정이 있다면{" "}
            <Link
              className="font-medium text-foreground hover:underline"
              href="/login"
            >
              로그인
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

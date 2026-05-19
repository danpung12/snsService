"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { saveLoginReturnTo } from "@/lib/auth-navigation";
import { useLoginRequiredModal } from "@/store/login-required-modal";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginRequiredModal() {
  const router = useRouter();
  const { isOpen, returnTo, title, description, close } =
    useLoginRequiredModal();

  const handleLoginClick = () => {
    saveLoginReturnTo(returnTo);
    close();
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <div className="bg-muted mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full">
            <LogIn className="h-5 w-5" />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>아니오</AlertDialogCancel>
          <AlertDialogAction onClick={handleLoginClick}>예</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

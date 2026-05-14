import PostEditorModal from "./post/modals/post-editor-modal";
import ProfileEditorModal from "./profile/profile-editor-modal";
import AuthErrorModal from "./auth-error-modal";

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PostEditorModal />
      <ProfileEditorModal />
      <AuthErrorModal />

      {children}
    </>
  );
}

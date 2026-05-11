import PostEditorModal from "./post/modals/post-editor-modal";
import ProfileEditorModal from "./profile/profile-editor-modal";

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PostEditorModal />
      <ProfileEditorModal />
      
      {children}
    </>
  );
}

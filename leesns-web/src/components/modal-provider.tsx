import PostEditorModal from "./post/modals/post-editor-modal";

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PostEditorModal />
      
      {children}
    </>
  );
}

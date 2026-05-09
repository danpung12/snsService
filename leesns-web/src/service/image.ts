import api from "@/lib/api";

export async function uploadPostImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post<{ filenames: string[] }>(
    "/uploads/post-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.filenames;
}

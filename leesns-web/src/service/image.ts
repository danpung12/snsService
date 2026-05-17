import api from "@/lib/api";

type PresignedUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
};

async function uploadImageWithPresignedUrl(file: File) {
  const response = await api.post<PresignedUrlResponse>(
    "/uploads/presigned-url",
    {
      fileName: file.name,
      contentType: file.type,
      filename: file.name,
      content: file.type,
    },
  );

  const { uploadUrl, fileUrl } = response.data;

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload image");
  }

  return fileUrl;
}

export async function uploadPostImages(files: File[]) {
  return Promise.all(files.map(uploadImageWithPresignedUrl));
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<{ filename: string }>(
    "/uploads/profile-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.filename;
}

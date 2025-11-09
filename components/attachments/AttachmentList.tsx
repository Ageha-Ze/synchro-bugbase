"use client";

interface Props {
  bugId: string;
}

export const AttachmentList = ({ bugId }: Props) => {
  return (
    <div className="mt-4 border p-2 rounded">
      <h4 className="font-semibold mb-2">Attachments</h4>
      <div className="text-sm text-gray-500">No attachments for bug {bugId}</div>
    </div>
  );
};

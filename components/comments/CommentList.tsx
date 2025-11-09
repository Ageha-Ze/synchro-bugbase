"use client";

interface Props {
  bugId: string;
}

export const CommentList = ({ bugId }: Props) => {
  return (
    <div className="mt-4 border p-2 rounded">
      <h4 className="font-semibold mb-2">Comments</h4>
      <div className="text-sm text-gray-500">No comments yet for bug {bugId}</div>
    </div>
  );
};

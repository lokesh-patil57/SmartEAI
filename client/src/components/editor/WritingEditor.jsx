export default function WritingEditor() {
  return (
    <textarea
      className="
        w-full h-full resize-none
        bg-transparent
        text-foreground
        text-base leading-relaxed
        outline-none
        placeholder:text-secondary
      "
      placeholder="Start writing your resume or application here..."
    />
  );
}

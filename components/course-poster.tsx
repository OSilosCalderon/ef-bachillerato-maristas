const posterSrc = "data:image/webp;base64,UklGRhY9AABXRUJQVlA4IAo9AACw+wCdASoYAV4BPsFOoUunpC";

export function CoursePoster({ compact = false }: { compact?: boolean }) {
  return (
    <figure className={compact ? "course-poster course-poster-compact" : "course-poster"}>
      <img src={posterSrc} alt="Cartel del lema Maristas 2026-2027: ¿Te imaginas?" />
    </figure>
  );
}

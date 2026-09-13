const logoSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtAAAADwCAYAAAB8rJkkAA...";

export function CorporateLogo() {
  return (
    <div className="corporate-logo" aria-label="Maristas · Colegio Ntra. Sra. del Carmen - Badajoz">
      <img src={logoSrc} alt="Maristas · Colegio Ntra. Sra. del Carmen - Badajoz" />
    </div>
  );
}

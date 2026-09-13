const officialLogo = "https://www.maristasbadajoz.es/wp-content/uploads/sites/8/2025/04/maristas-badajoz-copia-768x192.jpg";

export function CorporateLogo() {
  return (
    <div className="corporate-logo">
      <img
        src={officialLogo}
        alt="Maristas · Colegio Ntra. Sra. del Carmen - Badajoz"
        width={768}
        height={192}
        loading="eager"
      />
    </div>
  );
}

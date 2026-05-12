export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 flex items-center gap-3 sticky top-0 z-40 shadow-sm overflow-visible" style={{ height: '56px' }}>
      <img
        src="/logo.png"
        alt="BantuAds"
        style={{ height: '180px', width: '180px', objectFit: 'contain', borderRadius: '16px', position: 'relative', zIndex: 50 }}
      />
    </header>
  );
}

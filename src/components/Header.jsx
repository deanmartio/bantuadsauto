export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 sticky top-0 z-40 shadow-sm">
      <img
        src="/logo.png"
        alt="BantuAds"
        style={{ height: '72px', width: '72px', objectFit: 'contain', borderRadius: '12px' }}
      />
    </header>
  );
}

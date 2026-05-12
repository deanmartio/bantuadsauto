export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-40 shadow-sm">
      <img
        src="/logo.png"
        alt="KawanBantu"
        style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '8px' }}
      />
      <span className="text-sm font-semibold text-[#2B2033] opacity-60 hidden sm:inline">
        BantuAds Submission
      </span>
    </header>
  );
}

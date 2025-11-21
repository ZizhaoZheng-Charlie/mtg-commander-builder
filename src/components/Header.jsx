function Header() {
  return (
    <header className="w-full py-8 border-b border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-magic-blue to-magic-purple bg-clip-text text-transparent">
            <span className="text-3xl mr-2">⚔️</span>
            MTG Commander Builder
          </h1>
          <p className="text-text-secondary text-lg">
            Build legendary decks with synergy insights
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;

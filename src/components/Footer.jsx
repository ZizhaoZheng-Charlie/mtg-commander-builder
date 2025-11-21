function Footer() {
  return (
    <footer className="mt-12 py-8 text-center text-text-muted border-t border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <p>
          Data provided by{' '}
          <a
            href="https://edhrec.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-magic-blue no-underline transition-colors hover:text-magic-purple"
          >
            EDHREC
          </a>{' '}
          and{' '}
          <a
            href="https://scryfall.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-magic-blue no-underline transition-colors hover:text-magic-purple"
          >
            Scryfall
          </a>
        </p>
        <p className="mt-2 text-sm">
          MTG Commander Builder is unofficial Fan Content. Not approved/endorsed
          by Wizards of the Coast.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background py-4 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-1">
        <p className="text-xs text-muted-foreground">
          &copy; {year} KRYROS. All rights reserved.
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          Designed &amp; built for Zambia
        </p>
      </div>
    </footer>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#0B1320' }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-120px',
          left: '-120px',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(18,214,197,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-120px',
          right: '-120px',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(18,214,197,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {children}
        <p className="mt-10 text-sm" style={{ color: '#AAB4C5' }}>
          © 2025{' '}
          <span style={{ color: '#12D6C5' }} className="font-semibold">
            KRYROS
          </span>
          . All rights reserved.
        </p>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerminal({
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontSize: 11,
      theme: {
        background: '#050508',
        foreground: '#00d4ff',
        cursor: '#00d4ff',
        cursorAccent: '#050508',
        selectionBackground: 'rgba(0, 212, 255, 0.3)',
        black: '#000000',
        red: '#ff3366',
        green: '#00ff88',
        yellow: '#ffaa00',
        blue: '#00d4ff',
        magenta: '#ff00ff',
        cyan: '#00d4ff',
        white: '#e8f4ff',
        brightBlack: '#5a7a9a',
        brightRed: '#ff6699',
        brightGreen: '#66ffaa',
        brightYellow: '#ffcc00',
        brightBlue: '#66ddff',
        brightMagenta: '#ff66ff',
        brightCyan: '#66eeff',
        brightWhite: '#ffffff',
      },
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[36m╔══════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[36m║     Soul Dashboard Terminal          ║\x1b[0m');
    term.writeln('\x1b[36m╚══════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[90mType "help" for commands, "clear" to clear\x1b[0m');
    term.writeln('');

    term.onData((data) => {
      if (data === '\r') {
        term.writeln('');
      } else if (data === '\x7f') {
        term.write('\b \b');
      } else if (data === '\x03') {
        term.writeln('^C');
      } else {
        term.write(data);
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between px-3 py-1.5 border-b border-white/5 flex-shrink-0'>
        <h2 className='font-orbitron text-[10px] font-bold text-plasma-cyan tracking-widest uppercase'>
          Terminal
        </h2>
        <button
          onClick={() => {
            setIsFullscreen((f) => !f);
            setTimeout(() => fitAddonRef.current?.fit(), 10);
          }}
          className='text-[8px] text-text-muted hover:text-plasma-cyan font-jetbrains'
        >
          {isFullscreen ? 'Exit' : 'Full'}
        </button>
      </div>
      <div
        ref={containerRef}
        className='flex-1 min-h-0 p-1'
        style={{
          background: '#050508',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
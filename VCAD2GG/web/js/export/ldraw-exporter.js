window.VCAD2 = window.VCAD2 || {};

window.VCAD2.LDrawExporter = {
  toMPD(assembly) {
    const Catalog = window.VCAD2.PartCatalog;
    const lines = [
      `0 FILE ${assembly.name || 'model'}.mpd`,
      `0 Name: ${assembly.name || 'GiveGigs Valley CAD 2'}`,
      `0 Author: GiveGigs Valley CAD 2 (GPT 6 Luna Light)`
    ];

    (assembly.parts || []).forEach(p => {
      const spec = Catalog.get(p.type);
      const x = (p.pos[0] * 20).toFixed(2);
      const y = (-p.pos[1] * 20).toFixed(2);
      const z = (p.pos[2] * 20).toFixed(2);
      lines.push(`1 16 ${x} ${y} ${z} 1 0 0 0 1 0 0 0 1 ${spec.ldrawId}`);
    });

    lines.push('0 NOFILE');
    return lines.join('\n');
  },

  download(filename, content, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};

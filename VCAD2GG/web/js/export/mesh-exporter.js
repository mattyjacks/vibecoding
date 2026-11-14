window.VCAD2 = window.VCAD2 || {};

window.VCAD2.MeshExporter = {
  toASCIISTL(assembly) {
    const lines = [`solid ${assembly.name || 'vcad2_model'}`];
    (assembly.parts || []).forEach(p => {
      const [x, y, z] = p.pos;
      lines.push(`  facet normal 0 1 0`);
      lines.push(`    outer loop`);
      lines.push(`      vertex ${x} ${y} ${z}`);
      lines.push(`      vertex ${x + 1} ${y} ${z}`);
      lines.push(`      vertex ${x} ${y} ${z + 1}`);
      lines.push(`    endloop`);
      lines.push(`  endfacet`);
    });
    lines.push(`endsolid ${assembly.name || 'vcad2_model'}`);
    return lines.join('\n');
  }
};

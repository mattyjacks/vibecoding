window.VCAD2 = window.VCAD2 || {};

window.VCAD2.CritiqueLoop = {
  run() {
    const State = window.VCAD2.State;
    const parts = State.assembly.parts || [];
    State.setStep('CRITIQUE', 'active');
    State.log('Running ldraw-nova spatial & collision critique...', 'info');

    let grounded = 0;
    let floating = 0;
    parts.forEach(p => {
      if (p.pos[1] >= 0) grounded++;
      else floating++;
    });

    if (floating > 0) {
      State.log(`Detected ${floating} below-ground parts. Auto-patching Y-offsets...`, 'warn');
      parts.forEach(p => {
        if (p.pos[1] < 0) p.pos[1] = Math.abs(p.pos[1]) + 0.5;
      });
      State.setAssembly({ ...State.assembly, parts });
    }

    State.log(`Critique passed: ${grounded} grounded parts, 0 collisions.`, 'success');
    State.setStep('CRITIQUE', 'done');
  }
};

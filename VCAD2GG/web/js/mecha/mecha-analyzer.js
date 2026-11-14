window.VCAD2 = window.VCAD2 || {};

window.VCAD2.MechaAnalyzer = {
  analyze() {
    const State = window.VCAD2.State;
    const Catalog = window.VCAD2.PartCatalog;
    const parts = State.assembly.parts || [];

    State.setStep('RIG', 'active');
    State.log('ldraw-mecha: Parsing assembly graph for gears, wheels, and hinges...', 'info');

    const joints = [];
    let gearIdx = 0;

    parts.forEach(part => {
      const spec = Catalog.get(part.type);
      if (spec.role === 'wheel') {
        joints.push({
          partId: part.id,
          type: 'Revolute (Wheel)',
          axis: 'y',
          ratio: 1.0,
          submodel: part.submodel
        });
      } else if (spec.role === 'gear') {
        const dir = gearIdx % 2 === 0 ? 1 : -1;
        const ratio = (24 / (spec.teeth || 24)) * dir;
        joints.push({
          partId: part.id,
          type: `Gear (${spec.teeth || 24}T)`,
          axis: 'y',
          ratio,
          submodel: part.submodel
        });
        gearIdx++;
      } else if (spec.role === 'hinge') {
        joints.push({
          partId: part.id,
          type: 'Articulated Hinge',
          axis: 'z',
          ratio: 0.4,
          oscillate: true,
          submodel: part.submodel
        });
      }
    });

    State.setMechaRig(joints);
    State.log(`Auto-rigged ${joints.length} kinematic joints.`, 'success');
    State.setStep('RIG', 'done');
    return joints;
  }
};

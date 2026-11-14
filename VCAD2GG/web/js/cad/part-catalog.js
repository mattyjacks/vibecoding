window.VCAD2 = window.VCAD2 || {};

window.VCAD2.PartCatalog = {
  parts: {
    beam_1x8: { ldrawId: '3702.dat', size: [8, 1, 1], shape: 'box', role: 'frame' },
    plate_2x4: { ldrawId: '3020.dat', size: [4, 0.4, 2], shape: 'box', role: 'frame' },
    gear_24t: { ldrawId: '3648.dat', size: [2.4, 2.4, 0.5], shape: 'gear', teeth: 24, role: 'gear' },
    gear_12t: { ldrawId: '32270.dat', size: [1.2, 1.2, 0.5], shape: 'gear', teeth: 12, role: 'gear' },
    wheel_hub: { ldrawId: '56145.dat', size: [2.6, 2.6, 1.2], shape: 'cylinder', role: 'wheel' },
    axle_4: { ldrawId: '3705.dat', size: [0.4, 0.4, 4.5], shape: 'cylinder', role: 'axle' },
    arm_link: { ldrawId: '32524.dat', size: [5, 0.8, 0.8], shape: 'box', role: 'hinge' },
    servo_box: { ldrawId: '99498.dat', size: [2.2, 1.6, 1.6], shape: 'box', role: 'actuator' }
  },

  get(type) {
    return this.parts[type] || this.parts.plate_2x4;
  }
};

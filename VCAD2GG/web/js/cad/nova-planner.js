window.VCAD2 = window.VCAD2 || {};

window.VCAD2.NovaPlanner = {
  async buildFromPrompt(prompt) {
    const State = window.VCAD2.State;
    State.setStep('PLAN', 'active');
    State.log(`GPT 6 Luna Light planning assembly for: "${prompt}"`, 'info');

    let plan = null;
    try {
      plan = await window.VCAD2.LunaLightClient.generatePlan(prompt);
    } catch (err) {
      State.log(`Live API fallback (${err.message}). Using local Nova compiler.`, 'warn');
    }

    if (!plan) {
      plan = this.buildPresetPlan(prompt);
    }

    State.setStep('PLAN', 'done');
    State.setStep('SCRIPT', 'active');
    State.log(`Compiled ${plan.parts.length} parts across ${plan.submodels.length} submodels.`, 'success');
    State.setStep('SCRIPT', 'done');

    State.setAssembly(plan);
    return plan;
  },

  buildPresetPlan(prompt) {
    const p = prompt.toLowerCase();
    if (p.includes('arm') || p.includes('robot')) {
      return {
        name: 'Articulated_Robotic_Arm',
        submodels: ['base', 'shoulder', 'elbow_arm', 'gripper'],
        parts: [
          { id: 'b1', type: 'plate_2x4', submodel: 'base', pos: [0, 0.2, 0], rot: [0, 0, 0], color: '#334155' },
          { id: 's1', type: 'servo_box', submodel: 'base', pos: [0, 1.2, 0], rot: [0, 0, 0], color: '#38bdf8' },
          { id: 'g1', type: 'gear_24t', submodel: 'shoulder', pos: [0, 2.2, 0.9], rot: [Math.PI / 2, 0, 0], color: '#f59e0b' },
          { id: 'a1', type: 'arm_link', submodel: 'shoulder', pos: [2.0, 2.8, 0], rot: [0, 0, 0.35], color: '#e2e8f0' },
          { id: 'g2', type: 'gear_12t', submodel: 'elbow_arm', pos: [4.2, 3.6, 0.7], rot: [Math.PI / 2, 0, 0], color: '#f59e0b' },
          { id: 'a2', type: 'arm_link', submodel: 'elbow_arm', pos: [6.0, 3.2, 0], rot: [0, 0, -0.4], color: '#94a3b8' },
          { id: 'gr1', type: 'servo_box', submodel: 'gripper', pos: [8.2, 2.4, 0], rot: [0, 0, -0.4], color: '#ef4444' }
        ]
      };
    }

    if (p.includes('gear')) {
      return {
        name: 'Meshed_Gearbox',
        submodels: ['housing', 'gear_train'],
        parts: [
          { id: 'h1', type: 'beam_1x8', submodel: 'housing', pos: [0, 0.5, -1.2], rot: [0, 0, 0], color: '#475569' },
          { id: 'h2', type: 'beam_1x8', submodel: 'housing', pos: [0, 0.5, 1.2], rot: [0, 0, 0], color: '#475569' },
          { id: 'ax1', type: 'axle_4', submodel: 'gear_train', pos: [-1.8, 1.5, 0], rot: [0, 0, 0], color: '#cbd5e1' },
          { id: 'ax2', type: 'axle_4', submodel: 'gear_train', pos: [0.0, 1.5, 0], rot: [0, 0, 0], color: '#cbd5e1' },
          { id: 'g1', type: 'gear_24t', submodel: 'gear_train', pos: [-1.8, 1.5, 0], rot: [Math.PI / 2, 0, 0], color: '#f59e0b' },
          { id: 'g2', type: 'gear_12t', submodel: 'gear_train', pos: [0.0, 1.5, 0], rot: [Math.PI / 2, 0, 0], color: '#38bdf8' },
          { id: 'g3', type: 'gear_24t', submodel: 'gear_train', pos: [1.8, 1.5, 0], rot: [Math.PI / 2, 0, 0], color: '#10b981' }
        ]
      };
    }

    // Default: 4-Wheel Rover
    return {
      name: 'GiveGigs_Rover_V2',
      submodels: ['chassis', 'drivetrain', 'wheels'],
      parts: [
        { id: 'c1', type: 'beam_1x8', submodel: 'chassis', pos: [0, 1.4, -1.2], rot: [0, 0, 0], color: '#38bdf8' },
        { id: 'c2', type: 'beam_1x8', submodel: 'chassis', pos: [0, 1.4, 1.2], rot: [0, 0, 0], color: '#38bdf8' },
        { id: 'c3', type: 'plate_2x4', submodel: 'chassis', pos: [0, 2.0, 0], rot: [0, 0, 0], color: '#1e293b' },
        { id: 'srv', type: 'servo_box', submodel: 'drivetrain', pos: [0, 2.6, 0], rot: [0, 0, 0], color: '#ef4444' },
        { id: 'axf', type: 'axle_4', submodel: 'drivetrain', pos: [2.6, 1.3, 0], rot: [0, 0, 0], color: '#cbd5e1' },
        { id: 'axr', type: 'axle_4', submodel: 'drivetrain', pos: [-2.6, 1.3, 0], rot: [0, 0, 0], color: '#cbd5e1' },
        { id: 'g1', type: 'gear_12t', submodel: 'drivetrain', pos: [0, 1.4, 0], rot: [Math.PI / 2, 0, 0], color: '#f59e0b' },
        { id: 'wfl', type: 'wheel_hub', submodel: 'wheels', pos: [2.6, 1.3, 2.2], rot: [Math.PI / 2, 0, 0], color: '#0f172a' },
        { id: 'wfr', type: 'wheel_hub', submodel: 'wheels', pos: [2.6, 1.3, -2.2], rot: [Math.PI / 2, 0, 0], color: '#0f172a' },
        { id: 'wrl', type: 'wheel_hub', submodel: 'wheels', pos: [-2.6, 1.3, 2.2], rot: [Math.PI / 2, 0, 0], color: '#0f172a' },
        { id: 'wrr', type: 'wheel_hub', submodel: 'wheels', pos: [-2.6, 1.3, -2.2], rot: [Math.PI / 2, 0, 0], color: '#0f172a' }
      ]
    };
  }
};

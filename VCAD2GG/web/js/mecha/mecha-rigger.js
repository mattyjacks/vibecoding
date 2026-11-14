window.VCAD2 = window.VCAD2 || {};

window.VCAD2.MechaRigger = {
  stepAnimation(meshesById, timeSec) {
    const { joints, isPlaying, speed } = window.VCAD2.State.mechaRig;
    if (!isPlaying || !joints.length) return;

    const rate = speed * 0.25;
    joints.forEach(joint => {
      const mesh = meshesById[joint.partId];
      if (!mesh) return;

      if (joint.oscillate) {
        mesh.rotation[joint.axis] = joint.baseRot[joint.axis] + Math.sin(timeSec * rate) * joint.ratio;
      } else {
        mesh.rotation[joint.axis] = joint.baseRot[joint.axis] + timeSec * rate * joint.ratio;
      }
    });
  }
};

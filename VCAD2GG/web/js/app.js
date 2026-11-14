document.addEventListener('DOMContentLoaded', async () => {
  window.VCAD2.AuthGate.init();
  window.VCAD2.Viewport3D.init('viewport-canvas');
  window.VCAD2.Workbench.init();

  // Boot with default 4-wheel rover
  await window.VCAD2.NovaPlanner.buildFromPrompt('4-wheel rover with steering and gear drive');
  window.VCAD2.CritiqueLoop.run();
  window.VCAD2.MechaAnalyzer.analyze();
});

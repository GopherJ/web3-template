export const getAllSteps = async () => {
  const {step_00} = await import("./00_deleteDb");

  return [step_00];
};

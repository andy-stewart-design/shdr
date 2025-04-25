function setUniformWarning(name: string, type: string) {
  return `[GLSL.TS]: Couldn't update ${name}, value must be a ${type}`;
}

export { setUniformWarning };

import type { Vec2, Vec3, Vec4 } from "./types";

function isNumber(value: unknown) {
  return typeof value === "number";
}

function isString(value: unknown) {
  return typeof value === "string";
}

function isBool(value: unknown) {
  return typeof value === "boolean";
}

function isVec2(value: unknown): value is Vec2 {
  return Array.isArray(value) && value.length === 2 && value.every(isNumber);
}

function isVec3(value: unknown): value is Vec3 {
  return Array.isArray(value) && value.length === 3 && value.every(isNumber);
}

function isVec4(value: unknown): value is Vec4 {
  return Array.isArray(value) && value.length === 4 && value.every(isNumber);
}

export { isNumber, isString, isBool, isVec2, isVec3, isVec4 };

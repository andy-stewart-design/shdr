import { describe, it, expect } from "vitest";
import {
  isNumber,
  isString,
  isBool,
  isVec2,
  isVec3,
  isVec4,
  isImageFile,
  isVideoFile,
} from "../validators";

describe("Type Guards", () => {
  describe("isNumber", () => {
    it("should return true for valid numbers", () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(1)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(Number.MAX_VALUE)).toBe(true);
      expect(isNumber(Number.MIN_VALUE)).toBe(true);
      expect(isNumber(Infinity)).toBe(true);
      expect(isNumber(-Infinity)).toBe(true);
    });

    it("should return true for NaN (which is a number type)", () => {
      expect(isNumber(NaN)).toBe(true);
    });

    it("should return false for non-numbers", () => {
      expect(isNumber("1")).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(() => {})).toBe(false);
    });
  });

  describe("isString", () => {
    it("should return true for valid strings", () => {
      expect(isString("")).toBe(true);
      expect(isString("hello")).toBe(true);
      expect(isString("123")).toBe(true);
      expect(isString(" ")).toBe(true);
      expect(isString("null")).toBe(true);
    });

    it("should return false for non-strings", () => {
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(() => {})).toBe(false);
    });
  });

  describe("isBool", () => {
    it("should return true for boolean values", () => {
      expect(isBool(true)).toBe(true);
      expect(isBool(false)).toBe(true);
    });

    it("should return false for non-boolean values", () => {
      expect(isBool(0)).toBe(false);
      expect(isBool(1)).toBe(false);
      expect(isBool("")).toBe(false);
      expect(isBool("true")).toBe(false);
      expect(isBool("false")).toBe(false);
      expect(isBool(null)).toBe(false);
      expect(isBool(undefined)).toBe(false);
      expect(isBool({})).toBe(false);
      expect(isBool([])).toBe(false);
    });
  });

  describe("isVec2", () => {
    it("should return true for valid Vec2 arrays", () => {
      expect(isVec2([0, 0])).toBe(true);
      expect(isVec2([1, 2])).toBe(true);
      expect(isVec2([-1, -2])).toBe(true);
      expect(isVec2([3.14, 2.71])).toBe(true);
      expect(isVec2([Infinity, -Infinity])).toBe(true);
    });

    it("should return true for Vec2 with NaN values", () => {
      expect(isVec2([NaN, NaN])).toBe(true);
      expect(isVec2([1, NaN])).toBe(true);
    });

    it("should return false for arrays with wrong length", () => {
      expect(isVec2([])).toBe(false);
      expect(isVec2([1])).toBe(false);
      expect(isVec2([1, 2, 3])).toBe(false);
      expect(isVec2([1, 2, 3, 4])).toBe(false);
    });

    it("should return false for arrays with non-number elements", () => {
      expect(isVec2([1, "2"])).toBe(false);
      expect(isVec2(["1", 2])).toBe(false);
      expect(isVec2([true, false])).toBe(false);
      expect(isVec2([null, undefined])).toBe(false);
      expect(isVec2([{}, []])).toBe(false);
    });

    it("should return false for non-arrays", () => {
      expect(isVec2(null)).toBe(false);
      expect(isVec2(undefined)).toBe(false);
      expect(isVec2({})).toBe(false);
      expect(isVec2("12")).toBe(false);
      expect(isVec2(12)).toBe(false);
    });
  });

  describe("isVec3", () => {
    it("should return true for valid Vec3 arrays", () => {
      expect(isVec3([0, 0, 0])).toBe(true);
      expect(isVec3([1, 2, 3])).toBe(true);
      expect(isVec3([-1, -2, -3])).toBe(true);
      expect(isVec3([3.14, 2.71, 1.41])).toBe(true);
      expect(isVec3([Infinity, -Infinity, 0])).toBe(true);
    });

    it("should return true for Vec3 with NaN values", () => {
      expect(isVec3([NaN, NaN, NaN])).toBe(true);
      expect(isVec3([1, 2, NaN])).toBe(true);
    });

    it("should return false for arrays with wrong length", () => {
      expect(isVec3([])).toBe(false);
      expect(isVec3([1])).toBe(false);
      expect(isVec3([1, 2])).toBe(false);
      expect(isVec3([1, 2, 3, 4])).toBe(false);
    });

    it("should return false for arrays with non-number elements", () => {
      expect(isVec3([1, 2, "3"])).toBe(false);
      expect(isVec3(["1", 2, 3])).toBe(false);
      expect(isVec3([true, false, true])).toBe(false);
      expect(isVec3([null, undefined, 0])).toBe(false);
    });

    it("should return false for non-arrays", () => {
      expect(isVec3(null)).toBe(false);
      expect(isVec3(undefined)).toBe(false);
      expect(isVec3({})).toBe(false);
      expect(isVec3("123")).toBe(false);
    });
  });

  describe("isVec4", () => {
    it("should return true for valid Vec4 arrays", () => {
      expect(isVec4([0, 0, 0, 0])).toBe(true);
      expect(isVec4([1, 2, 3, 4])).toBe(true);
      expect(isVec4([-1, -2, -3, -4])).toBe(true);
      expect(isVec4([3.14, 2.71, 1.41, 1.73])).toBe(true);
      expect(isVec4([Infinity, -Infinity, 0, 1])).toBe(true);
    });

    it("should return true for Vec4 with NaN values", () => {
      expect(isVec4([NaN, NaN, NaN, NaN])).toBe(true);
      expect(isVec4([1, 2, 3, NaN])).toBe(true);
    });

    it("should return false for arrays with wrong length", () => {
      expect(isVec4([])).toBe(false);
      expect(isVec4([1])).toBe(false);
      expect(isVec4([1, 2])).toBe(false);
      expect(isVec4([1, 2, 3])).toBe(false);
      expect(isVec4([1, 2, 3, 4, 5])).toBe(false);
    });

    it("should return false for arrays with non-number elements", () => {
      expect(isVec4([1, 2, 3, "4"])).toBe(false);
      expect(isVec4(["1", 2, 3, 4])).toBe(false);
      expect(isVec4([true, false, true, false])).toBe(false);
      expect(isVec4([null, undefined, 0, 1])).toBe(false);
    });

    it("should return false for non-arrays", () => {
      expect(isVec4(null)).toBe(false);
      expect(isVec4(undefined)).toBe(false);
      expect(isVec4({})).toBe(false);
      expect(isVec4("1234")).toBe(false);
    });
  });
});

describe("File Type Guards", () => {
  describe("isImageFile", () => {
    it("should return true for valid image extensions", () => {
      expect(isImageFile("photo.jpg")).toBe(true);
      expect(isImageFile("image.jpeg")).toBe(true);
      expect(isImageFile("picture.png")).toBe(true);
      expect(isImageFile("avatar.avif")).toBe(true);
      expect(isImageFile("banner.webp")).toBe(true);
    });

    it("should handle case insensitivity", () => {
      expect(isImageFile("PHOTO.JPG")).toBe(true);
      expect(isImageFile("Image.JPEG")).toBe(true);
      expect(isImageFile("Picture.PNG")).toBe(true);
      expect(isImageFile("Avatar.AVIF")).toBe(true);
      expect(isImageFile("Banner.WEBP")).toBe(true);
      expect(isImageFile("MiXeD.JpG")).toBe(true);
    });

    it("should work with complex file paths", () => {
      expect(isImageFile("/path/to/image.jpg")).toBe(true);
      expect(isImageFile("folder/subfolder/photo.png")).toBe(true);
      expect(isImageFile("C:\\Users\\Documents\\picture.jpeg")).toBe(true);
      expect(isImageFile("image-with-dashes.avif")).toBe(true);
      expect(isImageFile("image_with_underscores.webp")).toBe(true);
    });

    it("should return false for non-image files", () => {
      expect(isImageFile("document.pdf")).toBe(false);
      expect(isImageFile("video.mp4")).toBe(false);
      expect(isImageFile("audio.mp3")).toBe(false);
      expect(isImageFile("text.txt")).toBe(false);
      expect(isImageFile("data.json")).toBe(false);
    });

    it("should return false for files without extensions", () => {
      expect(isImageFile("filename")).toBe(false);
      expect(isImageFile("noextension")).toBe(false);
    });

    it("should return false for files with partial matches", () => {
      expect(isImageFile("file.jp")).toBe(false);
      expect(isImageFile("file.pn")).toBe(false);
      expect(isImageFile("file.jpgx")).toBe(false);
      expect(isImageFile("jpgfile")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isImageFile("")).toBe(false);
      expect(isImageFile(".jpg")).toBe(true);
      expect(isImageFile("file.")).toBe(false);
      expect(isImageFile("file.jpg.txt")).toBe(false);
    });
  });

  describe("isVideoFile", () => {
    it("should return true for valid video extensions", () => {
      expect(isVideoFile("movie.mp4")).toBe(true);
      expect(isVideoFile("clip.webm")).toBe(true);
      expect(isVideoFile("video.mov")).toBe(true);
    });

    it("should handle case insensitivity", () => {
      expect(isVideoFile("MOVIE.MP4")).toBe(true);
      expect(isVideoFile("Clip.WEBM")).toBe(true);
      expect(isVideoFile("Video.MOV")).toBe(true);
      expect(isVideoFile("MiXeD.Mp4")).toBe(true);
    });

    it("should work with complex file paths", () => {
      expect(isVideoFile("/path/to/movie.mp4")).toBe(true);
      expect(isVideoFile("folder/subfolder/video.webm")).toBe(true);
      expect(isVideoFile("C:\\Users\\Videos\\clip.mov")).toBe(true);
      expect(isVideoFile("video-with-dashes.mp4")).toBe(true);
      expect(isVideoFile("video_with_underscores.webm")).toBe(true);
    });

    it("should return false for non-video files", () => {
      expect(isVideoFile("document.pdf")).toBe(false);
      expect(isVideoFile("image.jpg")).toBe(false);
      expect(isVideoFile("audio.mp3")).toBe(false);
      expect(isVideoFile("text.txt")).toBe(false);
      expect(isVideoFile("data.json")).toBe(false);
    });

    it("should return false for files without extensions", () => {
      expect(isVideoFile("filename")).toBe(false);
      expect(isVideoFile("noextension")).toBe(false);
    });

    it("should return false for files with partial matches", () => {
      expect(isVideoFile("file.mp")).toBe(false);
      expect(isVideoFile("file.web")).toBe(false);
      expect(isVideoFile("file.mo")).toBe(false);
      expect(isVideoFile("file.mp4x")).toBe(false);
      expect(isVideoFile("mp4file")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isVideoFile("")).toBe(false);
      expect(isVideoFile(".mp4")).toBe(true);
      expect(isVideoFile("file.")).toBe(false);
      expect(isVideoFile("file.mp4.txt")).toBe(false);
    });
  });
});

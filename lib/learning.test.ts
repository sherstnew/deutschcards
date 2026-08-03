import { describe, expect, it } from "vitest"
import { isCorrectAnswer, nextIntervalDays, normalizeGerman } from "./learning"

describe("German word normalization", () => {
  it("ignores case, Unicode form, and redundant whitespace", () => {
    expect(normalizeGerman("  STRAẞE   ")).toBe("straße")
    expect(isCorrectAnswer("  Haus ", "haus")).toBe(true)
    expect(isCorrectAnswer("жилище", "дом; жилище")).toBe(true)
    expect(isCorrectAnswer("DER TISCH", "der Tisch; Tisch")).toBe(true)
    expect(isCorrectAnswer("квартира", "дом; жилище")).toBe(false)
  })

  it("keeps German diacritics significant", () => {
    expect(isCorrectAnswer("schon", "schön")).toBe(false)
    expect(isCorrectAnswer("strasse", "straße")).toBe(false)
  })
})

describe("spaced repetition intervals", () => {
  it("moves successful reviews through fixed intervals and caps them", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(nextIntervalDays)).toEqual([1, 3, 7, 14, 30, 60, 60])
  })
})

import { describe, expect, it } from "vitest"
import { getArticle, isCorrectAnswer, nextIntervalDays, normalizeGerman, shuffle, withoutArticle } from "./learning"

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

describe("article handling", () => {
  it("removes a leading article for an explicit article-free word", () => {
    expect(withoutArticle("  der   Tisch ")).toBe("Tisch")
    expect(withoutArticle("DIE Katze")).toBe("Katze")
  })

  it("keeps automatic detection and explicit articles", () => {
    expect(getArticle("das Haus")).toBe("das")
    expect(getArticle("Haus", "der")).toBe("der")
    expect(getArticle("Haus")).toBeUndefined()
  })
})

describe("collection shuffling", () => {
  it("returns a predictable shuffled copy without changing the source", () => {
    const source = ["eins", "zwei", "drei", "vier"]
    const values = [0.25, 0.75, 0]
    const result = shuffle(source, () => values.shift() ?? 0)

    expect(result).toEqual(["vier", "eins", "drei", "zwei"])
    expect(source).toEqual(["eins", "zwei", "drei", "vier"])
    expect(result).toHaveLength(source.length)
    expect([...result].sort()).toEqual([...source].sort())
  })
})

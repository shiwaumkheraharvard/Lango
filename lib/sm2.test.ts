import { describe, expect, it } from "vitest";
import { GRADE_BUTTONS, describeInterval, isDue, isLearned, isNew, newCardState, nextEase, previewInterval, review } from "./sm2";

const TODAY = "2026-10-04";

describe("SM-2 scheduler", () => {
  it("first successful review: interval 1, repetitions 1, ease unchanged for Good", () => {
    const s = review(newCardState(TODAY), GRADE_BUTTONS.good, TODAY);
    expect(s.interval).toBe(1);
    expect(s.repetitions).toBe(1);
    expect(s.easeFactor).toBe(2.5);
    expect(s.dueDate).toBe("2026-10-05");
    expect(s.lastReviewed).toBe(TODAY);
  });

  it("second successful review: interval 6", () => {
    let s = review(newCardState(TODAY), 4, TODAY);
    s = review(s, 4, "2026-10-05");
    expect(s.interval).toBe(6);
    expect(s.repetitions).toBe(2);
    expect(s.dueDate).toBe("2026-10-11");
  });

  it("third successful review: interval = round(previous × ease)", () => {
    let s = review(newCardState(TODAY), 4, TODAY);
    s = review(s, 4, "2026-10-05");
    s = review(s, 4, "2026-10-11");
    expect(s.interval).toBe(15); // 6 × 2.5
    expect(s.repetitions).toBe(3);
    expect(s.dueDate).toBe("2026-10-26");
  });

  it("lapse (Again) resets repetitions and interval and lowers ease", () => {
    let s = review(newCardState(TODAY), 4, TODAY);
    s = review(s, 4, "2026-10-05");
    s = review(s, 4, "2026-10-11");
    const lapsed = review(s, GRADE_BUTTONS.again, "2026-10-26");
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.interval).toBe(1);
    expect(lapsed.easeFactor).toBe(1.96); // 2.5 + (0.1 − 4 × (0.08 + 4 × 0.02)) = 2.5 − 0.54
    expect(lapsed.dueDate).toBe("2026-10-27");
  });

  it("after a lapse the schedule restarts at 1 → 6", () => {
    let s = review(newCardState(TODAY), 4, TODAY);
    s = review(s, 4, "2026-10-05");
    s = review(s, 1, "2026-10-11");
    s = review(s, 4, "2026-10-12");
    expect(s.interval).toBe(1);
    s = review(s, 4, "2026-10-13");
    expect(s.interval).toBe(6);
  });

  it("ease factor never drops below 1.3", () => {
    let s = newCardState(TODAY);
    for (let i = 0; i < 10; i++) s = review(s, 0, TODAY);
    expect(s.easeFactor).toBe(1.3);
    expect(nextEase(1.3, 0)).toBe(1.3);
  });

  it("easy streak raises ease (2.6 → 2.7 → 2.8) and grows intervals 1 → 6 → 16", () => {
    let s = review(newCardState(TODAY), GRADE_BUTTONS.easy, TODAY);
    expect(s.easeFactor).toBe(2.6);
    expect(s.interval).toBe(1);
    s = review(s, GRADE_BUTTONS.easy, "2026-10-05");
    expect(s.easeFactor).toBe(2.7);
    expect(s.interval).toBe(6);
    s = review(s, GRADE_BUTTONS.easy, "2026-10-11");
    expect(s.easeFactor).toBe(2.8);
    expect(s.interval).toBe(16); // round(6 × 2.7) — uses the ease *before* this review's update
  });

  it("Hard keeps the repetition count but lowers ease by 0.14", () => {
    let s = review(newCardState(TODAY), 4, TODAY);
    s = review(s, GRADE_BUTTONS.hard, "2026-10-05");
    expect(s.repetitions).toBe(2);
    expect(s.interval).toBe(6);
    expect(s.easeFactor).toBe(2.36);
  });

  it("previewInterval matches what review() would produce", () => {
    let s = review(newCardState(TODAY), 4, TODAY);
    s = review(s, 4, "2026-10-05");
    expect(previewInterval(s, 1)).toBe(1);
    expect(previewInterval(s, 3)).toBe(15);
    expect(previewInterval(s, 4)).toBe(15);
    expect(review(s, 4, "2026-10-11").interval).toBe(15);
    expect(previewInterval(newCardState(TODAY), 5)).toBe(1);
  });

  it("due / new / learned predicates", () => {
    const fresh = newCardState(TODAY);
    expect(isNew(fresh)).toBe(true);
    expect(isDue(fresh, TODAY)).toBe(true);
    const later = review(fresh, 4, TODAY);
    expect(isNew(later)).toBe(false);
    expect(isDue(later, TODAY)).toBe(false);
    expect(isDue(later, "2026-10-05")).toBe(true);
    expect(isLearned({ easeFactor: 2.5, interval: 30, repetitions: 4, dueDate: TODAY })).toBe(true);
    expect(isLearned({ easeFactor: 2.5, interval: 6, repetitions: 2, dueDate: TODAY })).toBe(false);
  });

  it("describeInterval wording", () => {
    expect(describeInterval(0)).toBe("today");
    expect(describeInterval(1)).toBe("tomorrow");
    expect(describeInterval(6)).toBe("in 6 days");
    expect(describeInterval(31)).toBe("in a month");
    expect(describeInterval(95)).toBe("in 3 months");
  });
});

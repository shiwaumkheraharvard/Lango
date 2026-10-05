/**
 * Service layer entry point. Components and the store import from here only.
 * Each file is the single place to swap the mock implementation for a real backend.
 */
export * as progress from "./progress";
export * as flashcards from "./flashcards";
export * as grammar from "./grammar";
export * as conversation from "./conversation";
export * as speech from "./speech";
export * as writing from "./writing";
export { MOCK, BACKEND } from "./config";

// TODO Remove after first real unit test

import "@kayahr/jest-matchers";
import "jest-extended";

import { initialize as initializeNlpClassifier } from "../../main/nlp/classifier";
import { classifier as nlpClassifier } from "../../main/nlp/classifier";

beforeAll(async () => {
    await initializeNlpClassifier();
});

describe("Natural Language Processing", () => {
    it("classifier works: help", () => {
        expect(nlpClassifier.classify("Need sum help!")).toEqual("help");
        expect(nlpClassifier.classify("Whoa! I'm in big trouble...")).toEqual("help");
        expect(nlpClassifier.classify("Not a problem!")).toEqual("help");
    });
    it("classifier works: exploration", () => {
        expect(nlpClassifier.classify("Let's explore the galaxy, friends!")).toEqual("explore");
        expect(nlpClassifier.classify("I want to travel to distant stars.")).toEqual("explore");
    });
});

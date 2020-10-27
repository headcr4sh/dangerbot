// TODO Remove after first real unit test

import "@kayahr/jest-matchers";
import "jest-extended";

describe("dummy", () => {
    it("just works", () => {
        expect([ 1.1, 2.2 ]).toEqualCloseTo([ 1.1, 2.2 ]);
    });
});

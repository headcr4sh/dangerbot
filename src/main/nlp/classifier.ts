import { BayesClassifier } from "natural";

export const classifier = new BayesClassifier();

export async function initialize(): Promise<void> {

    classifier.addDocument("I need help", "help");
    classifier.addDocument("I am in trouble", "help");
    classifier.addDocument("Emergency", "help");
    classifier.addDocument("Oh no", "help");
    classifier.addDocument("Shit", "help");
    classifier.addDocument("Damn", "help");
    classifier.addDocument("Fuck", "help");
    classifier.addDocument("Fuck", "something");

    classifier.addDocument("I am on an exploration trip", "explore");
    classifier.addDocument("I just travel around", "explore");
    classifier.addDocument("Let's boldly go where nobody has gone before.", "explore");

    classifier.train()

}


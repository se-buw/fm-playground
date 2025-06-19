package de.buw.fmp.alloy.api;

public enum Specs {
  SHORT_CODE(
      """
      sig A {}
      """),
  LONG_CODE(
      "sig Person {spouse: Person, shaken: set Person}\r\n"
          + //
          "one sig Jocelyn, Hilary extends Person {}\r\n"
          + //
          "\r\n"
          + //
          "fact ShakingProtocol {\r\n"
          + //
          "    // nobody shakes own or spouse's hand\r\n"
          + //
          "    all p: Person | no (p + p.spouse) & p.shaken\r\n"
          + //
          "    // if p shakes q, q shakes p\r\n"
          + //
          "    all p, q: Person | p in q.shaken => q in p.shaken\r\n"
          + //
          "    }\r\n"
          + //
          "\r\n"
          + //
          "fact Spouses {\r\n"
          + //
          "    all p, q: Person | p!=q => {\r\n"
          + //
          "        // if q is p's spouse, p is q's spouse\r\n"
          + //
          "        p.spouse = q => q.spouse = p\r\n"
          + //
          "        // no spouse sharing\r\n"
          + //
          "        p.spouse != q.spouse\r\n"
          + //
          "        }\r\n"
          + //
          "    all p: Person {\r\n"
          + //
          "        // a person is his or her spouse's spouse\r\n"
          + //
          "        p.spouse.spouse = p\r\n"
          + //
          "        // nobody is his or her own spouse\r\n"
          + //
          "        p != p.spouse\r\n"
          + //
          "        }\r\n"
          + //
          "    }\r\n"
          + //
          "\r\n"
          + //
          "pred Puzzle {\r\n"
          + //
          "    // everyone but Jocelyn has shaken a different number of hands\r\n"
          + //
          "    all p,q: Person - Jocelyn | p!=q => #p.shaken != #q.shaken\r\n"
          + //
          "    // Hilary's spouse is Jocelyn\r\n"
          + //
          "    Hilary.spouse = Jocelyn\r\n"
          + //
          "    }\r\n"
          + //
          "\r\n"
          + //
          "run Puzzle for exactly 1000 Person, 15 int\r\n"),
  LIST_CODE(
      """
      one sig List {
      		header: lone Node
      }
      var sig Node {
      		var link: lone Node
      }
      fact noDanglingNodes {
      		always (Node in List.header.*link)
      }

      run {# Node = 4 and after one Node } for 3 but 4 Node
      """),
  TRAFFIC_CODE(
      """
// video: https://www.youtube.com/watch?v=cwnjBUyCNdM&list=PLGyeoukah9NYq9ULsIuADG2r2QjX530nf&index=6

// simple, temporal model of a traffic light (unsafe)
abstract sig Light {
	var color : one Color,
	var car : lone Car
} {
	always (some car implies eventually color = GREEN)
}

sig Car {}
enum Color {GREEN, RED}

// concrete traffic lights in the scenario
one sig LightA, LightB extends Light {}

pred crash {
	LightA.color = GREEN and LightB.color = GREEN
}

fact initiallyBothRed {
	Light.color = RED
}

assert neverCrash {always not crash}

check neverCrash for 3 but 4 Light, exactly 3 Car
""");

  String code;

  private Specs(String code) {
    this.code = code;
  }
}

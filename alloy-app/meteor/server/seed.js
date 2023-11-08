import { secretTag } from '../lib/editor/text'

export { seedWithModels }

/**
  Seed the database with a set of default models, with fixed ids so that they
  can be accessed from a fixed address.
*/
function seedWithModels() {
    const initialModels = [{
        publicLink: '3cy7jaB4ESqdb2txK',
        privateLink: 'e88P5zwv9aJ7FJwp7',
        model: {
            code: `//A student must be enrolled in one or more courses
sig Course{}
sig Student{ enrolledin : set Course}

// write a predicate Quizz to verify that
// "a student must be enrolled in one or more courses"	
pred Quizz{ 

}

${secretTag}
check Solution {
	Quizz iff all s:Student | some s.enrolledin
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'a3CyrvrbWHAdtE2x4',
        privateLink: 'oQNigwPnrgMESBRqx',
        model: {
            code: `sig Employee{}
sig Department{}
one sig Company {
    isDirectorOf: Employee -> Department
}

//write a prediate Quizz to check that
pred Quizz {
    // In a company, each department has exactly one director (chosen among 
    // the company's employees), but each employee can only be the director 
    // of at most one department
    
}

${secretTag}
check Solution {
    Quizz iff {  
    all d:Department | one  Company.isDirectorOf.d and
        all e:Employee | lone Company.isDirectorOf[e]
    }
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: '2zrpuc2wg4gsCaY63',
        privateLink: 'wCeMgMSdphxnPXiH9',
        model: {
            code: `sig researchUnit {}
sig researcher { 
        collaborate: set researchUnit,
        affiliated: set researchUnit
}

// Write a predicate Quizz to check that
pred Quizz {
    // A researcher may collaborate with multiple research units (one or more),
    // but must be affiliated with just one research units.
    
}   

${secretTag}
check Solution{
    Quizz iff {all r:researcher | some r.collaborate and one r.affiliated}
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: '6pc5KQzjhozDkNgPv',
        privateLink: 'rFkF5B8ahR3TuuWgy',
        model: {
            code: `abstract sig Person {}
sig Teacher extends Person {}
abstract sig Student extends Person {}
sig Graduate, Undergrad extends Student {}
sig Instructor in Teacher + Graduate {}
sig Course {
        taughtby: one Instructor,
        enrolled: some Student
}

// write a predicate to check that
pred Quizz { // "the instructor of a course cannot be enrolled in such course"

}

${secretTag}
check Solution{
    Quizz iff {all c:Course | no c.taughtby & c.enrolled}
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'QM77ku4rGxTMeK9oG',
        privateLink: 'bvmx4wCZJzK87wRDi',
        model: {
            code: `abstract sig Person {}
sig Teacher extends Person {}
abstract sig Student extends Person {
    courses: set Course
}
sig Graduate, Undergrad extends Student {}
sig Instructor in Teacher + Graduate {}
sig Course {
        taughtby: one Instructor, 
        enrolled: some Student 
}

// Write a predicate Quizz to check that
pred Quizz {
    // the relationships courses and enrolled must be consistent, i.e., 
    // if a student has a Course, that Course must be enrolled by the Student  
    // and vice-versa
    
}


${secretTag}
check Solution{
    Quizz iff (courses = ~enrolled)
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'aSPhAXu7aXWu9FeD6',
        privateLink: 'wFHzvXgffykvcjzdY',
        model: {
            code: `open util/ordering[Time]

// Consider the following model of a mobile phone
sig Number {}

// A simple model of Time as a total order
sig Time {}
one sig Now in Time {}

// Each contact can have several phone numbers
sig Contact { phones : some Number }

// Each call is to a particular phone number at a particular time
sig Call {
    number : one Number,
    time : one Time
}

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.

pred Inv1 { // A phone number cannot belong to two different contacts

}
${secretTag}
pred Inv1' {
    all n : Number | lone phones.n	
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3' and Inv4') implies (Inv1 iff Inv1')
}

pred Inv2 { // Every called number belongs to a contact

}
${secretTag}
pred Inv2' {
    Call.number in Contact.phones
}

${secretTag}
check Inv2OK {
    (Inv1' and Inv3' and Inv4') implies (Inv2 iff Inv2')
}

pred Inv3 { // Simultaneous calls cannot exist

}
${secretTag}
pred Inv3' {
    all t : Time | lone time.t	
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2' and Inv4') implies (Inv3 iff Inv3')
}

pred Inv4 { // All calls were made in the past

}
${secretTag}
pred Inv4' {
    all c : Call | c.time in Now.prevs
}
${secretTag}
check Inv4OK {
    (Inv1' and Inv2' and Inv3') implies (Inv4 iff Inv4')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'xe9fdhwqCqKgChxbx',
        privateLink: 'zj8HQ53WhmQ3WkXp4',
        model: {
            code: `// Consider the following model for courses where students work in teams
sig Student {}

sig Team {	members : some Student }
sig Grade {}
sig Course {
    enrolled : set Student,
    teams : set Team,
    grade : Student -> lone Grade
}

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.

pred Inv1 { // Each student must be enrolled in at least one course

}
${secretTag}
pred Inv1' {
    all s : Student | some enrolled.s	
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3' and Inv4' and Inv5') implies (Inv1 iff Inv1')
}

pred Inv2 { // All the members of a team are enrolled in the respective courses

}
${secretTag}
pred Inv2' {
    all c : Course | c.teams.members in c.enrolled
}
${secretTag}
check Inv2OK {
    (Inv1' and Inv3' and Inv4' and Inv5') implies (Inv2 iff Inv2')
}

pred Inv3 { // Only enrolled students can have a grade in a course

}
${secretTag}
pred Inv3' {
    all c : Course | c.grade in c.enrolled -> Grade
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2' and Inv4' and Inv5') implies (Inv3 iff Inv3')
}

pred Inv4 {
// Each student enrolled in a course belongs to exactly one of its teams

}
${secretTag}
pred Inv4' {
    all c : Course, s : c.enrolled | one (c.teams & members.s)
}
${secretTag}
check Inv4OK {
    (Inv1' and Inv2' and Inv3' and Inv5') implies (Inv4 iff Inv4')
}

pred Inv5 { // All members of a team that already have been graded have the same grade

}
${secretTag}
pred Inv5' {
    all c : Course, t : c.teams | lone (t.members).(c.grade)
}
${secretTag}
check Inv5OK {
    (Inv1' and Inv2' and Inv3' and Inv4') implies (Inv5 iff Inv5')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'EvHauGwoERQ3HHGfc',
        privateLink: 'W79MiiQicjDvEy8Jq',
        model: {
            code: `open util/ordering[Addr]

// Consider the following model of a dynamic memory manager
// A memory address can be allocated to a memory block
sig Addr { 	allocated : lone Block }

// The free memory addresses
sig Free in Addr {}

// Each allocated memory block has a pointer
sig Block { pointer : one Addr }

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.

pred Inv1 { // Each memory address is either free or allocated to a block

}
${secretTag}
pred Inv1' {
    Free = Addr-allocated.Block
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3' and Inv4') implies (Inv1 iff Inv1')
}

pred Inv2 { // A block pointer is one of its allocated addresses

}
${secretTag}
pred Inv2' {
    all b : Block | b.pointer in allocated.b
}
${secretTag}
check Inv2OK {
    (Inv1' and Inv3' and Inv4') implies (Inv2 iff Inv2')
}

pred Inv3 {
// All memory addresses allocated to a block are contiguous

}
${secretTag}
pred Inv3' {
    all b : Block, x,y : allocated.b | (x.nexts & y.prevs) in allocated.b
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2' and Inv4') implies (Inv3 iff Inv3')
}

pred Inv4 {
// The pointer to a block is smaller then all its allocated addresses

}
${secretTag}
pred Inv4' {
    all b : Block, a : allocated.b | lte[b.pointer,a]
}
${secretTag}
check Inv4OK {
    (Inv1' and Inv2' and Inv3') implies (Inv4 iff Inv4')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'ri2bbMKEkonsY66v3',
        privateLink: '2ieT5m4yh3b9qbjdq',
        model: {
            code: `// Consider the following model of a online auction system
sig Product {}
sig Bid {}
sig Auction { product : one Product }
sig User {
    auctions : set Auction,
    bids : Auction -> Bid
}

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.

pred Inv1 { // Every auction belongs to a user

}
${secretTag}
pred Inv1' {
    Auction in User.auctions
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3') implies (Inv1 iff Inv1')
}

pred Inv2 { // A user cannot bid on its own auctions

}
${secretTag}
pred Inv2' {
    all u : User | no u.auctions & u.bids.Bid
}
${secretTag}
check Inv2OK {
    (Inv1' and Inv3') implies (Inv2 iff Inv2')
}

pred Inv3 { // All the bids in an auction are different

}
${secretTag}
pred Inv3' {
    all a : Auction, b : Bid | lone (bids.b).a
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2') implies (Inv3 iff Inv3')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'g8dYNQd3ys3MjbHoL',
        privateLink: 'KYRXKjgRHzvzD2j4N',
        model: {
            code: `// Consider the following simplified model of Java classes
sig Class {
        super : lone Class, 
    vars : set Var
}
one sig Object extends Class {}
sig Var { name : one Name }
sig Name {}

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.
pred Inv1 { // The object class has no instance variables

}
${secretTag}
pred Inv1' {
    no Object.vars
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3' and Inv4') implies (Inv1 iff Inv1')
}

pred Inv2 { // All classes except Object have a superclass

}
${secretTag}
pred Inv2' {
    all c : Class - Object | one c.super
    no Object.super
}
${secretTag}
check Inv2OK {
    (Inv1' and Inv3' and Inv4') implies (Inv2 iff Inv2')
}

pred Inv3 { // A class cannot declare two instance variables with the same name

}
${secretTag}
pred Inv3' {
    all c : Class, disj x,y : c.vars | x.name != y.name
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2' and Inv4') implies (Inv3 iff Inv3')
}

pred Inv4 { // A class cannot inherit from itself

}
${secretTag}
pred Inv4' {
    all c : Class | c not in c.^super
}
${secretTag}
check Inv4OK {
    (Inv1' and Inv2' and Inv3') implies (Inv4 iff Inv4')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: '6umZreF5bnTXmWeTD',
        privateLink: '9EeSuXX3J9mcSmgGh',
        model: {
            code: `open util/ordering[Decision]

// Consider the following model of an academic publisher reviewing system
sig Person {}
abstract sig Decision {}
one sig Reject, Borderline, Accept extends Decision {}

fact {
    Reject.next = Borderline
    Borderline.next = Accept
}

sig Article {
    authors : some Person,
    reviews : Person -> Decision
}
sig Accepted in Article {}

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.
pred Inv1 { // Each article has at most one review by each person

}
${secretTag}
pred Inv1' {
    all a : Article, p : Person | lone p.(a.reviews)
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3' and Inv4') implies (Inv1 iff Inv1')
}

pred Inv2 { // An article cannot be reviewed by its authors

}
${secretTag}
pred Inv2' {
    all a : Article | no a.reviews.Decision & a.authors
}
${secretTag}
check Inv2OK {
    (Inv1' and Inv3' and Inv4') implies (Inv2 iff Inv2')
}

pred Inv3 { // All accepted articles must have at least one review

}
${secretTag}
pred Inv3' {
    all a : Accepted | some a.reviews
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2' and Inv4') implies (Inv3 iff Inv3')
}

pred Inv4 { // All articles with an Accept decision are automatically accepted
    
}
${secretTag}
pred Inv4' {
    (reviews.Accept).Person in Accepted
}
${secretTag}
check Inv4OK {
    (Inv1' and Inv2' and Inv3') implies (Inv4 iff Inv4')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'xoJz9NfK4o8Gs2eDH',
        privateLink: 'BHfvq3t7rQrfoZt8N',
        model: {
            code: `open util/ordering[Position]

// Consider the following model of an automated production line
// The production line consists of several positions in sequence
sig Position {}

// Products are either components assembled in the production line or 
// other resources (e.g. pre-assembled products or base materials)
sig Product {}

// Components are assembled in a given position from other parts
sig Component extends Product {
    parts : set Product,
    position : one Position
}
sig Resource extends Product {}

// Robots work somewhere in the production line
sig Robot {
        position : one Position
}

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.
pred Inv1 { // A component requires at least one part

}
${secretTag}
pred Inv1' {
    all c : Component | some c.parts
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3' and Inv4') implies (Inv1 iff Inv1')
}

pred Inv2 { // A component cannot be a part of itself

}
${secretTag}
pred Inv2' {
    all c : Component | c not in c.^parts
}
${secretTag}
check Inv2OK {
    (Inv1' and Inv3' and Inv4') implies (Inv2 iff Inv2')
}

pred Inv3 { // The position where a component is assembled must have at least one robot

}
${secretTag}
pred Inv3' {
    all c : Component | some position.(c.position) & Robot
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2' and Inv4') implies (Inv3 iff Inv3')
}

pred Inv4 { // The parts required by a component cannot be assembled in a later position
    
}
${secretTag}
pred Inv4' {
    all c : Component, p : c.parts & Component | lte[p.position,c.position]
}
${secretTag}
check Inv4OK {
    (Inv1' and Inv2' and Inv3') implies (Inv4 iff Inv4')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: '4KYLfsxtvCNJThFpp',
        privateLink: 'etBPiN4HGeXu9WY9R',
        model: {
            code: `/* 
    Consider the following model of an online CV platform that allows a
    profile to be updated not only by its owner but also by external institutions,
    to certify that the user indeed has produced certain works. 
    Works must have some unique global identifiers, that are used to
    clarify if two works are in fact the same.
*/

abstract sig Source {}
sig User extends Source {
    profile : set Work,
    visible : set Work
}
sig Institution extends Source {}

sig Id {}
sig Work {
    ids : some Id,
    source : one Source
}

// Specify the following invariants!
// You can check their correctness with the different commands and
// specifying a given invariant you can assume the others to be true.

pred Inv1 { // The works publicly visible in a curriculum must be part of its profile

}
${secretTag}
pred Inv1' {
    all u : User | u.visible in u.profile
}
${secretTag}
check Inv1OK {
    (Inv2' and Inv3' and Inv4') implies (Inv1 iff Inv1')
}

pred Inv2 { // A user profile can only have works added by himself or some external institution

}
${secretTag}
pred Inv2' {
    all u : User | u.profile.source in Institution+u
}
${secretTag}
check Inv2OK {
    (Inv1' and Inv3' and Inv4') implies (Inv2 iff Inv2')
}

pred Inv3 { // The works added to a profile by a given source cannot have common identifiers

}
${secretTag}
pred Inv3' {
    all u : User, disj x,y : u.profile | x.source = y.source implies no (x.ids & y.ids)
}
${secretTag}
check Inv3OK {
    (Inv1' and Inv2' and Inv4') implies (Inv3 iff Inv3')
}

pred Inv4 { // The profile of a user cannot have two visible versions of the same work
    
}
${secretTag}
pred Inv4' {
    all u : User, disj x,y : u.visible | x not in y.^(ids.~ids)
}
${secretTag}
check Inv4OK {
    (Inv1' and Inv2' and Inv3') implies (Inv4 iff Inv4')
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'i5mpZsgf2YarYyepy',
        privateLink: '6NjWouAZtYMgExcSB',
        model: {
            code: `// A graph can be modeled using a set Node containing all nodes and
// a binary relation Edge containing all the edges.
// Using relational logic specify contraints that characterize the following
// particular types of graphs

pred Dag { // a direct acyclic graph

}
pred Ring { // The graph is a single ring, with edges pointing to successors

}
pred Tree { // The graph is a single tree, with edges pointing to parents

}
${secretTag}
sig Node {
    Edge : set Node
}
${secretTag}
pred Dag' {
    all n : Node | n not in n.^Edge
}
${secretTag}
check DagOK { Dag iff Dag' }
${secretTag}
pred Ring' {
    all n : Node | one n.Edge
    all n : Node | Node in n.^Edge
}
${secretTag}
check RingOK { Ring iff Ring' }
${secretTag}
pred Tree' {
    Dag'
    all n : Node | lone n.Edge
    some n : Node | Node-n in ^Edge.n
}
${secretTag}
check TreeOk { Tree iff Tree' }`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'HHqxbmmCu2iN9zNtF',
        privateLink: 'BotLD32mwmgrhGgvS',
        model: {
            code: `sig Person{}
sig Man in Person{}
sig Woman in Person{}

//write a predicate Quizz to check that 
pred Quizz {
    // A person must be a man or a woman
    // A Person cannot be simultaneous man and woman
}

${secretTag}
check solution {
    Quizz iff {no Man & Woman and Person = Man + Woman}
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: 'BAAEJo6RM2e2GcRZt',
        privateLink: 'ZCmPdRb7dwuJRTo6W',
        model: {
            code: `//consider a simplifyed specification of a Graph 
// with arrows between Points
sig Point {}
sig Graph{ edge: Point -> some Point }

// build a predicate Insere
pred Insere[g:Graph,p1: Point, p2:Point,g':Graph] {
    // that inserts an arrow in a Graph g and returns the result in a Graph g'
    
}

${secretTag}
pred InsereSolution[g:Graph,p1: Point, p2:Point,g':Graph] {
g'.edge = g.edge + p1->p2
}

${secretTag}
check Quizz {
    {all g,g':Graph, p,p': Point | Insere[g,p,p',g'] iff (g'.edge = g.edge + p->p') }
}`,
            time: new Date().toLocaleString()
        }
    }, {
        publicLink: '5jabBMzWjWnBeFb64',
        privateLink: 'HZtYgbifqh9xbhX42',
        model: {
            code: `sig Point { edge : some Point }

// build a predicate biconnected
pred biconnected {
    /* that checks if a Graph is biconnected. A biconnected graph is a connected
    and "nonseparable" graph, meaning that if any one vertex were to be removed, 
    the graph will remain connected. Therefore a biconnected graph has no articulation 
    vertices  */
}

fun remedge [ e: edge, p0:Point] : set edge{
    e - p0->Point - Point->p0
}

${secretTag}
pred biconnectedSol {
    all p0: Point, p1,p2 : Point-p0 | p1 in p2.^(remedge[edge, p0])
}

${secretTag}
check Quizz{
    biconnected iff biconnectedSol
}`,
            time: new Date().toLocaleString()
        }
    }]
    initialModels.forEach((n) => {
        // insert the model
        const id = Model.insert(n.model)

        Model.update({ _id: id }, { $set: { original: id } })

        // insert the public link
        Link.insert({
            _id: n.publicLink,
            private: false,
            model_id: id
        })
        // insert the private link
        Link.insert({
            _id: n.privateLink,
            private: true,
            model_id: id
        })
    })
    return initialModels.length
}

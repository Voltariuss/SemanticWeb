const criminal = 'http://dbpedia.org/resource/Luciano_Leggio'

const name = [
    'name',
    'alias',
    'criminalCharge',
    'convictionPenalty',
    'motive',
    'apprehended',
    'victims',
    'country',
    'birthDate',
    'birthPlace',
    'parents',
    'deathDate',
    'deathPlace',
    'comment',
    'occupation',
    'imageName'
]

const predicates = [
    'foaf:name',
    'dbpedia2:alias',
    'dbo:criminalCharge',
    'dbo:convictionPenalty',
    'dbo:motive',
    'dbpedia2:apprehended',
    'dbpedia2:victims',
    'dbo:country',
    'dbo:birthDate',
    'dbo:birthPlace',
    'dbpedia2:parents',
    'dbo:deathDate',
    'dbo:deathPlace',
    'rdfs:comment',
    'dbpedia2:occupation',
    'dbpedia2:imageName'
]

const promises = predicates.map((p) => { return generateRequest(criminal, p) })
promises.push(

);


Promise.all(promises)
    .then(results => {
        // build dom
        buildDOM(results);
    })


function buildDOM(results) {
    console.log(results)
}
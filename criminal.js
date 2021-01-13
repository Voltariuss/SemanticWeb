const criminalURI = 'http://dbpedia.org/resource/John_Edward_Robinson'

const fields = [
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
    'dbo:apprehended',
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

const promises = predicates.map((p) => { return generateRequest(criminalURI, p) })
Promise.all(promises)
    .then(results => {
        // build dom
        buildDOM(results);
    })

function buildDOM(data) {
    console.log('buildDom');
    const criminal = {};

    for (let i = 0; i < fields.length; ++i) {
        criminal[fields[i]] = []
        const bindings = data[i]['results']['bindings'];

        // Si l'API a retourné une ligne
        if (bindings.length > 0) {
            for (let j = 0; j < bindings.length; ++j) {
                criminal[fields[i]].push(bindings[j]['value']);
            }

            // Suppression des lignes non anglaises
            criminal[fields[i]] = criminal[fields[i]].filter(item => {
                return item['xml:lang'] === undefined || item['xml:lang'] == 'en';
            })

            // Si l'API a retourné une ligne non anglaise
            if (criminal[fields[i]][0] != undefined) {
                $('#'+fields[i]).html(criminal[fields[i]][0]['value']);
            }
        }
    }


    requestSameYear('dbo:apprehended', criminal.apprehended[0]['value'], criminalURI).done((data2) => {
        console.log(data2);

        // $('#apprehended_same_year')
    })

    console.log(criminal)

    
}
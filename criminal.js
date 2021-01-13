const urlParams = new URLSearchParams(window.location.search);
const criminalId = urlParams.get('id');
const criminalURI = 'http://dbpedia.org/resource/'+criminalId;



const fields = [
    'name',
    'alias',
    'label',
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
    'rdfs:label',
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

function getResourceIdFromUri(uri) {
    const splitUri = uri.split('/');
    return splitUri[splitUri.length - 1];
}

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


    requestSameYear('dbo:apprehended', criminal.apprehended[0]['value'].split('-')[0], criminalURI).done((data2) => {
        console.log(data2);

        let str = '<ul>';
        for (let k = 0; k < data2['results']['bindings'].length; ++k) {
            const target = getResourceIdFromUri(data2['results']['bindings'][k]['criminal']['value']);

            if (data2['results']['bindings'][k]['label']) {
                // Le nom existe
                str += '<li><a href="./criminal.html?id='+target+'">'+data2['results']['bindings'][k]['label']['value'] + '</a></li>';
            }
            else {
                // Le nom n'existe pas, on prend l'URI
                str += '<li><a href="./criminal.html?id='+target+'">'+data2['results']['bindings'][k]['criminal']['value'] + '</a></li>';
            }
        }
        str += '</ul>';

        $('#apprehended_same_year').append(str);
    })

    console.log(criminal)


}


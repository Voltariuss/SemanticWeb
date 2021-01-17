const urlParams = new URLSearchParams(window.location.search);
const criminalId = urlParams.get('id');
const criminalURI = 'http://dbpedia.org/resource/' + criminalId;

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

$('#criminal_info').hide();
const promises = predicates.map((p) => { return generateRequest(criminalURI, p) })
Promise.all(promises)
    .then(results => {
        $('#criminal_info').show();
        $('#criminal_info_loading').hide();
        // build dom
        buildDOM(results);
    })


function getResourceName(resource, def) {
    if (resource['label']) {
        return resource['label']['value'];
    } else if (resource['name']) {
        return resource['name']['value'];
    } else {
        return resource[def]['value'];
    }
}

function getResourceIdFromUri(uri) {
    const splitUri = uri.split('/');
    return splitUri[splitUri.length - 1];
}

function showSameApprehendedYear(criminal) {
    requestSameYear('dbo:apprehended', criminal.apprehended[0]['value'].split('-')[0], criminalURI).done((other) => {
        let str = '<ul>';
        for (let c of other['results']['bindings']) {
            const target = getResourceIdFromUri(c['criminal']['value']);
            str += '<li><a href="./criminal.html?id=' + target + '">' + getResourceName(c, 'criminal') + '</a></li>';
        }
        str += '</ul>';
        $('#same_apprehended_year_list').append(str);
        $('#same_apprehended_year').show();
        $('#same_apprehended_year_loading').hide();
    });
}


function showSameConvictionPenalty(criminal) {
    requestSameURI('dbo:convictionPenalty', criminal.convictionPenalty[0]['value'], criminalURI).done((other) => {
        let str = '<ul>';
        for (let c of other['results']['bindings']) {
            const target = getResourceIdFromUri(c['criminal']['value']);
            str += '<li><a href="./criminal.html?id=' + target + '">' + getResourceName(c, 'criminal') + '</a></li>';
        }
        str += '</ul>';
        $('#same_conviction_penalty_list').append(str);
        $('#same_conviction_penalty').show();
        $('#same_conviction_penalty_loading').hide();
    });
}

function showSimilarCriminalCharge(criminal) {
    let str = '<ul>';

    const promises = criminal.criminalCharge[0]['value'].split(/[;.,()]/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(piece => {
            console.log(piece)
            return requestContainsText('dbo:criminalCharge', piece.toLowerCase(), criminalURI)
        });

    Promise.all(promises).then(pieces => {

        for (let piece of pieces) {
            for (let c of piece['results']['bindings']) {
                const target = getResourceIdFromUri(c['criminal']['value']);
                str += '<li><a href="./criminal.html?id=' + target + '">' + getResourceName(c, 'criminal') + '</a> (' + c['value']['value'] + ') </li>';
            }
        }
        str += '</ul>';
        $('#similar_criminal_charge_list').append(str);
        $('#similar_criminal_charge').show();
        $('#similar_criminal_charge_loading').hide();
    })

}

function showSimilarMotive(criminal) {
    let str = '<ul>';

    const promises = criminal.motive[0]['value'].split(/[;.,()]/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(piece => {
            return requestContainsText('dbo:motive', piece.toLowerCase(), criminalURI)
        });

    Promise.all(promises).then(pieces => {
        for (let piece of pieces) {
            for (let c of piece['results']['bindings']) {
                const target = getResourceIdFromUri(c['criminal']['value']);
                str += '<li><a href="./criminal.html?id=' + target + '">' + getResourceName(c, 'criminal') + '</a> (' + c['value']['value'] + ') </li>';
            }
        }
        str += '</ul>';
        $('#similar_motive_list').append(str);
        $('#similar_motive').show();
        $('#similar_motive_loading').hide();
    });

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
            });

            // Si l'API a retourné une ligne anglaise
            if (criminal[fields[i]][0] != undefined) {
                if (fields[i] == 'imageName') {
                    const imgName = criminal[fields[i]][0]['value']
                    $('#' + fields[i]).html(`<img src="https://wikipedia.org/wiki/Special:FilePath/${imgName}" title="${imgName}" alt="${imgName}" />`)
                } else {
                    $('#' + fields[i]).html(criminal[fields[i]][0]['value']);
                }
            }
        }
    }

    // Show criminals with the same apprehended year
    if (criminal.apprehended.length > 0) {
        showSameApprehendedYear(criminal);
    } else {
        $('#same_apprehended_year').hide();
    }

    // Show criminals with the same conviction penalty
    if (criminal.convictionPenalty.length > 0) {
        showSameConvictionPenalty(criminal);
    } else {
        $('#same_conviction_penalty').hide();
    }

    // Show criminals with similar criminal charge
    if (criminal.criminalCharge.length > 0) {
        showSimilarCriminalCharge(criminal);
    } else {
        $('#similar_criminal_charge').hide();
    }

    // Show criminals with similar motive
    if (criminal.motive.length > 0) {
        showSimilarMotive(criminal);
    } else {
        $('#similar_motive').hide();
    }

    console.log(criminal);

}

